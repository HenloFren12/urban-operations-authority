const DEMO_EMAIL = "admin@urbanops.gov";
const DEMO_PASSWORD = "UOA@2026";
const AUTH_KEY = "uoa_auth";

export interface AuthUser {
  email: string;
  role: string;
  loginTime: number;
}

export function login(email: string, password: string): boolean {
  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const user: AuthUser = {
      email,
      role: "Administrator",
      loginTime: Date.now(),
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    return true;
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function getUser(): AuthUser | null {
  const data = localStorage.getItem(AUTH_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}

export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
};
