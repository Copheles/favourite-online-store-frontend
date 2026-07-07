const SILENT_401_PATHS = ["/auth/me", "/auth/logout", "/auth/login"];

let suppressUnauthorizedUntil = 0;
let loggingOut = false;

export function beginLogout() {
  loggingOut = true;
  suppressUnauthorizedUntil = Date.now() + 5000;
}

export function endLogout() {
  loggingOut = false;
}

export function isLoggingOut() {
  return loggingOut;
}

export function suppressUnauthorizedEvents(ms = 5000) {
  suppressUnauthorizedUntil = Date.now() + ms;
}

export function shouldEmitUnauthorized(url: string | undefined): boolean {
  if (!url) return false;
  if (Date.now() < suppressUnauthorizedUntil) return false;
  return !SILENT_401_PATHS.some((path) => url.includes(path));
}
