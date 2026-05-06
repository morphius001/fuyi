import { createHash } from "crypto";

import { MockProviderError, MockProviderErrorCode } from "./types";

export const stableMockId = (prefix: string, parts: unknown[]): string => {
  const digest = createHash("sha256")
    .update(JSON.stringify(parts))
    .digest("hex")
    .slice(0, 16);

  return `${prefix}_${digest}`;
};

export const providerError = (
  code: MockProviderErrorCode,
  message: string,
  retryable: boolean,
  details?: Record<string, unknown>,
): MockProviderError => ({
  code,
  message,
  retryable,
  ...(details ? { details } : {}),
});

export const normalizeMainlandMobile = (mobile: string): string => {
  const compact = mobile.replace(/[\s-]/g, "");
  const withoutCountryCode = compact.startsWith("+86")
    ? compact.slice(3)
    : compact;

  if (!/^1[3-9]\d{9}$/.test(withoutCountryCode)) {
    throw providerError(
      "INVALID_INPUT",
      "Expected a mainland China mobile number.",
      false,
    );
  }

  return `+86${withoutCountryCode}`;
};

export const maskMainlandMobile = (mobile: string): string => {
  const normalized = normalizeMainlandMobile(mobile);
  return `${normalized.slice(0, 6)}****${normalized.slice(-4)}`;
};

export const nowIso = (): string => new Date().toISOString();
