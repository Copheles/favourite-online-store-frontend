import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LoginShellProps {
  children: React.ReactNode;
}

export function LoginShell({ children }: LoginShellProps) {
  const { t, i18n } = useTranslation();

  function toggleLanguage() {
    const nextLang = i18n.language === "my" ? "en" : "my";
    i18n.changeLanguage(nextLang);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[linear-gradient(135deg,#1e40af_0%,#2563eb_45%,#3b82f6_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <button
        type="button"
        onClick={toggleLanguage}
        className="absolute right-4 top-4 z-10 inline-flex h-9 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
      >
        <Languages className="size-3.5" />
        {i18n.language === "my" ? t("language.english") : t("language.burmese")}
      </button>

      <div className="w-full max-w-[920px] overflow-hidden rounded-2xl bg-card shadow-[0_24px_64px_-12px_rgba(15,23,42,0.45)]">
        {children}
      </div>
    </main>
  );
}
