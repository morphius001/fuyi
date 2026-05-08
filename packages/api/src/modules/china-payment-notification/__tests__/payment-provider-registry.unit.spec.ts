import { resolveChinaPaymentProviderAdapter } from "..";

describe("China payment provider registry contract", () => {
  it("is disabled by default", () => {
    const decision = resolveChinaPaymentProviderAdapter({});

    expect(decision).toEqual({
      resolved: false,
      provider: "unknown",
      mode: "disabled",
      reason: "China payment provider registry is disabled by default.",
    });
  });

  it("refuses production even when mock contract mode is requested", () => {
    const decision = resolveChinaPaymentProviderAdapter({
      provider: "mock_china_pay",
      mode: "mock_contract_only",
      nodeEnv: "production",
    });

    expect(decision).toEqual({
      resolved: false,
      provider: "mock_china_pay",
      mode: "mock_contract_only",
      reason: "China payment provider registry refuses production by default.",
    });
  });

  it("requires an explicit non-production environment before resolving", () => {
    const decision = resolveChinaPaymentProviderAdapter({
      provider: "mock_china_pay",
      mode: "mock_contract_only",
    });

    expect(decision).toEqual({
      resolved: false,
      provider: "mock_china_pay",
      mode: "mock_contract_only",
      reason:
        "China payment provider registry requires an explicit non-production environment.",
    });
  });

  it("resolves only mock provider in explicit contract-only mode", () => {
    const decision = resolveChinaPaymentProviderAdapter({
      provider: "mock_china_pay",
      mode: "mock_contract_only",
      nodeEnv: "test",
    });

    expect(decision.resolved).toBe(true);

    if (!decision.resolved) {
      throw new Error("expected registry decision to resolve mock provider");
    }

    expect(decision.adapter.config).toEqual({
      provider: "mock_china_pay",
      mode: "contract_only",
      secretRef: "mock-only",
    });
  });

  it("refuses real providers until dedicated adapter tasks exist", () => {
    const alipay = resolveChinaPaymentProviderAdapter({
      provider: "alipay",
      mode: "mock_contract_only",
      nodeEnv: "test",
    });
    const wechat = resolveChinaPaymentProviderAdapter({
      provider: "wechat_pay",
      mode: "mock_contract_only",
      nodeEnv: "test",
    });

    expect(alipay).toMatchObject({
      resolved: false,
      provider: "alipay",
    });
    expect(wechat).toMatchObject({
      resolved: false,
      provider: "wechat_pay",
    });
  });

  it("does not expose payment workflow or checkout runtime hooks", () => {
    const decision = resolveChinaPaymentProviderAdapter({
      provider: "mock_china_pay",
      mode: "mock_contract_only",
      nodeEnv: "test",
    });

    expect(JSON.stringify(decision)).not.toContain("execute_workflow");
    expect(JSON.stringify(decision)).not.toContain("checkout");
  });
});
