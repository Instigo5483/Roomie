export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/^@/, "");
}

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}
