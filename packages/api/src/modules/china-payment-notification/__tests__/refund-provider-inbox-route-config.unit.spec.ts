import { parseRefundProviderInboxRouteConfig } from "../refund-provider-inbox-route-config";

const localWechatEnv = {
  NODE_ENV: "development",
  CHINA_REFUND_RUNTIME_ENABLED: "true",
  CHINA_REFUND_NOTIFY_ROUTE_ENABLED: "true",
  CHINA_REFUND_STATE_MUTATION_ENABLED: "false",
  CHINA_REFUND_PROVIDER: "wechat_pay",
  CHINA_REFUND_ROUTE_MODE: "provider_inbox_only",
  CHINA_REFUND_TARGET_ENV: "local",
  CHINA_REFUND_INBOX_LOCAL_INMEMORY: "true",
};

const localWechatDbEnv = {
  ...localWechatEnv,
  CHINA_REFUND_INBOX_LOCAL_INMEMORY: "false",
  CHINA_REFUND_INBOX_LOCAL_DB: "true",
};

describe("refund provider inbox route config", () => {
  it("is disabled by default", () => {
    const decision = parseRefundProviderInboxRouteConfig({}, "wechat_pay");

    expect(decision).toMatchObject({
      enabled: false,
      provider: "wechat_pay",
      code: "REFUND_PROVIDER_ROUTE_DISABLED",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      fixtureOnly: true,
      executable: false,
    });
  });

  it("blocks production-like environments before local route mode", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatEnv,
        NODE_ENV: "production",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED",
    });
  });

  it.each(["production", "prod", "preprod", "staging"])(
    "blocks NODE_ENV=%s as production-like",
    (nodeEnv) => {
      const decision = parseRefundProviderInboxRouteConfig(
        {
          ...localWechatDbEnv,
          NODE_ENV: nodeEnv,
        },
        "wechat_pay",
      );

      expect(decision).toMatchObject({
        enabled: false,
        code: "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED",
        runtimeMutationBlocked: true,
        stateMutationBlocked: true,
        fixtureOnly: true,
        executable: false,
      });
    },
  );

  it.each(["production", "prod", "preprod", "staging"])(
    "blocks APP_ENV=%s as production-like",
    (appEnv) => {
      const decision = parseRefundProviderInboxRouteConfig(
        {
          ...localWechatDbEnv,
          APP_ENV: appEnv,
        },
        "wechat_pay",
      );

      expect(decision).toMatchObject({
        enabled: false,
        code: "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED",
        runtimeMutationBlocked: true,
        stateMutationBlocked: true,
        fixtureOnly: true,
        executable: false,
      });
    },
  );

  it("blocks production-like environments before state mutation and secret checks", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatDbEnv,
        APP_ENV: "staging",
        CHINA_REFUND_STATE_MUTATION_ENABLED: "true",
        CHINA_REFUND_WECHAT_API_V3_KEY: "APIv3-live-looking-key",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      fixtureOnly: true,
      executable: false,
    });
  });

  it("blocks state mutation even when notify route flags are enabled", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatEnv,
        CHINA_REFUND_STATE_MUTATION_ENABLED: "true",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_STATE_MUTATION_BLOCKED",
    });
  });

  it("blocks provider mismatch", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatEnv,
        CHINA_REFUND_PROVIDER: "alipay",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_PROVIDER_MISMATCH",
    });
  });

  it("blocks non-local target environment", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatEnv,
        CHINA_REFUND_TARGET_ENV: "disposable_preprod",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_ENV_UNSUPPORTED",
    });
  });

  it("allows exactly one local disposable DB storage mode", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      localWechatDbEnv,
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: true,
      provider: "wechat_pay",
      storage: "local_disposable_db",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      fixtureOnly: true,
      executable: false,
    });
  });

  it("blocks ambiguous local storage modes", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatEnv,
        CHINA_REFUND_INBOX_LOCAL_DB: "true",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_STORAGE_UNSUPPORTED",
    });
  });

  it("blocks app-level production-like environments", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatDbEnv,
        APP_ENV: "preprod",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_PRODUCTION_BLOCKED",
    });
  });

  it("blocks real-looking secrets in local configuration", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatEnv,
        CHINA_REFUND_WECHAT_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: false,
      code: "REFUND_PROVIDER_ROUTE_SECRET_BLOCKED",
    });
  });

  it("does not treat unrelated preprod gate env keys as real secrets", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      {
        ...localWechatEnv,
        PREPROD_DISPOSABLE_DB_REHEARSAL_CONFIRMED: "true",
      },
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: true,
      provider: "wechat_pay",
      mode: "provider_inbox_only",
      targetEnv: "local",
      storage: "local_inmemory",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      fixtureOnly: true,
      executable: false,
    });
  });

  it("allows only local in-memory provider inbox shadow config", () => {
    const decision = parseRefundProviderInboxRouteConfig(
      localWechatEnv,
      "wechat_pay",
    );

    expect(decision).toMatchObject({
      enabled: true,
      provider: "wechat_pay",
      mode: "provider_inbox_only",
      targetEnv: "local",
      storage: "local_inmemory",
      runtimeMutationBlocked: true,
      stateMutationBlocked: true,
      fixtureOnly: true,
      executable: false,
    });
  });
});
