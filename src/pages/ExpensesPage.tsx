import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ApiErrorAlert } from "@/components/forms/ApiErrorAlert";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { FormTextareaField } from "@/components/forms/FormTextareaField";
import { LoadingState, PageHeader } from "@/components/shared/PageStates";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import { useAdminMutations, useExpenses } from "@/hooks/useAdmin";
import { formatDateTime, formatMoney, todayISO } from "@/lib/format";
import {
  getExpenseSchema,
  type ExpenseFormValues,
} from "@/validation/settings.validation";

const PAYMENT_OPTIONS = [
  { value: "CASH", label: "CASH" },
  { value: "KBZPAY", label: "KBZPAY" },
  { value: "WAVEPAY", label: "WAVEPAY" },
  { value: "CARD", label: "CARD" },
  { value: "BANKING", label: "BANKING" },
];

export function ExpensesPage() {
  const { t } = useTranslation();
  const mutations = useAdminMutations();
  const schema = useMemo(() => getExpenseSchema(t), [t]);
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      amount: 0,
      paymentType: "CASH",
      expenseDate: todayISO(),
      category: "",
      note: "",
    },
  });
  const expensesQuery = useExpenses({ page: 1, limit: 10 });

  return (
    <PosPageShell>
      <PageHeader
        title={t("pos.modules.expenses")}
        description={t("pos.expenses.description")}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              mutations.createExpense.mutate(values, {
                onSuccess: () => form.reset({
                  name: "",
                  amount: 0,
                  paymentType: "CASH",
                  expenseDate: todayISO(),
                  category: "",
                  note: "",
                }),
              }),
            )}
            className="space-y-3 rounded-xl border border-border/70 bg-card p-5 shadow-card sm:p-6"
          >
            <h3 className="font-bold text-foreground">
              {t("pos.settings.addExpense")}
            </h3>
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
            {mutations.createExpense.isSuccess && (
              <p className="rounded-lg bg-success px-3 py-2 text-sm font-medium text-success-foreground">
                {t("pos.expenses.added")}
              </p>
            )}
            <ApiErrorAlert error={mutations.createExpense.error} />
            <Button
              type="submit"
              disabled={mutations.createExpense.isPending}
            >
              {t("pos.settings.addExpense")}
            </Button>
          </form>
        </Form>

        <div className="rounded-xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
          <h3 className="font-bold">{t("pos.settings.recentExpenses")}</h3>
          {expensesQuery.isLoading && (
            <LoadingState label={t("pos.common.loading")} />
          )}
          <div className="mt-3 space-y-2">
            {expensesQuery.data?.items.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between rounded-lg bg-muted px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(expense.expenseDate)}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatMoney(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PosPageShell>
  );
}
