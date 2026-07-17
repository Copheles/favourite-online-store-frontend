import type { IconSvgElement } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Package01Icon,
  DeliveryTruck01Icon,
  UserGroupIcon,
  ChartHistogramIcon,
  Settings01Icon,
  CustomerSupportIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";

export interface SidebarChildItem {
  labelKey: string;
  path: string;
}

export interface SidebarMenuItem {
  labelKey: string;
  path: string;
  icon: IconSvgElement;
  roles?: ("admin" | "staff")[];
  children?: SidebarChildItem[];
}

export interface SidebarSection {
  titleKey: string;
  items: SidebarMenuItem[];
}

export const sidebarMenuSections: SidebarSection[] = [
  {
    titleKey: "sidebar.sections.main",
    items: [
      {
        labelKey: "sidebar.menu.dashboard",
        path: "/dashboard",
        icon: DashboardSquare01Icon,
      },
      {
        labelKey: "sidebar.menu.orders",
        path: "/orders",
        icon: Package01Icon,
        children: [
          { labelKey: "sidebar.menu.allOrders", path: "/orders" },
          { labelKey: "sidebar.menu.pendingOrders", path: "/orders/pending" },
          { labelKey: "sidebar.menu.completedOrders", path: "/orders/completed" },
        ],
      },
      {
        labelKey: "sidebar.menu.customers",
        path: "/customers",
        icon: UserGroupIcon,
      },
      {
        labelKey: "sidebar.menu.reports",
        path: "/reports",
        icon: ChartHistogramIcon,
        children: [
          { labelKey: "pos.modules.saleReport", path: "/reports/sale" },
          { labelKey: "pos.modules.summaryReport", path: "/reports/summary" },
        ],
      },
    ],
  },
  {
    titleKey: "sidebar.sections.settings",
    items: [
      {
        labelKey: "sidebar.menu.settings",
        path: "/settings",
        icon: Settings01Icon,
      },
      {
        labelKey: "sidebar.menu.helpCenter",
        path: "/help",
        icon: CustomerSupportIcon,
      },
    ],
  },
];

export { ArrowDown01Icon, ArrowUp01Icon };
