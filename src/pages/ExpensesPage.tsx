import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ApiErrorAlert } from "@/components/forms/ApiErrorAlert";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { FormTextareaField } from "@/components/forms/FormTextareaField";
import {
  EmptyState,
  ErrorState,
  PageHeader,
} from "@/components/shared/PageStates";
import {
  PosDataTable,
  PosTable,
  PosTableBody,
  PosTableCell,
  PosTableHead,
  PosTableHeaderCell,
  PosTableRow,
} from "@/components/shared/pos/PosDataTable";
import { PosModal } from "@/components/shared/pos/PosModal";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import {
  PosRecordCard,
  PosRecordCardList,
} from "@/components/shared/pos/PosRecordCard";
import { PosFilterSelect } from "@/components/shared/pos/PosFilterSelect";
import { PosPagination } from "@/components/shared/pos/PosPagination";
import { PosSearchBar } from "@/components/shared/pos/PosSearchBar";
import { PosToaster, usePosToast } from "@/components/shared/pos/PosToast";
import { PosToolbar } from "@/components/shared/pos/PosToolbar";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { useAppliedSearch } from "@/hooks/useAppliedSearch";
import { useBranch } from "@/hooks/useBranch";
import { useUrlEnumParam, useUrlLimit, useUrlPage } from "@/hooks/useUrlQuery";
import { useAdminMutations, useExpenses } from "@/hooks/useAdmin";
import { formatDate, formatMoney, todayISO } from "@/lib/format";
import {
  PAYMENT_FILTERS,
  paymentFilterToApi,
  type PaymentFilter,
} from "@/lib/listFilters";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/queryConfig";
import type { Expense, PaymentType } from "@/types/api";
import {
  getExpenseSchema,
  type ExpenseFormValues,
} from "@/validation/settings.validation";

const PAYMENT_OPTIONS: { value: PaymentType; label: string }[] = [
  { value: "CASH", label: "CASH" },
  { value: "KBZPAY", label: "KBZPAY" },
  { value: "WAVEPAY", label: "WAVEPAY" },
  { value: "CARD", label: "CARD" },
  { value: "BANKING", label: "BANKING" },
];

function toDateInputValue(value: string): string {
  return value.slice(0, 10);
}

export function ExpensesPage() {
  const { t } = useTranslation();
  const { canManageExpenses } = useBranch();
  const { toasts, showToast, dismiss } = usePosToast();
  const mutations = useAdminMutations();
  const {
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    resetSearch,
  } = useAppliedSearch();
  const [page, setPage] = useUrlPage();
  const [limit, setLimit] = useUrlLimit(
    PAGE_SIZE.expenses,
    PAGE_SIZE_OPTIONS.expenses,
  );
  const [paymentFilter, setPaymentFilter] = useUrlEnumParam<PaymentFilter>(
    "payment",
    "ALL",
    PAYMENT_FILTERS,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const query = useExpenses({
    search: appliedSearch || undefined,
    paymentType: paymentFilterToApi(paymentFilter),
    page,
    limit,
  });

  const rows = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 1;

  function openCreate() {
    setEditingExpense(null);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingExpense(expense);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingExpense(null);
  }

  function renderPayment(paymentType: PaymentType) {
    return (
      <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
        {t(`pos.filters.payment.${paymentType}`)}
      </span>
    );
  }

  function renderRowActions(row: Expense) {
    if (!canManageExpenses) return null;
    return (
      <>
        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
          <Pencil className="size-3.5" />
          {t("pos.common.edit")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setExpenseToDelete(row)}
        >
          <Trash2 className="size-3.5" />
          {t("pos.common.delete")}
        </Button>
      </>
    );
  }

  return (
    <>
      <PosPageShell>
        <PageHeader
          title={t("pos.modules.expenses")}
          description={t("pos.expenses.description")}
          action={
            canManageExpenses ? (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                {t("pos.settings.addExpense")}
              </Button>
            ) : undefined
          }
        />

        <div className="space-y-4">
          <PosToolbar>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <PosSearchBar
                value={searchInput}
                onChange={setSearchInput}
                onSubmit={submitSearch}
                onClear={resetSearch}
                placeholder={t("pos.expenses.searchPlaceholder")}
                className="w-full sm:max-w-md sm:flex-1 lg:max-w-xl"
              />
              <PosFilterSelect
                value={paymentFilter}
                options={PAYMENT_FILTERS}
                onChange={setPaymentFilter}
                ariaLabel={t("pos.sale.paymentType")}
                getLabel={(value) => t(`pos.filters.payment.${value}`)}
                className="sm:w-48"
              />
            </div>
          </PosToolbar>

          {query.isLoading && !query.data && <TableSkeleton />}
          {query.isError && <ErrorState />}
          {!query.isLoading && rows.length === 0 && (
            <EmptyState message={t("pos.expenses.empty")} />
          )}

          {!query.isLoading && rows.length > 0 && (
            <>
              <PosRecordCardList>
                {rows.map((row) => (
                  <PosRecordCard
                    key={row.id}
                    title={row.name}
                    subtitle={formatDate(row.expenseDate)}
                    trailing={
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMoney(row.amount)}
                      </span>
                    }
                    fields={[
                      {
                        label: t("pos.sale.paymentType"),
                        value: renderPayment(row.paymentType),
                      },
                      {
                        label: t("pos.members.note"),
                        value: row.note ?? null,
                      },
                    ]}
                    actions={renderRowActions(row)}
                  />
                ))}
              </PosRecordCardList>

              <PosDataTable className="hidden md:block">
                <PosTable>
                  <PosTableHead>
                    <tr>
                      <PosTableHeaderCell>
                        {t("pos.settings.expenseName")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell>
                        {t("pos.settings.expenseAmount")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell>
                        {t("pos.sale.paymentType")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell>
                        {t("pos.settings.expenseDate")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell>
                        {t("pos.members.note")}
                      </PosTableHeaderCell>
                      <PosTableHeaderCell />
                    </tr>
                  </PosTableHead>
                  <PosTableBody>
                    {rows.map((row) => (
                      <PosTableRow key={row.id}>
                        <PosTableCell className="font-medium">
                          {row.name}
                        </PosTableCell>
                        <PosTableCell className="tabular-nums">
                          {formatMoney(row.amount)}
                        </PosTableCell>
                        <PosTableCell>
                          {renderPayment(row.paymentType)}
                        </PosTableCell>
                        <PosTableCell>
                          {formatDate(row.expenseDate)}
                        </PosTableCell>
                        <PosTableCell className="max-w-[14rem] truncate text-muted-foreground">
                          {row.note ?? "-"}
                        </PosTableCell>
                        <PosTableCell>
                          <div className="flex justify-end gap-2">
                            {renderRowActions(row)}
                          </div>
                        </PosTableCell>
                      </PosTableRow>
                    ))}
                  </PosTableBody>
                </PosTable>
              </PosDataTable>
            </>
          )}

          <PosPagination
            page={page}
            totalPages={totalPages}
            total={query.data?.meta.total}
            limit={limit}
            pageSizeOptions={PAGE_SIZE_OPTIONS.expenses}
            onPageChange={setPage}
            onPageSizeChange={setLimit}
          />
        </div>
      </PosPageShell>

      {canManageExpenses && formOpen && (
        <ExpenseFormModal
          expense={editingExpense}
          isPending={
            mutations.createExpense.isPending ||
            mutations.updateExpense.isPending
          }
          error={mutations.createExpense.error || mutations.updateExpense.error}
          onClose={closeForm}
          onSubmit={(values) => {
            if (editingExpense) {
              mutations.updateExpense.mutate(
                { id: editingExpense.id, input: values },
                {
                  onSuccess: () => {
                    showToast("success", t("pos.expenses.updated"));
                    closeForm();
                  },
                },
              );
            } else {
              mutations.createExpense.mutate(values, {
                onSuccess: () => {
                  showToast("success", t("pos.expenses.added"));
                  closeForm();
                },
              });
            }
          }}
        />
      )}

      {canManageExpenses && expenseToDelete && (
        <ExpenseDeleteConfirmModal
          expense={expenseToDelete}
          isPending={mutations.deleteExpense.isPending}
          onClose={() => setExpenseToDelete(null)}
          onConfirm={() => {
            mutations.deleteExpense.mutate(expenseToDelete.id, {
              onSuccess: () => {
                showToast("success", t("pos.expenses.deleted"));
                setExpenseToDelete(null);
              },
            });
          }}
        />
      )}

      <PosToaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}

function ExpenseDeleteConfirmModal({
  expense,
  isPending,
  onClose,
  onConfirm,
}: {
  expense: Expense;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();

  return (
    <PosModal
      title={t("pos.expenses.deleteTitle")}
      description={t("pos.expenses.deleteConfirm", { name: expense.name })}
      onClose={onClose}
      closeLabel={t("pos.common.close")}
    >
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          {t("pos.common.cancel")}
        </Button>
        <Button
          type="button"
          variant="destructive"
          onClick={onConfirm}
          disabled={isPending}
        >
          {t("pos.common.delete")}
        </Button>
      </div>
    </PosModal>
  );
}

function ExpenseFormModal({
  expense,
  isPending,
  error,
  onClose,
  onSubmit,
}: {
  expense: Expense | null;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => getExpenseSchema(t), [t]);
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: expense?.name ?? "",
      amount: expense?.amount ?? 0,
      paymentType: expense?.paymentType ?? "CASH",
      expenseDate: expense ? toDateInputValue(expense.expenseDate) : todayISO(),
      category: expense?.category ?? "",
      note: expense?.note ?? "",
    },
  });

  return (
    <PosModal
      title={
        expense ? t("pos.expenses.editTitle") : t("pos.settings.addExpense")
      }
      description={expense?.name}
      onClose={onClose}
      closeLabel={t("pos.common.close")}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormTextField
            control={form.control}
            name="name"
            label={t("pos.settings.expenseName")}
          />
          <FormTextField
            control={form.control}
            name="amount"
            label={t("pos.settings.expenseAmount")}
            type="number"
            min={1}
          />
          <FormSelect
            control={form.control}
            name="paymentType"
            label={t("pos.sale.paymentType")}
            options={PAYMENT_OPTIONS}
          />
          <FormTextField
            control={form.control}
            name="expenseDate"
            label={t("pos.settings.expenseDate")}
            type="date"
          />
          <FormTextareaField
            control={form.control}
            name="note"
            label={t("pos.members.note")}
            rows={3}
          />
          <ApiErrorAlert error={error} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("pos.common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("pos.common.save")}
            </Button>
          </div>
        </form>
      </Form>
    </PosModal>
  );
}
