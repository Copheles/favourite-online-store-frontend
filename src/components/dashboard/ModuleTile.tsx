import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { PosModule } from "@/constants/posModules";
import { cn } from "@/lib/utils";

interface ModuleTileProps {
  module: PosModule;
}

export function ModuleTile({ module }: ModuleTileProps) {
  const { t } = useTranslation();
  const Icon = module.icon;

  return (
    <NavLink
      to={module.path}
      className={({ isActive }) =>
        cn(
          "group relative flex h-full min-h-[120px] flex-col overflow-hidden rounded-xl border border-border bg-card p-4 transition-[border-color,background-color] duration-150 ease-out hover:border-primary/20 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 sm:min-h-[132px] sm:p-5 lg:min-h-[140px]",
          isActive && "border-primary/30 bg-accent/40",
        )
      }
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full blur-[1px] transition-opacity duration-150 ease-out group-hover:opacity-100 opacity-90 sm:size-28",
          module.bubbleColor,
        )}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-2 py-5 text-center sm:py-6">
        {module.badge != null && module.badge > 0 && (
          <span className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
            {module.badge}
          </span>
        )}

        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-xl sm:size-14",
            module.iconBg,
          )}
        >
          <Icon
            className={cn("size-6 sm:size-7", module.iconColor)}
            strokeWidth={1.75}
          />
        </div>

        <span className="mt-3 text-base font-semibold text-foreground sm:mt-4 sm:text-lg">
          {t(module.labelKey)}
        </span>
      </div>
    </NavLink>
  );
}
