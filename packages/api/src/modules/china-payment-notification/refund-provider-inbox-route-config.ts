export type RefundProviderInboxRouteProvider = "wechat_pay" | "alipay";

export type RefundProviderInboxRouteMode =
  | "disabled"
  | "provider_inbox_only"
  | "provider_runtime_shadow";

export type RefundProviderInboxRouteDisabledCode =
  | "REFUND_PROVIDER_ROUTE_DISABLED"
  | "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED"
  | "REFUND_PROVIDER_ROUTE_STATE_MUTATION_BLOCKED"
  | "REFUND_PROVIDER_ROUTE_PROVIDER_MISMATCH"
  | "REFUND_PROVIDER_ROUTE_MODE_UNSUPPORTED"
  | "REFUND_PROVIDER_ROUTE_ENV_UNSUPPORTED"
  | "REFUND_PROVIDER_ROUTE_STORAGE_UNSUPPORTED"
  | "REFUND_PROVIDER_ROUTE_SECRET_BLOCKED";

export type RefundProviderInboxRouteConfigDecision =
  | {
      enabled: true;
      provider: RefundProviderInboxRouteProvider;
      mode: Exclude<RefundProviderInboxRouteMode, "disabled">;
      targetEnv: "local";
      storage: "local_inmemory" | "local_disposable_db";
      stateMutationBlocked: true;
      runtimeMutationBlocked: true;
      fixtureOnly: true;
      executable: false;
    }
  | {
      enabled: false;
      provider: RefundProviderInboxRouteProvider;
      mode: RefundProviderInboxRouteMode;
      code: RefundProviderInboxRouteDisabledCode;
      reason: string;
      stateMutationBlocked: true;
      runtimeMutationBlocked: true;
      fixtureOnly: true;
      executable: false;
    };

const productionLikeEnvironments = new Set([
  "production",
  "prod",
  "preprod",
  "staging",
]);

const providerValues = new Set(["wechat_pay", "alipay"]);

const realSecretLikePattern =
  /(BEGIN .*PRIVATE KEY|PRIVATE KEY|APIv3|mchid_live|app_live|prod_|sk_live|-----BEGIN CERTIFICATE-----)/i;

const value = (
  env: Record<string, string | undefined>,
  key: string,
): string | undefined => {
  const candidate = env[key];

  return candidate === "" ? undefined : candidate;
};

const isTrue = (
  env: Record<string, string | undefined>,
  key: string,
): boolean => value(env, key) === "true";

const disabled = (
  provider: RefundProviderInboxRouteProvider,
  mode: RefundProviderInboxRouteMode,
  code: RefundProviderInboxRouteDisabledCode,
  reason: string,
): RefundProviderInboxRouteConfigDecision => ({
  enabled: false,
  provider,
  mode,
  code,
  reason,
  stateMutationBlocked: true,
  runtimeMutationBlocked: true,
  fixtureOnly: true,
  executable: false,
});

export const parseRefundProviderInboxRouteConfig = (
  env: Record<string, string | undefined>,
  routeProvider: RefundProviderInboxRouteProvider,
): RefundProviderInboxRouteConfigDecision => {
  const nodeEnv = value(env, "NODE_ENV")?.toLowerCase();
  const appEnv = value(env, "APP_ENV")?.toLowerCase();
  const mode = (value(env, "CHINA_REFUND_ROUTE_MODE") ??
    "disabled") as RefundProviderInboxRouteMode;
  const configuredProvider = value(env, "CHINA_REFUND_PROVIDER");

  if (
    productionLikeEnvironments.has(nodeEnv ?? "") ||
    productionLikeEnvironments.has(appEnv ?? "")
  ) {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED",
      "Refund provider inbox route is blocked in production-like environments.",
    );
  }

  if (
    !isTrue(env, "CHINA_REFUND_RUNTIME_ENABLED") ||
    !isTrue(env, "CHINA_REFUND_NOTIFY_ROUTE_ENABLED") ||
    mode === "disabled"
  ) {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_DISABLED",
      "Refund provider inbox route is disabled.",
    );
  }

  if (isTrue(env, "CHINA_REFUND_STATE_MUTATION_ENABLED")) {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_STATE_MUTATION_BLOCKED",
      "Refund state mutation must remain disabled for provider inbox route shadow.",
    );
  }

  if (
    !configuredProvider ||
    !providerValues.has(configuredProvider) ||
    configuredProvider !== routeProvider
  ) {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_PROVIDER_MISMATCH",
      "Refund provider inbox route provider does not match the configured provider.",
    );
  }

  if (mode !== "provider_inbox_only" && mode !== "provider_runtime_shadow") {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_MODE_UNSUPPORTED",
      "Refund provider inbox route only supports inbox-only or non-executable shadow modes.",
    );
  }

  if (value(env, "CHINA_REFUND_TARGET_ENV") !== "local") {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_ENV_UNSUPPORTED",
      "Refund provider inbox route shadow is currently limited to local gate.",
    );
  }

  const localInMemory = isTrue(env, "CHINA_REFUND_INBOX_LOCAL_INMEMORY");
  const localDb = isTrue(env, "CHINA_REFUND_INBOX_LOCAL_DB");

  if (localInMemory === localDb) {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_STORAGE_UNSUPPORTED",
      "Refund provider inbox route shadow requires exactly one local storage mode.",
    );
  }

  const rawConfig = JSON.stringify(env);

  if (realSecretLikePattern.test(rawConfig)) {
    return disabled(
      routeProvider,
      mode,
      "REFUND_PROVIDER_ROUTE_SECRET_BLOCKED",
      "Refund provider inbox route shadow refuses real-looking secrets in local config.",
    );
  }

  return {
    enabled: true,
    provider: routeProvider,
    mode,
    targetEnv: "local",
    storage: localDb ? "local_disposable_db" : "local_inmemory",
    stateMutationBlocked: true,
    runtimeMutationBlocked: true,
    fixtureOnly: true,
    executable: false,
  };
};
