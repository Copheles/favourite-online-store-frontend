import { z } from "zod";

export const getDateRangeFilterSchema = () =>
  z.object({
    search: z.string().optional().or(z.literal("")),
    fromDate: z.string().optional().or(z.literal("")),
    toDate: z.string().optional().or(z.literal("")),
  });

export type DateRangeFilterValues = z.infer<
  ReturnType<typeof getDateRangeFilterSchema>
>;

export const getDateFilterSchema = () =>
  z.object({
    date: z.string().min(1),
  });

export type DateFilterValues = z.infer<ReturnType<typeof getDateFilterSchema>>;

export const getSearchFilterSchema = () =>
  z.object({
    search: z.string().optional().or(z.literal("")),
  });

export type SearchFilterValues = z.infer<
  ReturnType<typeof getSearchFilterSchema>
>;
