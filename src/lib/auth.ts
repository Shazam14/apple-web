const JWT_KEY = "apple_jwt";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(JWT_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(JWT_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(JWT_KEY);
}

export function logout(): void {
  clearToken();
  window.location.href = "/login";
}
