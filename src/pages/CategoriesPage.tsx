import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ApiErrorAlert } from "@/components/forms/ApiErrorAlert";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
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
import { DeleteConfirmModal } from "@/components/shared/pos/DeleteConfirmModal";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import {
  PosRecordCard,
  PosRecordCardList,
} from "@/components/shared/pos/PosRecordCard";
import { PosFilterSelect } from "@/components/shared/pos/PosFilterSelect";
import { PosPagination } from "@/components/shared/pos/PosPagination";
import { PosSearchBar } from "@/components/shared/pos/PosSearchBar";
import { PosToolbar } from "@/components/shared/pos/PosToolbar";
import { TableSkeleton } from "@/components/shared/pos/TableSkeleton";
import { useAppliedSearch } from "@/hooks/useAppliedSearch";
import { useBranch } from "@/hooks/useBranch";
import { useUrlEnumParam, useUrlLimit, useUrlPage } from "@/hooks/useUrlQuery";
import {
  useCategories,
  useCategoriesManage,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/hooks/useAdmin";
import { PAGE_SIZE, PAGE_SIZE_OPTIONS } from "@/lib/queryConfig";
import type { Category } from "@/types/api";
import {
  categoryFormDefaults,
  getCategorySchema,
  type CategoryFormValues,
} from "@/validation/category.validation";

const TYPE_FILTERS = ["ALL", "TOP", "SUB"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

export function CategoriesPage() {
  const { t } = useTranslation();
  const { canWriteCatalog, currentBranch } = useBranch();
  const {
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    resetSearch,
  } = useAppliedSearch();
  const [page, setPage] = useUrlPage();
  const [limit, setLimit] = useUrlLimit(
    PAGE_SIZE.products,
    PAGE_SIZE_OPTIONS.products,
  );
  const [typeFilter, setTypeFilter] = useUrlEnumParam<TypeFilter>(
    "type",
    "ALL",
    TYPE_FILTERS,
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  const query = useCategoriesManage({
    search: appliedSearch || undefined,
    type: typeFilter === "ALL" ? undefined : typeFilter,
    page,
    limit,
  });
  const topCategories = useCategories("TOP");
  const create = useCreateCategory();
  const update = useUpdateCategory();
  const remove = useDeleteCategory();

  const rows = query.data?.items ?? [];
  const totalPages = query.data?.meta.totalPages ?? 1;
  const branchLabel =
    currentBranch?.name ?? currentBranch?.code ?? "—";

  const parentNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of topCategories.data?.items ?? []) {
      map.set(item.id, item.name);
    }
    return map;
  }, [topCategories.data?.items]);

  function openCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deletingCategory) return;
    remove.mutate(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  }

  function typeLabel(type: Category["type"]) {
    return type === "TOP"
      ? t("pos.categories.typeTop")
      : t("pos.categories.typeSub");
  }

  function renderRowActions(row: Category) {
    if (!canWriteCatalog) return null;
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
          onClick={() => setDeletingCategory(row)}
        >
          <Trash2 className="size-3.5" />
          {t("pos.common.delete")}
        </Button>
      </>
    );
  }

  return (
    <PosPageShell>
      <PageHeader
        title={t("pos.categories.title")}
        description={`${t("pos.categories.description")} ${t("pos.categories.branchScope", { branch: branchLabel })}`}
        action={
          canWriteCatalog ? (
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              {t("pos.categories.add")}
            </Button>
          ) : undefined
        }
      />

      <PosToolbar>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <PosSearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={submitSearch}
            onClear={resetSearch}
            placeholder={t("pos.categories.searchPlaceholder")}
            className="w-full sm:max-w-md sm:flex-1 lg:max-w-xl"
          />
          <PosFilterSelect
            value={typeFilter}
            options={TYPE_FILTERS}
            onChange={setTypeFilter}
            ariaLabel={t("pos.categories.filterByType")}
            getLabel={(value) => t(`pos.filters.categoryType.${value}`)}
            className="sm:w-44"
          />
        </div>
      </PosToolbar>

      {query.isLoading && !query.data && <TableSkeleton />}
      {query.isError && <ErrorState />}
      {!query.isLoading && rows.length === 0 && (
        <EmptyState message={t("pos.categories.empty")} />
      )}

      {!query.isLoading && rows.length > 0 && (
        <>
          <PosRecordCardList>
            {rows.map((row) => (
              <PosRecordCard
                key={row.id}
                title={row.name}
                subtitle={typeLabel(row.type)}
                fields={[
                  {
                    label: t("pos.categories.parent"),
                    value:
                      row.type === "SUB"
                        ? (parentNameById.get(row.parentId ?? "") ?? "-")
                        : t("pos.categories.noParent"),
                  },
                ]}
                actions={
                  canWriteCatalog ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(row)}
                      >
                        {t("pos.common.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeletingCategory(row)}
                      >
                        {t("pos.common.delete")}
                      </Button>
                    </>
                  ) : undefined
                }
              />
            ))}
          </PosRecordCardList>

          <PosDataTable className="hidden md:block">
            <PosTable>
              <PosTableHead>
                <tr>
                  <PosTableHeaderCell>
                    {t("pos.categories.name")}
                  </PosTableHeaderCell>
                  <PosTableHeaderCell>
                    {t("pos.categories.type")}
                  </PosTableHeaderCell>
                  <PosTableHeaderCell>
                    {t("pos.categories.parent")}
                  </PosTableHeaderCell>
                  {canWriteCatalog && <PosTableHeaderCell />}
                </tr>
              </PosTableHead>
              <PosTableBody>
                {rows.map((row) => (
                  <PosTableRow key={row.id}>
                    <PosTableCell className="font-medium">{row.name}</PosTableCell>
                    <PosTableCell>{typeLabel(row.type)}</PosTableCell>
                    <PosTableCell>
                      {row.type === "SUB"
                        ? (parentNameById.get(row.parentId ?? "") ?? "-")
                        : "—"}
                    </PosTableCell>
                    {canWriteCatalog && (
                      <PosTableCell>
                        <div className="flex justify-end gap-2">
                          {renderRowActions(row)}
                        </div>
                      </PosTableCell>
                    )}
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
        pageSizeOptions={PAGE_SIZE_OPTIONS.products}
        onPageChange={setPage}
        onPageSizeChange={setLimit}
      />

      {formOpen && canWriteCatalog && (
        <CategoryFormModal
          category={editingCategory}
          isPending={create.isPending || update.isPending}
          error={create.error || update.error}
          onClose={() => setFormOpen(false)}
          onSubmit={(values) => {
            const input = {
              name: values.name.trim(),
              type: values.type,
              parentId:
                values.type === "SUB" ? values.parentId?.trim() || null : null,
            };
            if (editingCategory) {
              update.mutate(
                {
                  id: editingCategory.id,
                  input: {
                    name: input.name,
                    ...(editingCategory.type === "SUB"
                      ? { parentId: input.parentId }
                      : {}),
                  },
                },
                { onSuccess: () => setFormOpen(false) },
              );
            } else {
              create.mutate(input, { onSuccess: () => setFormOpen(false) });
            }
          }}
        />
      )}

      {deletingCategory && canWriteCatalog && (
        <DeleteConfirmModal
          title={t("pos.categories.deleteTitle")}
          message={t("pos.categories.deleteConfirm", {
            name: deletingCategory.name,
          })}
          confirmLabel={t("pos.common.delete")}
          cancelLabel={t("pos.common.cancel")}
          closeLabel={t("pos.common.close")}
          isPending={remove.isPending}
          error={remove.error}
          onClose={() => {
            remove.reset();
            setDeletingCategory(null);
          }}
          onConfirm={confirmDelete}
        />
      )}
    </PosPageShell>
  );
}

function CategoryFormModal({
  category,
  isPending,
  error,
  onClose,
  onSubmit,
}: {
  category: Category | null;
  isPending: boolean;
  error: unknown;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
}) {
  const { t } = useTranslation();
  const topCategories = useCategories("TOP");
  const schema = useMemo(() => getCategorySchema(t), [t]);
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? {
          name: category.name,
          type: category.type,
          parentId: category.parentId ?? "",
        }
      : categoryFormDefaults,
  });

  const type = form.watch("type");
  const isEditing = Boolean(category);

  const topOptions =
    topCategories.data?.items
      .filter((item) => item.id !== category?.id)
      .map((item) => ({ value: item.id, label: item.name })) ?? [];

  return (
    <PosModal
      title={
        isEditing ? t("pos.categories.editTitle") : t("pos.categories.addTitle")
      }
      onClose={onClose}
      closeLabel={t("pos.common.close")}
    >
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/15 px-3.5 py-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderTree className="size-4" strokeWidth={1.75} />
            </span>
            <p className="text-sm text-muted-foreground">
              {t("pos.categories.formHint")}
            </p>
          </div>

          <FormTextField
            control={form.control}
            name="name"
            label={t("pos.categories.name")}
          />

          {!isEditing && (
            <FormSelect
              control={form.control}
              name="type"
              label={t("pos.categories.type")}
              options={[
                { value: "TOP", label: t("pos.categories.typeTop") },
                { value: "SUB", label: t("pos.categories.typeSub") },
              ]}
            />
          )}

          {(type === "SUB" || category?.type === "SUB") && (
            <FormSelect
              control={form.control}
              name="parentId"
              label={t("pos.categories.parent")}
              options={topOptions}
              placeholder={t("pos.categories.selectParent")}
            />
          )}

          <ApiErrorAlert error={error} />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              {t("pos.common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("pos.common.loading") : t("pos.common.save")}
            </Button>
          </div>
        </form>
      </Form>
    </PosModal>
  );
}
