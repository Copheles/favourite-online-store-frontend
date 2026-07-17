import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Eraser,
  HelpCircle,
  Languages,
  LogOut,
  Maximize2,
  Minimize2,
  Monitor,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BranchSwitcher } from "@/components/shared/BranchSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/layout/ThemeProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLogout } from "@/hooks/usePos";
import {
  dispatchSaleClearCart,
} from "@/lib/sale";

function HeaderIconButton({
  title,
  onClick,
  disabled,
  active,
  children,
  className,
}: {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "size-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-muted text-primary",
        className,
      )}
    >
      {children}
    </Button>
  );
}

function HeaderLangButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {label}
    </button>
  );
}

function HeaderDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("mx-1 h-5 w-px shrink-0 bg-border", className)}
    />
  );
}

function ProfileMenuItem({
  icon: Icon,
  label,
  onClick,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        destructive
          ? "text-destructive hover:bg-destructive/10"
          : "text-foreground hover:bg-muted",
      )}
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      {label}
    </button>
  );
}

export function PosHeader() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    () => typeof document !== "undefined" && !!document.fullscreenElement,
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isSale = location.pathname === "/sale";
  const showBreadcrumb = location.pathname !== "/dashboard";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  function toggleLanguage() {
    const nextLang = i18n.language === "my" ? "en" : "my";
    i18n.changeLanguage(nextLang);
    setIsProfileOpen(false);
  }

  function cycleTheme() {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await document.documentElement.requestFullscreen();
    } catch {
      // Browser may block fullscreen without a direct user gesture.
    }
  }

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  const ThemeIcon =
    theme === "system" ? Monitor : resolvedTheme === "dark" ? Moon : Sun;

  const themeLabel =
    theme === "system"
      ? t("header.theme", { theme: "system" })
      : resolvedTheme === "dark"
        ? t("header.theme", { theme: "dark" })
        : t("header.theme", { theme: "light" });

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-card/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-xl supports-backdrop-filter:bg-card/70">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <BrandLogo
              compact={false}
              variant="header"
              onClick={() => navigate("/dashboard")}
            />
            {showBreadcrumb && (
              <>
                <div
                  aria-hidden
                  className="hidden h-8 w-px shrink-0 bg-border sm:block"
                />
                <Breadcrumb className="min-w-0 flex-1" />
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <BranchSwitcher />
            <HeaderDivider className="hidden sm:block" />

            {isSale && (
              <>
                <HeaderIconButton
                  title={t("pos.sale.clearCart")}
                  active
                  onClick={() => dispatchSaleClearCart()}
                >
                  <Eraser className="size-4" />
                </HeaderIconButton>
                <HeaderDivider className="hidden sm:block" />
              </>
            )}

            <HeaderIconButton
              title={t("header.settings")}
              onClick={() => navigate("/settings")}
            >
              <Settings className="size-4" />
            </HeaderIconButton>

            <HeaderLangButton
              label={i18n.language === "my" ? "EN" : "MY"}
              onClick={toggleLanguage}
              className="hidden md:inline-flex"
            />

            <HeaderIconButton
              title={
                isFullscreen
                  ? t("header.exitFullscreen")
                  : t("header.enterFullscreen")
              }
              active={isFullscreen}
              onClick={toggleFullscreen}
              className="hidden md:inline-flex"
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" />
              ) : (
                <Maximize2 className="size-4" />
              )}
            </HeaderIconButton>

            <HeaderIconButton
              title={themeLabel}
              onClick={cycleTheme}
              className="hidden md:inline-flex"
            >
              <ThemeIcon className="size-4" />
            </HeaderIconButton>

            <HeaderDivider />

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
                className={cn(
                  "flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-muted",
                  isProfileOpen && "bg-muted",
                )}
                aria-label={t("header.profile")}
                aria-expanded={isProfileOpen}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-semibold text-primary-foreground">
                  {initials}
                </div>
                <div className="hidden min-w-0 text-left lg:block">
                  <p className="max-w-28 truncate text-xs font-semibold capitalize leading-tight text-foreground">
                    {user?.username}
                  </p>
                  <p className="max-w-28 truncate text-[10px] capitalize leading-tight text-muted-foreground">
                    {user?.role ?? t("pos.header.defaultRole")}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                    isProfileOpen && "rotate-180",
                  )}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl border border-border bg-card p-1.5 shadow-sm">
                  <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold capitalize text-foreground">
                        {user?.username}
                      </p>
                      <p className="truncate text-xs capitalize text-muted-foreground">
                        {user?.role ?? t("pos.header.defaultRole")}
                      </p>
                    </div>
                  </div>

                  <div className="my-1 h-px bg-border" />

                  <div className="py-0.5">
                    <ProfileMenuItem
                      icon={Settings}
                      label={t("header.settings")}
                      onClick={() => {
                        navigate("/settings");
                        setIsProfileOpen(false);
                      }}
                    />
                    <ProfileMenuItem
                      icon={HelpCircle}
                      label={t("sidebar.menu.helpCenter")}
                      onClick={() => {
                        navigate("/help");
                        setIsProfileOpen(false);
                      }}
                    />
                    <ProfileMenuItem
                      icon={Languages}
                      label={
                        i18n.language === "my"
                          ? t("language.english")
                          : t("language.burmese")
                      }
                      onClick={toggleLanguage}
                    />
                    <ProfileMenuItem
                      icon={ThemeIcon}
                      label={themeLabel}
                      onClick={cycleTheme}
                    />
                  </div>

                  <div className="my-1 h-px bg-border" />

                  <ProfileMenuItem
                    icon={LogOut}
                    label={t("header.logout")}
                    destructive
                    onClick={() => {
                      setIsProfileOpen(false);
                      logoutMutation.mutate();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
