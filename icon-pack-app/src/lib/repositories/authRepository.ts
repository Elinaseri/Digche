export interface AuthRepository {
  checkCredentials(email: string, password: string): boolean;
  getAdminEmail(): string;
}

export function createAuthRepository(): AuthRepository {
  return {
    checkCredentials(email: string, password: string): boolean {
      const expectedEmail = (process.env.ADMIN_EMAIL ?? "").trim();
      const expectedPassword = process.env.ADMIN_PASSWORD ?? "";
      return (
        expectedEmail.length > 0 &&
        email === expectedEmail &&
        password === expectedPassword
      );
    },

    getAdminEmail(): string {
      return process.env.ADMIN_EMAIL ?? "";
    },
  };
}
