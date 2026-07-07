import { useTranslation } from "react-i18next";
import { BookOpen, LifeBuoy, Phone } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CustomerSupportIcon } from "@hugeicons/core-free-icons";
import { PageHeader } from "@/components/shared/PageStates";
import { PosPageShell } from "@/components/shared/pos/PosPageShell";

export function HelpCenterPage() {
  const { t } = useTranslation();

  return (
    <PosPageShell>
      <PageHeader
        title={t("sidebar.menu.helpCenter")}
        description={t("pos.help.description")}
      />

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-card sm:p-8 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.06),transparent_55%)]"
          />
          <div className="relative text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-accent">
              <HugeiconsIcon
                icon={CustomerSupportIcon}
                size={32}
                strokeWidth={1.5}
                className="text-accent-foreground"
              />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-card-foreground">
              {t("pos.help.heroTitle")}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
              {t("pos.help.heroText")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover sm:p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
              <BookOpen className="size-5 text-accent-foreground" />
            </div>
            <h4 className="mt-3 font-semibold text-card-foreground">
              {t("pos.help.docsTitle")}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("pos.help.docsText")}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card-hover sm:p-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent">
              <LifeBuoy className="size-5 text-accent-foreground" />
            </div>
            <h4 className="mt-3 font-semibold text-card-foreground">
              {t("pos.help.supportTitle")}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("pos.help.supportText")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-5 shadow-card sm:p-6">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent">
            <Phone className="size-5 text-accent-foreground" />
          </div>
          <div>
            <h4 className="font-semibold text-card-foreground">
              {t("pos.help.contactTitle")}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("pos.help.contactText")}
            </p>
          </div>
        </div>
      </div>
    </PosPageShell>
  );
}
