export const ADMIN_SESSION_COOKIE = "admin_session";

export function getAdminSessionToken(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

export function isValidAdminSession(cookieValue: string): boolean {
  const expected = getAdminSessionToken();
  return expected.length > 0 && cookieValue === expected;
}
