export const STALE_TIME = {
  auth: 5 * 60 * 1000,
  catalog: 2 * 60 * 1000,
  transactional: 30 * 1000,
  reports: 60 * 1000,
  static: 10 * 60 * 1000,
} as const;

export const PAGE_SIZE = {
  default: 20,
  saleProducts: 80,
  members: 24,
  stock: 50,
  products: 20,
  expenses: 20,
} as const;

export const PAGE_SIZE_OPTIONS = {
  products: [10, 20, 50] as const,
  stock: [25, 50, 100] as const,
  members: [12, 24, 48] as const,
  orders: [10, 20, 50] as const,
  reports: [10, 20, 50] as const,
  saleProducts: [40, 80, 120] as const,
  expenses: [10, 20, 50] as const,
} as const;
