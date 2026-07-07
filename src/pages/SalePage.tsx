import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Layers,
  Loader2,
  Minus,
  PackagePlus,
  PauseCircle,
  Pencil,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Form } from "@/components/ui/form";
import { PosModal } from "@/components/shared/pos/PosModal";
import { RestockModal } from "@/components/shared/pos/RestockModal";
import { OrderStatusBadge } from "@/components/shared/pos/OrderStatusBadge";
import { ApiErrorAlert } from "@/components/forms/ApiErrorAlert";
import { FormCustomerCombobox } from "@/components/forms/FormCustomerCombobox";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { FormTextareaField } from "@/components/forms/FormTextareaField";
import { CardGridSkeleton } from "@/components/shared/pos/TableSkeleton";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/shared/PageStates";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import { PosFilterTabs } from "@/components/shared/pos/PosFilterTabs";
import { PosSearchBar } from "@/components/shared/pos/PosSearchBar";
import { PosToaster, usePosToast } from "@/components/shared/pos/PosToast";
import { useAppliedSearch } from "@/hooks/useAppliedSearch";
import { useSaleCartResize } from "@/hooks/useSaleCartResize";
import { useUrlEnumParam, useUrlLimit, useUrlPage, useUrlStringParam, useUrlQueryUpdater } from "@/hooks/useUrlQuery";
import { useCategories } from "@/hooks/useAdmin";
import { getCustomer } from "@/apis/customer.api";
import { useOrderReceipt } from "@/hooks/useOrders";
import {
  useCheckout,
  usePosProducts,
} from "@/hooks/usePos";
import {
  calcCartSubtotal,
  calcNetTotal,
  getLineDiscount,
  getLineFinalPrice,
  getUnitPrice,
  type CartLine,
} from "@/lib/cart";
import { formatDateTime, formatMoney, toMoney } from "@/lib/format";
import { getOrderNetTotal } from "@/lib/order";
import {
  STOCK_STATUS_FILTERS,
  stockStatusToApi,
  type StockStatusFilter,
} from "@/lib/listFilters";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/queryConfig";
import { resetUrlPage, writeUrlString } from "@/lib/urlQuery";
import {
  clearPersistedCart,
  createDraftId,
  loadDrafts,
  loadPersistedCart,
  persistCart,
  saveDrafts,
  SALE_CLEAR_CART_EVENT,
  tryAddToCart,
  type SaleDraft,
} from "@/lib/sale";
import type { OrderDetail, PosProduct } from "@/types/api";
import {
  getCheckoutSchema,
  validatePaidAmount,
  type CheckoutFormValues,
} from "@/validation/checkout.validation";
import { cn } from "@/lib/utils";

const PAYMENT_OPTIONS = [
  { value: "CASH", label: "CASH" },
  { value: "KBZPAY", label: "KBZPAY" },
  { value: "WAVEPAY", label: "WAVEPAY" },
  { value: "CARD", label: "CARD" },
  { value: "BANKING", label: "BANKING" },
];

const saleCheckoutControlClass =
  "h-8 text-xs lg:h-8 lg:text-xs xl:h-9 xl:text-sm";
const saleCheckoutLabelClass = "text-[11px] xl:text-xs";
const saleCheckoutTextareaClass =
  "min-h-[3.5rem] resize-none text-xs xl:min-h-[4.5rem] xl:text-sm";

export function SalePage() {
  const { t } = useTranslation();
  const { toasts, showToast, dismiss } = usePosToast();
  const {
    saleLayoutRef,
    cartColumnRef,
    cartHeaderRef,
    cartListRef,
    listHeightPx,
    listRatio,
    cartWidthPx,
    widthRatio,
    minListRatio,
    maxListRatio,
    minWidthRatio,
    maxWidthRatio,
    startListResize,
    startWidthResize,
  } = useSaleCartResize();
  const {
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    resetSearch,
  } = useAppliedSearch();
  const updateUrl = useUrlQueryUpdater();
  const [topCategoryId] = useUrlStringParam("top");
  const [subCategoryId, setSubCategoryId] = useUrlStringParam("sub");
  const [cart, setCart] = useState<CartLine[]>(() => loadPersistedCart());
  const cartRef = useRef(cart);
  cartRef.current = cart;
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<SaleDraft[]>(() => loadDrafts());
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [mobileView, setMobileView] = useState<"products" | "cart">("products");
  const [productPage, setProductPage] = useUrlPage();
  const [productLimit, setProductLimit] = useUrlLimit(
    PAGE_SIZE.saleProducts,
    PAGE_SIZE_OPTIONS.saleProducts,
  );
  const [stockFilter, setStockFilter] = useUrlEnumParam<StockStatusFilter>(
    "stock",
    "ALL",
    STOCK_STATUS_FILTERS,
  );
  const [allProducts, setAllProducts] = useState<PosProduct[]>([]);
  const [completedOrder, setCompletedOrder] = useState<OrderDetail | null>(
    null,
  );
  const [selectedCustomerName, setSelectedCustomerName] = useState("");

  const topCategoriesQuery = useCategories("TOP");
  const subCategoriesQuery = useCategories("SUB");

  const topCategoryOptions = useMemo(
    () => topCategoriesQuery.data?.items ?? [],
    [topCategoriesQuery.data?.items],
  );

  const subCategoryOptions = useMemo(() => {
    const items = subCategoriesQuery.data?.items ?? [];
    if (!topCategoryId) return items;
    return items.filter((category) => category.parentId === topCategoryId);
  }, [subCategoriesQuery.data?.items, topCategoryId]);

  useEffect(() => {
    if (
      subCategoryId &&
      !subCategoryOptions.some((category) => category.id === subCategoryId)
    ) {
      updateUrl((params) => {
        params.delete("sub");
      }, { resetPage: false });
    }
  }, [subCategoryId, subCategoryOptions, updateUrl]);

  useEffect(() => {
    persistCart(cart);
  }, [cart]);

  useEffect(() => {
    saveDrafts(drafts);
  }, [drafts]);

  useEffect(() => {
    function handleClearCartEvent() {
      cartRef.current = [];
      setCart([]);
      clearPersistedCart();
      showToast("info", t("pos.sale.cartCleared"));
    }
    window.addEventListener(SALE_CLEAR_CART_EVENT, handleClearCartEvent);
    return () => {
      window.removeEventListener(SALE_CLEAR_CART_EVENT, handleClearCartEvent);
    };
  }, [t, showToast]);

  const hasCategoryFilters = Boolean(topCategoryId || subCategoryId);

  function resetCategoryFilters() {
    updateUrl((params) => {
      params.delete("top");
      params.delete("sub");
      resetUrlPage(params);
    });
    setAllProducts([]);
  }

  const productQueryParams = useMemo(
    () => ({
      search: appliedSearch || undefined,
      topCategoryId: topCategoryId || undefined,
      subCategoryId: subCategoryId || undefined,
      stockStatus: stockStatusToApi(stockFilter),
      page: productPage,
      limit: productLimit,
    }),
    [
      appliedSearch,
      topCategoryId,
      subCategoryId,
      stockFilter,
      productPage,
      productLimit,
    ],
  );

  const productQuery = usePosProducts(productQueryParams, { keepPrevious: false });

  useEffect(() => {
    setAllProducts([]);
  }, [appliedSearch, topCategoryId, subCategoryId, stockFilter, productLimit]);

  useEffect(() => {
    if (!productQuery.data || productQuery.isFetching) return;
    setAllProducts((prev) => {
      if (productPage === 1) return productQuery.data.items;
      const existingIds = new Set(prev.map((p) => p.productId));
      const next = productQuery.data.items.filter(
        (p) => !existingIds.has(p.productId),
      );
      return [...prev, ...next];
    });
  }, [productQuery.data, productQuery.isFetching, productPage]);

  const checkoutMutation = useCheckout();

  const subtotal = useMemo(() => calcCartSubtotal(cart), [cart]);

  const checkoutSchema = useMemo(() => getCheckoutSchema(t), [t]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerId: "",
      status: "COMPLETED",
      paymentType: "CASH",
      paidAmount: 0,
      orderDiscount: 0,
      notes: "",
    },
  });

  const orderDiscount = form.watch("orderDiscount");
  const paymentType = form.watch("paymentType");
  const paidAmount = form.watch("paidAmount");

  const netTotal = useMemo(
    () => calcNetTotal(cart, Number(orderDiscount) || 0),
    [cart, orderDiscount],
  );

  const effectivePaid = paidAmount > 0 ? paidAmount : netTotal;
  const changeAmount = Math.max(effectivePaid - netTotal, 0);

  useEffect(() => {
    if (paymentType === "CASH" && netTotal > 0) {
      form.setValue("paidAmount", netTotal, { shouldValidate: true });
    }
  }, [netTotal, paymentType, form]);

  const addProductToCart = useCallback(
    (product: PosProduct) => {
      const { lines, result } = tryAddToCart(cartRef.current, product);
      cartRef.current = lines;
      setCart(lines);

      if (result === "max_stock") {
        showToast(
          "warning",
          t("pos.sale.maxStockReached", { name: product.name }),
        );
      } else if (result === "added") {
        showToast(
          "success",
          t("pos.sale.addedToCart", { name: product.name }),
        );
      }
    },
    [t, showToast],
  );

  function updateQty(productId: string, delta: number) {
    let maxStockProductName: string | null = null;
    const nextCart = cartRef.current
      .map((line) => {
        if (line.product.productId !== productId) return line;
        const nextQty = line.quantity + delta;
        if (nextQty <= 0) return null;
        if (nextQty > line.product.stockQty) {
          maxStockProductName = line.product.name;
          return line;
        }
        return { ...line, quantity: nextQty };
      })
      .filter(Boolean) as CartLine[];

    cartRef.current = nextCart;
    setCart(nextCart);

    if (maxStockProductName) {
      showToast(
        "warning",
        t("pos.sale.maxStockReached", { name: maxStockProductName }),
      );
    }
  }

  function removeLine(productId: string) {
    const nextCart = cartRef.current.filter(
      (line) => line.product.productId !== productId,
    );
    cartRef.current = nextCart;
    setCart(nextCart);
  }

  function handleClearCart() {
    cartRef.current = [];
    setCart([]);
    clearPersistedCart();
    showToast("info", t("pos.sale.cartCleared"));
  }

  function handleSaveLineEdit(
    productId: string,
    patch: { quantity: number; unitPrice: number; discount: number },
  ) {
    const nextCart = cartRef.current.map((line) =>
      line.product.productId === productId
        ? {
            ...line,
            quantity: patch.quantity,
            unitPrice: patch.unitPrice,
            discount: patch.discount,
          }
        : line,
    );
    cartRef.current = nextCart;
    setCart(nextCart);
    setEditingProductId(null);
  }

  const editingLine = useMemo(
    () => cart.find((line) => line.product.productId === editingProductId) ?? null,
    [cart, editingProductId],
  );

  function buildDraftFromCurrent(): SaleDraft | null {
    if (cartRef.current.length === 0) return null;
    const values = form.getValues();
    const label =
      values.customerId && selectedCustomerName.trim()
        ? selectedCustomerName.trim()
        : t("pos.sale.draftLabel", { time: formatDateTime(new Date().toISOString()) });
    return {
      id: createDraftId(),
      label,
      createdAt: Date.now(),
      lines: cartRef.current,
      checkout: {
        customerId: values.customerId || "",
        status: values.status,
        paymentType: values.paymentType,
        paidAmount: values.paidAmount || 0,
        orderDiscount: values.orderDiscount || 0,
        notes: values.notes?.trim() || "",
      },
    };
  }

  function resetCartAndForm() {
    cartRef.current = [];
    setCart([]);
    clearPersistedCart();
    form.reset({
      customerId: "",
      status: "COMPLETED",
      paymentType: "CASH",
      paidAmount: 0,
      orderDiscount: 0,
      notes: "",
    });
    setSelectedCustomerName("");
  }

  function handleHoldOrder() {
    const draft = buildDraftFromCurrent();
    if (!draft) return;
    setDrafts((prev) => [draft, ...prev]);
    resetCartAndForm();
    showToast("success", t("pos.sale.held"));
  }

  function handleResumeDraft(id: string) {
    const draft = drafts.find((d) => d.id === id);
    if (!draft) return;

    const currentDraft = buildDraftFromCurrent();
    setDrafts((prev) => {
      const withoutResumed = prev.filter((d) => d.id !== id);
      return currentDraft ? [currentDraft, ...withoutResumed] : withoutResumed;
    });

    cartRef.current = draft.lines;
    setCart(draft.lines);
    form.reset({
      customerId: draft.checkout.customerId,
      status: draft.checkout.status ?? "COMPLETED",
      paymentType: draft.checkout.paymentType,
      paidAmount: draft.checkout.paidAmount,
      orderDiscount: draft.checkout.orderDiscount,
      notes: draft.checkout.notes,
    });
    if (draft.checkout.customerId) {
      void getCustomer(draft.checkout.customerId)
        .then((customer) => setSelectedCustomerName(customer.name))
        .catch(() => setSelectedCustomerName(""));
    } else {
      setSelectedCustomerName("");
    }
    setDraftsOpen(false);
    showToast("info", t("pos.sale.draftResumed"));
  }

  function handleDeleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast("info", t("pos.sale.draftDeleted"));
  }

  const cartItemCount = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity, 0),
    [cart],
  );

  function onCheckout(values: CheckoutFormValues) {
    if (cart.length === 0) return;

    const paidError = validatePaidAmount(values.paidAmount, netTotal, t);
    if (paidError) {
      form.setError("paidAmount", { type: "manual", message: paidError });
      return;
    }

    const paid = values.paidAmount > 0 ? values.paidAmount : netTotal;
    checkoutMutation.mutate(
      {
        customerId: values.customerId || null,
        items: cart.map((line) => ({
          productId: line.product.productId,
          quantity: line.quantity,
          unitPrice: toMoney(getUnitPrice(line)) || getLineFinalPrice(line),
          discount: toMoney(getLineDiscount(line)),
        })),
        status: values.status,
        paymentType: values.paymentType,
        paidAmount: paid,
        orderDiscount: values.orderDiscount || 0,
        notes: values.notes?.trim() || null,
      },
      {
        onSuccess: (order) => {
          setCompletedOrder(order);
          cartRef.current = [];
          setCart([]);
          clearPersistedCart();
          form.reset({
            customerId: "",
            status: "COMPLETED",
            paymentType: "CASH",
            paidAmount: 0,
            orderDiscount: 0,
            notes: "",
          });
        },
      },
    );
  }

  if (completedOrder) {
    return (
      <SaleSuccessScreen
        order={completedOrder}
        onNewSale={() => setCompletedOrder(null)}
      />
    );
  }

  const statusOptions = [
    { value: "COMPLETED", label: t("pos.sale.statusCompleted") },
    { value: "PROCESSING", label: t("pos.sale.statusProcessing") },
  ];

  const totalProductPages = productQuery.data?.meta.totalPages ?? 1;
  const hasMoreProducts = productPage < totalProductPages;
  const totalProducts = productQuery.data?.meta.total ?? 0;

  return (
    <>
    <PosPageShell
      ref={saleLayoutRef}
      fullHeight
      className="flex h-full min-h-0 flex-col overflow-hidden lg:flex-row"
    >
      <div className="flex shrink-0 gap-1 border-b border-border bg-card p-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView("products")}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            mobileView === "products"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {t("pos.sale.tabProducts")}
        </button>
        <button
          type="button"
          onClick={() => setMobileView("cart")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
            mobileView === "cart"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted",
          )}
        >
          {t("pos.sale.cart")}
          {cartItemCount > 0 && (
            <span
              className={cn(
                "inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-semibold leading-none",
                mobileView === "cart"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      <div
        ref={cartColumnRef}
        className={cn(
          "min-h-0 w-full flex-col overflow-hidden border-b border-border bg-card lg:h-full lg:w-[var(--sale-cart-width)] lg:max-w-[var(--sale-cart-width)] lg:basis-[var(--sale-cart-width)] lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r",
          mobileView === "cart" ? "flex max-lg:flex-1" : "hidden lg:flex",
        )}
        style={
          {
            "--sale-cart-width":
              cartWidthPx > 0 ? `${cartWidthPx}px` : `${Math.round(widthRatio * 100)}%`,
          } as React.CSSProperties
        }
      >
        <div
          ref={cartHeaderRef}
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5 sm:px-5"
        >
          <p className="min-w-0 truncate text-sm">
            <span className="font-medium text-foreground">{t("pos.sale.cart")}</span>
            <span className="text-muted-foreground">
              {" "}
              · {t("pos.sale.cartItems", { count: cartItemCount })}
            </span>
          </p>

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setDraftsOpen(true)}
            >
              <Layers className="size-3.5" />
              {t("pos.sale.drafts")}
              {drafts.length > 0 && (
                <span className="ml-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold leading-none text-primary-foreground">
                  {drafts.length}
                </span>
              )}
            </Button>

            {cart.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={handleHoldOrder}
              >
                <PauseCircle className="size-3.5" />
                {t("pos.sale.hold")}
              </Button>
            )}

            {cart.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={handleClearCart}
              >
                <Trash2 className="size-3.5" />
                {t("pos.sale.clearCart")}
              </Button>
            )}
          </div>
        </div>

        <div
          ref={cartListRef}
          className={cn(
            "flex shrink-0 flex-col overflow-hidden px-4 py-3 sm:px-5",
            listHeightPx <= 0 && "min-h-0 flex-[0.58]",
          )}
          style={listHeightPx > 0 ? { height: listHeightPx } : undefined}
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/70 bg-card">
            {cart.length === 0 ? (
              <SaleCartEmpty />
            ) : (
              <>
              <div
                className="grid shrink-0 grid-cols-[minmax(0,1fr)_88px_72px_32px] items-center gap-2 border-b border-border/70 bg-muted/50 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground sm:grid-cols-[minmax(0,1fr)_96px_80px_36px] sm:px-3.5"
                role="row"
              >
                <span>{t("pos.stock.product")}</span>
                <span className="text-center">{t("pos.stock.qty")}</span>
                <span className="text-right">{t("pos.sale.total")}</span>
                <span className="sr-only">{t("pos.common.delete")}</span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto">
                {cart.map((line) => (
                  <div
                    key={line.product.productId}
                    className="grid grid-cols-[minmax(0,1fr)_88px_72px_32px] items-center gap-2 border-b border-border/50 px-3 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_96px_80px_36px] sm:px-3.5"
                  >
                    <button
                      type="button"
                      onClick={() => setEditingProductId(line.product.productId)}
                      className="group flex min-w-0 items-center gap-1.5 rounded-md py-0.5 pr-1 text-left transition-colors hover:text-primary"
                      title={t("pos.sale.editItem")}
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-1">
                          <span className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                            {line.product.name}
                          </span>
                          <Pencil className="size-3 shrink-0 text-muted-foreground/60 group-hover:text-primary" />
                        </span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
                          {formatMoney(getLineFinalPrice(line))}
                          {getLineDiscount(line) > 0 && (
                            <span className="text-[11px] text-muted-foreground/70 line-through">
                              {formatMoney(getUnitPrice(line))}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>

                    <div className="flex items-center justify-center gap-0.5">
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-7 rounded-md"
                        onClick={() => updateQty(line.product.productId, -1)}
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="min-w-7 text-center text-sm font-semibold tabular-nums">
                        {line.quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        className="size-7 rounded-md"
                        onClick={() => updateQty(line.product.productId, 1)}
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>

                    <p className="text-right text-sm font-semibold tabular-nums">
                      {formatMoney(getLineFinalPrice(line) * line.quantity)}
                    </p>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeLine(line.product.productId)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </div>
        </div>

        <div
          role="separator"
          aria-orientation="horizontal"
          aria-valuemin={Math.round(minListRatio * 100)}
          aria-valuemax={Math.round(maxListRatio * 100)}
          aria-valuenow={Math.round(listRatio * 100)}
          aria-label={t("pos.sale.resizeCartList")}
          onPointerDown={startListResize}
          className="group flex h-2.5 shrink-0 cursor-ns-resize touch-none select-none items-center justify-center border-y border-border/60 bg-muted/20 hover:bg-muted/40 active:bg-muted/50"
        >
          <span className="h-1 w-10 rounded-full bg-border transition-colors group-hover:bg-muted-foreground/50" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border bg-card">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onCheckout)}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <FormCustomerCombobox
                    control={form.control}
                    name="customerId"
                    label={t("pos.sale.member")}
                    walkInLabel={t("pos.sale.walkIn")}
                    labelClassName={saleCheckoutLabelClass}
                    controlClassName={saleCheckoutControlClass}
                    onCustomerChange={(customer) =>
                      setSelectedCustomerName(customer?.name ?? "")
                    }
                  />
                  <FormSelect
                    control={form.control}
                    name="paymentType"
                    label={t("pos.sale.paymentType")}
                    options={PAYMENT_OPTIONS}
                    size="sm"
                    labelClassName={saleCheckoutLabelClass}
                    controlClassName={saleCheckoutControlClass}
                  />
                </div>

                <FormSelect
                  control={form.control}
                  name="status"
                  label={t("pos.sale.orderStatus")}
                  options={statusOptions}
                  size="sm"
                  labelClassName={saleCheckoutLabelClass}
                  controlClassName={saleCheckoutControlClass}
                />

                <div className="grid grid-cols-2 gap-2">
                  <FormTextField
                    control={form.control}
                    name="paidAmount"
                    label={t("pos.sale.paidAmount")}
                    type="number"
                    min={0}
                    labelClassName={saleCheckoutLabelClass}
                    controlClassName={saleCheckoutControlClass}
                  />
                  <FormTextField
                    control={form.control}
                    name="orderDiscount"
                    label={t("pos.sale.orderDiscount")}
                    type="number"
                    min={0}
                    labelClassName={saleCheckoutLabelClass}
                    controlClassName={saleCheckoutControlClass}
                  />
                </div>

                <FormTextareaField
                  control={form.control}
                  name="notes"
                  label={t("pos.sale.orderNotes")}
                  placeholder={t("pos.sale.orderNotesPlaceholder")}
                  rows={2}
                  labelClassName={saleCheckoutLabelClass}
                  controlClassName={saleCheckoutTextareaClass}
                />

                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs xl:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {t("pos.sale.subtotal")}{" "}
                      <span className="font-medium text-foreground">
                        {formatMoney(subtotal)}
                      </span>
                    </span>
                    {Number(orderDiscount) > 0 && (
                      <span className="text-muted-foreground">
                        −{formatMoney(Number(orderDiscount) || 0)}
                      </span>
                    )}
                  </div>
                  {paymentType === "CASH" && changeAmount > 0 && (
                    <span className="font-medium text-success-foreground">
                      {t("pos.sale.change")}: {formatMoney(changeAmount)}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 space-y-2 border-t border-border bg-card px-4 py-3 sm:px-5">
                <ApiErrorAlert
                  error={checkoutMutation.error}
                  fallback={t("pos.sale.checkoutError")}
                />

                <Button
                  type="submit"
                  className="h-9 w-full text-sm font-semibold xl:h-10"
                  disabled={cart.length === 0 || checkoutMutation.isPending}
                >
                  {checkoutMutation.isPending
                    ? t("pos.sale.processing")
                    : `${t("pos.sale.checkout")} · ${formatMoney(netTotal)}`}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={Math.round(minWidthRatio * 100)}
        aria-valuemax={Math.round(maxWidthRatio * 100)}
        aria-valuenow={Math.round(widthRatio * 100)}
        aria-label={t("pos.sale.resizeCartWidth")}
        onPointerDown={startWidthResize}
        className="group hidden h-full w-2.5 shrink-0 cursor-ew-resize touch-none select-none items-center justify-center border-x border-border/60 bg-muted/20 hover:bg-muted/40 active:bg-muted/50 lg:flex"
      >
        <span className="h-10 w-1 rounded-full bg-border transition-colors group-hover:bg-muted-foreground/50" />
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 flex-col lg:min-w-0",
          mobileView === "products" ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="shrink-0 border-b border-border/80 bg-card px-3 py-2 sm:px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PosSearchBar
                value={searchInput}
                onChange={setSearchInput}
                onSubmit={() => {
                  submitSearch();
                  setAllProducts([]);
                }}
                onClear={() => {
                  resetSearch();
                  setAllProducts([]);
                }}
                placeholder={t("pos.sale.searchProducts")}
                className="w-full max-w-none flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="h-9 shrink-0 gap-1.5 px-3"
                onClick={() => setRestockOpen(true)}
                title={t("pos.stock.restock")}
              >
                <PackagePlus className="size-4 shrink-0" />
                <span className="hidden sm:inline">{t("pos.stock.restock")}</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <Select
                id="sale-top-category"
                aria-label={t("pos.settings.topCategory")}
                value={topCategoryId}
                className="h-9 text-sm"
                onChange={(e) => {
                  updateUrl((params) => {
                    writeUrlString(params, "top", e.target.value);
                    params.delete("sub");
                    resetUrlPage(params);
                  });
                  setAllProducts([]);
                }}
              >
                <option value="">{t("pos.sale.allCategories")}</option>
                {topCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Select
                id="sale-sub-category"
                aria-label={t("pos.settings.subCategory")}
                value={subCategoryId}
                className="h-9 text-sm"
                onChange={(e) => {
                  setSubCategoryId(e.target.value);
                  setAllProducts([]);
                }}
                disabled={subCategoryOptions.length === 0}
              >
                <option value="">{t("pos.sale.allSubCategories")}</option>
                {subCategoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 w-full gap-1.5 px-2.5 sm:col-span-2 xl:col-span-1 xl:w-auto"
                disabled={!hasCategoryFilters}
                onClick={resetCategoryFilters}
                title={t("pos.sale.resetCategories")}
              >
                <RotateCcw className="size-3.5 shrink-0" />
                {t("pos.sale.resetCategories")}
              </Button>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <PosFilterTabs
                value={stockFilter}
                options={STOCK_STATUS_FILTERS}
                onChange={setStockFilter}
                getLabel={(value) => t(`pos.filters.stock.${value}`)}
                align="start"
                className="min-w-0 w-full sm:flex-1"
              />
              <div className="flex shrink-0 items-center gap-2 self-stretch sm:self-auto">
                <span className="whitespace-nowrap text-xs font-medium text-muted-foreground">
                  {t("pos.common.batchSize")}
                </span>
                <Select
                  aria-label={t("pos.common.batchSize")}
                  value={String(productLimit)}
                  onChange={(event) => setProductLimit(Number(event.target.value))}
                  className="h-9 w-[4.75rem] shrink-0 text-sm"
                >
                  {PAGE_SIZE_OPTIONS.saleProducts.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {productQuery.isFetching && productPage === 1 && allProducts.length === 0 && (
            <CardGridSkeleton />
          )}
          {productQuery.isError && <ErrorState />}
          {!productQuery.isFetching && allProducts.length === 0 && (
            <EmptyState message={t("pos.sale.noProducts")} />
          )}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]">
            {allProducts.map((product) => (
              <SaleProductCard
                key={product.productId}
                product={product}
                onAdd={() => addProductToCart(product)}
              />
            ))}
          </div>

          {hasMoreProducts && (
            <div className="mt-6 flex flex-col items-center gap-2.5 pb-1">
              {totalProducts > 0 && !productQuery.isFetching && (
                <p className="text-xs font-medium text-muted-foreground/80">
                  {t("pos.sale.productsShown", {
                    shown: allProducts.length,
                    total: totalProducts,
                  })}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={productQuery.isFetching}
                onClick={() => setProductPage(productPage + 1)}
                className="h-9 min-w-[9.5rem] rounded-full border-border/70 bg-card px-5 text-sm font-medium shadow-sm hover:bg-muted/40"
              >
                {productQuery.isFetching ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    {t("pos.common.loading")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                    {t("pos.sale.loadMore")}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {mobileView === "products" && cart.length > 0 && (
        <div className="shrink-0 border-t border-border bg-card p-3 lg:hidden">
          <Button
            type="button"
            className="h-11 w-full justify-between text-sm font-semibold"
            onClick={() => setMobileView("cart")}
          >
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="size-4" />
              {t("pos.sale.cartItems", { count: cartItemCount })}
            </span>
            <span className="flex items-center gap-1.5">
              {formatMoney(netTotal)}
              <span className="opacity-80">· {t("pos.sale.viewCart")}</span>
            </span>
          </Button>
        </div>
      )}
    </PosPageShell>
    {editingLine && (
      <CartItemEditModal
        line={editingLine}
        onClose={() => setEditingProductId(null)}
        onSave={(patch) =>
          handleSaveLineEdit(editingLine.product.productId, patch)
        }
      />
    )}
    {draftsOpen && (
      <DraftsModal
        drafts={drafts}
        onClose={() => setDraftsOpen(false)}
        onResume={handleResumeDraft}
        onDelete={handleDeleteDraft}
      />
    )}
    {restockOpen && (
      <RestockModal
        onClose={() => setRestockOpen(false)}
        onSuccess={() => showToast("success", t("pos.stock.restockSuccess"))}
      />
    )}
    <PosToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

function CartItemEditModal({
  line,
  onClose,
  onSave,
}: {
  line: CartLine;
  onClose: () => void;
  onSave: (patch: {
    quantity: number;
    unitPrice: number;
    discount: number;
  }) => void;
}) {
  const { t } = useTranslation();
  const maxQty = line.product.stockQty;
  const [quantity, setQuantity] = useState(String(line.quantity));
  const [unitPrice, setUnitPrice] = useState(String(getUnitPrice(line)));
  const [discount, setDiscount] = useState(String(getLineDiscount(line)));

  const qtyNum = Math.floor(Number(quantity));
  const priceNum = Number(unitPrice);
  const discountNum = Number(discount);

  const qtyError =
    !Number.isFinite(qtyNum) || qtyNum < 1
      ? t("pos.sale.editQtyMin")
      : qtyNum > maxQty
        ? t("pos.sale.maxStockReached", { name: line.product.name })
        : null;
  const priceError =
    !Number.isFinite(priceNum) || priceNum < 0
      ? t("pos.validation.minZero")
      : null;
  const discountError =
    !Number.isFinite(discountNum) || discountNum < 0
      ? t("pos.validation.minZero")
      : discountNum > priceNum
        ? t("pos.sale.editDiscountTooHigh")
        : null;

  const hasError = Boolean(qtyError || priceError || discountError);
  const lineTotal = Math.max(priceNum - discountNum, 0) * (qtyNum > 0 ? qtyNum : 0);

  function handleSubmit() {
    if (hasError) return;
    onSave({
      quantity: qtyNum,
      unitPrice: priceNum,
      discount: discountNum,
    });
  }

  return (
    <PosModal
      title={t("pos.sale.editItem")}
      description={line.product.name}
      onClose={onClose}
      closeLabel={t("pos.sale.cancel")}
    >
      <div className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("pos.sale.quantity")}
          </label>
          <Input
            type="number"
            min={1}
            max={maxQty}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoFocus
          />
          {qtyError && (
            <p className="text-xs font-medium text-destructive">{qtyError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("pos.sale.unitPrice")}
          </label>
          <Input
            type="number"
            min={0}
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
          {priceError && (
            <p className="text-xs font-medium text-destructive">{priceError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground">
            {t("pos.sale.itemDiscount")}
          </label>
          <Input
            type="number"
            min={0}
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
          {discountError && (
            <p className="text-xs font-medium text-destructive">
              {discountError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{t("pos.sale.lineTotal")}</span>
          <span className="font-semibold tabular-nums">
            {formatMoney(lineTotal)}
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("pos.sale.cancel")}
          </Button>
          <Button type="button" disabled={hasError} onClick={handleSubmit}>
            {t("pos.sale.save")}
          </Button>
        </div>
      </div>
    </PosModal>
  );
}

function DraftsModal({
  drafts,
  onClose,
  onResume,
  onDelete,
}: {
  drafts: SaleDraft[];
  onClose: () => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <PosModal
      title={t("pos.sale.drafts")}
      onClose={onClose}
      closeLabel={t("pos.sale.cancel")}
    >
      <div className="mt-4">
        {drafts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
            {t("pos.sale.noDrafts")}
          </p>
        ) : (
          <ul className="space-y-2">
            {drafts.map((draft) => {
              const itemCount = draft.lines.reduce(
                (sum, line) => sum + line.quantity,
                0,
              );
              const total = calcNetTotal(
                draft.lines,
                draft.checkout.orderDiscount,
              );
              return (
                <li
                  key={draft.id}
                  className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {draft.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {t("pos.sale.cartItems", { count: itemCount })} ·{" "}
                      {formatMoney(total)} · {formatDateTime(
                        new Date(draft.createdAt).toISOString(),
                      )}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 shrink-0"
                    onClick={() => onResume(draft.id)}
                  >
                    {t("pos.sale.resume")}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDelete(draft.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PosModal>
  );
}

function SaleCartEmpty() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/40">
        <ShoppingCart className="size-6 text-muted-foreground" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">
        {t("pos.sale.emptyCart")}
      </p>
      <p className="mt-1.5 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
        {t("pos.sale.emptyCartHint")}
      </p>
    </div>
  );
}

function SaleProductCard({
  product,
  onAdd,
}: {
  product: PosProduct;
  onAdd: () => void;
}) {
  const { t } = useTranslation();
  const inStock = product.isSellable;
  const lowStock = inStock && product.stockQty <= 5;

  const stockLabel = !inStock
    ? t("pos.sale.outOfStock")
    : t("pos.sale.stockLeft", { count: product.stockQty });

  const priceClassName =
    "truncate text-sm font-semibold tabular-nums tracking-tight sm:text-base lg:text-[15px] xl:text-[17px] 2xl:text-lg text-foreground";

  return (
    <button
      type="button"
      disabled={!inStock}
      onClick={onAdd}
      className={cn(
        "group flex min-h-[112px] flex-col rounded-xl border p-2.5 text-left transition-[border-color,background-color,box-shadow] duration-150 sm:min-h-[120px] sm:p-3 lg:min-h-[128px] lg:p-3 xl:min-h-[132px] xl:p-3.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:opacity-100",
        inStock
          ? "relative cursor-pointer border-border/80 bg-card hover:border-primary/25 hover:bg-primary/[0.04] hover:shadow-sm active:scale-[0.99]"
          : "relative cursor-not-allowed border-border/60 bg-muted/20 ring-1 ring-inset ring-border/40",
      )}
    >
      <p
        className={cn(
          "line-clamp-2 flex-1 text-xs font-medium leading-snug sm:text-sm lg:text-sm lg:leading-normal xl:text-base 2xl:text-[17px] 2xl:leading-snug",
          inStock ? "text-foreground/90" : "text-foreground/80",
        )}
      >
        {product.name}
      </p>

      <div
        className={cn(
          "mt-3 flex items-center justify-between gap-2 border-t pt-3",
          inStock ? "border-border/50" : "border-border/40",
        )}
      >
        <span className={priceClassName}>
          {formatMoney(product.finalPrice)}
        </span>

        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium tabular-nums sm:text-xs lg:text-[11px] xl:text-xs 2xl:text-[13px]",
            !inStock && "border border-destructive/20 bg-destructive/10 text-destructive/90",
            inStock && lowStock && "bg-amber-500/10 text-amber-800/90 dark:text-amber-200/90",
            inStock && !lowStock && "bg-muted/60 text-muted-foreground",
          )}
        >
          {stockLabel}
        </span>
      </div>
    </button>
  );
}

function SaleSuccessScreen({
  order,
  onNewSale,
}: {
  order: OrderDetail;
  onNewSale: () => void;
}) {
  const { t } = useTranslation();
  const receiptQuery = useOrderReceipt(order.id);
  const netTotal = getOrderNetTotal(order);
  const changeAmount = toMoney(order.payment?.changeAmount);

  return (
    <PosPageShell>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          title={t("pos.sale.successTitle")}
          description={order.invoiceNumber}
        />
        <div className="rounded-xl border border-border/70 bg-card p-6 shadow-card">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("pos.orders.invoice")}</span>
              <span className="font-medium">{order.invoiceNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("pos.orders.status")}</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("pos.sale.total")}</span>
              <span className="text-lg font-bold text-primary">
                {formatMoney(netTotal)}
              </span>
            </div>
            {changeAmount > 0 && (
              <div className="flex justify-between text-success-foreground">
                <span>{t("pos.sale.change")}</span>
                <span className="font-bold">{formatMoney(changeAmount)}</span>
              </div>
            )}
            {order.notes?.trim() && (
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t("pos.sale.orderNotes")}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {receiptQuery.isLoading && (
            <div className="mt-4">
              <LoadingState label={t("pos.common.loading")} />
            </div>
          )}

          {receiptQuery.data && (
            <div
              id="receipt-print"
              className="mt-4 space-y-2 rounded-lg border border-border bg-muted p-4 text-sm"
            >
              <p className="font-bold">
                {receiptQuery.data.shopInfo.name || t("pos.header.storeName")}
              </p>
              <p className="text-muted-foreground">
                {formatDateTime(receiptQuery.data.date)}
              </p>
              <p>{receiptQuery.data.customer.name}</p>
              {receiptQuery.data.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>{formatMoney(toMoney(item.totalAmount))}</span>
                </div>
              ))}
              {receiptQuery.data.notes?.trim() && (
                <div className="rounded-md border border-border/60 bg-muted/40 px-3 py-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("pos.sale.orderNotes")}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {receiptQuery.data.notes}
                  </p>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>{t("pos.orders.total")}</span>
                <span>{formatMoney(getOrderNetTotal(receiptQuery.data))}</span>
              </div>
            </div>
          )}

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <Button
              variant="outline"
              onClick={() => window.print()}
              disabled={!receiptQuery.data}
            >
              {t("pos.orders.print")}
            </Button>
            <Button
              onClick={onNewSale}
            >
              {t("pos.sale.newSale")}
            </Button>
          </div>
        </div>
      </div>
    </PosPageShell>
  );
}
