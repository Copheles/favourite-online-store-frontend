import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  CheckCircle2,
  FileSpreadsheet,
  KeyRound,
  Settings,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ApiErrorAlert } from "@/components/forms/ApiErrorAlert";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextField } from "@/components/forms/FormTextField";
import { ProductExcelPanel } from "@/components/forms/ProductExcelPanel";
import { PageHeader } from "@/components/shared/PageStates";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";
import { useAuth } from "@/hooks/useAuth";
import { useAdminMutations } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import {
  getPasswordSchema,
  getStaffSchema,
  type PasswordFormValues,
  type StaffFormValues,
} from "@/validation/settings.validation";

type Tab = "password" | "staff" | "excel";

const TAB_META: Record<
  Tab,
  { icon: React.ElementType; descriptionKey: string }
> = {
  password: { icon: KeyRound, descriptionKey: "pos.settings.passwordTabDesc" },
  staff: { icon: UserPlus, descriptionKey: "pos.settings.staffTabDesc" },
  excel: { icon: FileSpreadsheet, descriptionKey: "pos.settings.excelDescription" },
};

export function SettingsPage() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<Tab>("password");
  const contentRef = useRef<HTMLDivElement>(null);
  const mutations = useAdminMutations();

  const tabs: Tab[] = isAdmin
    ? ["password", "staff", "excel"]
    : ["password"];

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [tab]);

  return (
    <PosPageShell>
      <PageHeader
        title={t("sidebar.menu.settings")}
        description={t("pos.settings.description")}
      />

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.06),transparent_55%)]"
          />
          <div className="relative text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-accent">
              <Settings
                className="size-8 text-accent-foreground"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-card-foreground">
              {t("pos.settings.heroTitle")}
            </h3>
            <p className="mx-auto mt-1.5 max-w-lg text-sm text-muted-foreground">
              {t("pos.settings.heroText")}
            </p>
          </div>
        </div>

        {tabs.length > 1 && (
          <div className="grid gap-4 sm:grid-cols-3">
            {tabs.map((item) => {
              const meta = TAB_META[item];
              const Icon = meta.icon;
              const isActive = tab === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={cn(
                    "rounded-xl border bg-card p-5 text-left shadow-card transition-all sm:p-6",
                    "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
                    isActive
                      ? "border-primary/40 ring-1 ring-primary/15"
                      : "border-border/70",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg bg-accent",
                      isActive && "bg-primary/10",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-5 text-accent-foreground",
                        isActive && "text-primary",
                      )}
                    />
                  </div>
                  <h4 className="mt-3 font-semibold text-card-foreground">
                    {t(`pos.settings.tabs.${item}`)}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(meta.descriptionKey)}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        <div
          ref={contentRef}
          className="rounded-xl border border-border/70 bg-card p-5 shadow-card sm:p-6"
        >
          {tab === "password" && (
            <PasswordTab mutation={mutations.changePassword} />
          )}
          {tab === "staff" && isAdmin && (
            <StaffTab mutation={mutations.createStaff} />
          )}
          {tab === "excel" && isAdmin && <ExcelTab />}
        </div>
      </div>
    </PosPageShell>
  );
}

function SettingsSectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 flex items-start gap-3 border-b border-border/60 pb-5">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
        <Icon className="size-5 text-accent-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-card-foreground">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function SuccessNote({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-sm font-medium text-success-foreground">
      <CheckCircle2 className="size-4 shrink-0" />
      {message}
    </p>
  );
}

function PasswordTab({
  mutation,
}: {
  mutation: ReturnType<typeof useAdminMutations>["changePassword"];
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => getPasswordSchema(t), [t]);
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  useEffect(() => {
    if (mutation.isSuccess) form.reset();
  }, [mutation.isSuccess, form]);

  return (
    <div className="mx-auto max-w-md">
      <SettingsSectionHeader
        icon={KeyRound}
        title={t("pos.settings.tabs.password")}
        description={t("pos.settings.passwordTabDesc")}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-3"
        >
          <FormTextField
            control={form.control}
            name="currentPassword"
            label={t("pos.settings.currentPassword")}
            type="password"
          />
          <FormTextField
            control={form.control}
            name="newPassword"
            label={t("pos.settings.newPassword")}
            type="password"
          />
          {mutation.isSuccess && (
            <SuccessNote message={t("pos.settings.passwordUpdated")} />
          )}
          <ApiErrorAlert error={mutation.error} />
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={mutation.isPending}>
              {t("pos.common.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function StaffTab({
  mutation,
}: {
  mutation: ReturnType<typeof useAdminMutations>["createStaff"];
}) {
  const { t } = useTranslation();
  const schema = useMemo(() => getStaffSchema(t), [t]);
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", role: "staff" },
  });

  useEffect(() => {
    if (mutation.isSuccess) form.reset();
  }, [mutation.isSuccess, form]);

  return (
    <div className="mx-auto max-w-md">
      <SettingsSectionHeader
        icon={UserPlus}
        title={t("pos.settings.tabs.staff")}
        description={t("pos.settings.staffTabDesc")}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="space-y-3"
        >
          <FormTextField
            control={form.control}
            name="username"
            label={t("pos.settings.username")}
          />
          <FormTextField
            control={form.control}
            name="password"
            label={t("pos.settings.newPassword")}
            type="password"
          />
          <FormSelect
            control={form.control}
            name="role"
            label={t("pos.settings.role")}
            options={[
              { value: "staff", label: "staff" },
              { value: "admin", label: "admin" },
            ]}
          />
          {mutation.isSuccess && (
            <SuccessNote message={t("pos.settings.staffCreated")} />
          )}
          <ApiErrorAlert error={mutation.error} />
          <div className="flex justify-end pt-1">
            <Button type="submit" disabled={mutation.isPending}>
              {t("pos.settings.createStaff")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function ExcelTab() {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl">
      <SettingsSectionHeader
        icon={FileSpreadsheet}
        title={t("pos.settings.tabs.excel")}
        description={t("pos.settings.excelDescription")}
      />
      <ProductExcelPanel />
    </div>
  );
}
