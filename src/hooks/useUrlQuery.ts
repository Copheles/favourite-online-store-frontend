import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  readUrlLimit,
  readUrlPage,
  readUrlString,
  resetUrlPage,
  writeUrlLimit,
  writeUrlPage,
  writeUrlString,
} from "@/lib/urlQuery";

type SetSearchParamsOptions = {
  replace?: boolean;
};

export function useUrlPage(defaultPage = 1) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = readUrlPage(searchParams, defaultPage);

  const setPage = useCallback(
    (nextPage: number, options?: SetSearchParamsOptions) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          writeUrlPage(next, nextPage, defaultPage);
          return next;
        },
        { replace: options?.replace ?? false },
      );
    },
    [defaultPage, setSearchParams],
  );

  return [page, setPage] as const;
}

export function useUrlStringParam(key: string, defaultValue = "") {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = readUrlString(searchParams, key, defaultValue);

  const setValue = useCallback(
    (
      nextValue: string,
      options?: SetSearchParamsOptions & { resetPage?: boolean },
    ) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          writeUrlString(next, key, nextValue, defaultValue);
          if (options?.resetPage !== false) {
            resetUrlPage(next);
          }
          return next;
        },
        { replace: options?.replace ?? false },
      );
    },
    [defaultValue, key, setSearchParams],
  );

  return [value, setValue] as const;
}

export function useUrlLimit(
  defaultLimit: number,
  allowed: readonly number[],
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const limit = readUrlLimit(searchParams, defaultLimit, allowed);

  const setLimit = useCallback(
    (nextLimit: number, options?: SetSearchParamsOptions) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          writeUrlLimit(next, nextLimit, defaultLimit);
          resetUrlPage(next);
          return next;
        },
        { replace: options?.replace ?? false },
      );
    },
    [defaultLimit, setSearchParams],
  );

  return [limit, setLimit] as const;
}

export function useUrlEnumParam<T extends string>(
  key: string,
  defaultValue: T,
  validValues: readonly T[],
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const raw = readUrlString(searchParams, key, defaultValue);
  const value = validValues.includes(raw as T) ? (raw as T) : defaultValue;

  const setValue = useCallback(
    (
      nextValue: T,
      options?: SetSearchParamsOptions & { resetPage?: boolean },
    ) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          writeUrlString(next, key, nextValue, defaultValue);
          if (options?.resetPage !== false) {
            resetUrlPage(next);
          }
          return next;
        },
        { replace: options?.replace ?? false },
      );
    },
    [defaultValue, key, setSearchParams, validValues],
  );

  return [value, setValue] as const;
}

export function useUrlAppliedSearch(paramName = "q") {
  const [searchParams, setSearchParams] = useSearchParams();
  const appliedSearch = readUrlString(searchParams, paramName);
  const [searchInput, setSearchInput] = useState(appliedSearch);

  useEffect(() => {
    setSearchInput(appliedSearch);
  }, [appliedSearch]);

  const submitSearch = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      writeUrlString(next, paramName, searchInput);
      resetUrlPage(next);
      return next;
    });
  }, [paramName, searchInput, setSearchParams]);

  const resetSearch = useCallback(() => {
    setSearchInput("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(paramName);
      resetUrlPage(next);
      return next;
    });
  }, [paramName, setSearchParams]);

  return {
    searchInput,
    setSearchInput,
    appliedSearch,
    submitSearch,
    resetSearch,
  };
}

export function useUrlQueryUpdater() {
  const [, setSearchParams] = useSearchParams();

  return useCallback(
    (
      updater: (params: URLSearchParams) => void,
      options?: SetSearchParamsOptions & { resetPage?: boolean },
    ) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          updater(next);
          if (options?.resetPage !== false) {
            resetUrlPage(next);
          }
          return next;
        },
        { replace: options?.replace ?? false },
      );
    },
    [setSearchParams],
  );
}
