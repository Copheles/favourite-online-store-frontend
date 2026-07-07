import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  History,
  Package,
  PackagePlus,
  PieChart,
  Receipt,
  ShoppingCart,
  Users,
} from "lucide-react";

export interface PosModule {
  id: string;
  labelKey: string;
  path: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  bubbleColor: string;
  badge?: number;
}

export const posModules: PosModule[] = [
  {
    id: "sale",
    labelKey: "pos.modules.sale",
    path: "/sale",
    icon: ShoppingCart,
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    bubbleColor: "bg-blue-400/10 dark:bg-blue-400/15",
  },
  {
    id: "currentOrder",
    labelKey: "pos.modules.currentOrder",
    path: "/orders",
    icon: ClipboardList,
    iconBg: "bg-indigo-50 dark:bg-indigo-950/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bubbleColor: "bg-indigo-400/10 dark:bg-indigo-400/15",
  },
  {
    id: "saleReport",
    labelKey: "pos.modules.saleReport",
    path: "/reports/sale",
    icon: BarChart3,
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bubbleColor: "bg-emerald-400/10 dark:bg-emerald-400/15",
  },
  {
    id: "stockList",
    labelKey: "pos.modules.stockList",
    path: "/stock",
    icon: Package,
    iconBg: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    bubbleColor: "bg-orange-400/10 dark:bg-orange-400/15",
  },
  {
    id: "products",
    labelKey: "pos.modules.products",
    path: "/products",
    icon: PackagePlus,
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    bubbleColor: "bg-amber-400/10 dark:bg-amber-400/15",
  },
  {
    id: "expenses",
    labelKey: "pos.modules.expenses",
    path: "/expenses",
    icon: Receipt,
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    bubbleColor: "bg-rose-400/10 dark:bg-rose-400/15",
  },
  {
    id: "orderHistory",
    labelKey: "pos.modules.orderHistory",
    path: "/orders/completed",
    icon: History,
    iconBg: "bg-violet-50 dark:bg-violet-950/30",
    iconColor: "text-violet-600 dark:text-violet-400",
    bubbleColor: "bg-violet-400/10 dark:bg-violet-400/15",
  },
  {
    id: "member",
    labelKey: "pos.modules.member",
    path: "/customers",
    icon: Users,
    iconBg: "bg-cyan-50 dark:bg-cyan-950/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    bubbleColor: "bg-cyan-400/10 dark:bg-cyan-400/15",
  },
  {
    id: "summaryReport",
    labelKey: "pos.modules.summaryReport",
    path: "/reports/summary",
    icon: PieChart,
    iconBg: "bg-slate-100 dark:bg-slate-800/40",
    iconColor: "text-slate-600 dark:text-slate-400",
    bubbleColor: "bg-slate-400/10 dark:bg-slate-400/15",
  },
];
