import { useTranslation } from "react-i18next";

export function LoginBrandPanel() {
  const { t } = useTranslation();

  return (
    <section className="relative hidden min-h-[580px] overflow-hidden bg-[linear-gradient(145deg,#3b7cf6_0%,#2563eb_38%,#1d4ed8_68%,#1e40af_100%)] lg:block">
      {/* Soft depth layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,rgba(255,255,255,0.14),transparent_42%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.08),transparent_35%)]"
      />

      {/* Bottom-left decorative spheres */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-10 size-52 rounded-full bg-[radial-gradient(circle_at_35%_30%,#7eb0ff,#2563eb)] opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-28 size-36 rounded-full bg-[radial-gradient(circle_at_35%_30%,#5b93f5,#1e40af)] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 left-44 size-24 rounded-full bg-[radial-gradient(circle_at_35%_30%,#93b8ff,#3b82f6)] opacity-60"
      />

      <div className="relative flex h-full min-h-[580px] flex-col px-10 py-10 sm:px-12 sm:py-12">
        <div className="text-white">
          <p className="text-sm font-semibold">{t("login.brand.company")}</p>
          <p className="mt-0.5 text-xs text-white/55">
            {t("login.brand.subtitle")}
          </p>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <h2 className="text-[2.6rem] font-extrabold leading-[0.95] tracking-tight text-white sm:text-[3rem]">
            {t("login.brand.welcome")}
          </h2>
          <p className="mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-white/85">
            {t("login.brand.tagline")}
          </p>
          <p className="mt-5 max-w-[18rem] text-sm leading-7 text-white/70">
            {t("login.brand.description")}
          </p>
        </div>
      </div>
    </section>
  );
}
