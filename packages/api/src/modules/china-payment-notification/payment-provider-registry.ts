import {
  createMockChinaPaymentProviderContract,
  MockChinaPaymentProviderContract,
  MockChinaPaymentProviderName,
} from "./mock-china-payment-provider";

export type ChinaPaymentProviderRegistryProvider =
  | MockChinaPaymentProviderName
  | "alipay"
  | "wechat_pay";

export type ChinaPaymentProviderRegistryMode =
  | "disabled"
  | "mock_contract_only";

export type ChinaPaymentProviderRegistryInput = {
  provider?: string;
  mode?: string;
  nodeEnv?: string;
};

export type ChinaPaymentProviderRegistryDecision =
  | {
      resolved: true;
      provider: MockChinaPaymentProviderName;
      mode: "mock_contract_only";
      adapter: MockChinaPaymentProviderContract;
      reason: string;
    }
  | {
      resolved: false;
      provider: ChinaPaymentProviderRegistryProvider | "unknown";
      mode: ChinaPaymentProviderRegistryMode;
      reason: string;
    };

const normalizeProvider = (
  provider?: string,
): ChinaPaymentProviderRegistryProvider | "unknown" => {
  if (provider === "mock_china_pay" || provider === "alipay" || provider === "wechat_pay") {
    return provider;
  }

  return "unknown";
};

const normalizeMode = (mode?: string): ChinaPaymentProviderRegistryMode => {
  if (mode === "mock_contract_only") {
    return mode;
  }

  return "disabled";
};

const nonProductionEnvironments = new Set([
  "development",
  "local",
  "preprod",
  "test",
]);

export const resolveChinaPaymentProviderAdapter = (
  input: ChinaPaymentProviderRegistryInput,
): ChinaPaymentProviderRegistryDecision => {
  const provider = normalizeProvider(input.provider);
  const mode = normalizeMode(input.mode);

  if (input.nodeEnv === "production") {
    return {
      resolved: false,
      provider,
      mode,
      reason: "China payment provider registry refuses production by default.",
    };
  }

  if (mode === "disabled") {
    return {
      resolved: false,
      provider,
      mode,
      reason: "China payment provider registry is disabled by default.",
    };
  }

  if (!input.nodeEnv || !nonProductionEnvironments.has(input.nodeEnv)) {
    return {
      resolved: false,
      provider,
      mode,
      reason: "China payment provider registry requires an explicit non-production environment.",
    };
  }

  if (provider !== "mock_china_pay") {
    return {
      resolved: false,
      provider,
      mode,
      reason: `China payment provider is not available in registry contract mode: ${provider}.`,
    };
  }

  return {
    resolved: true,
    provider,
    mode,
    adapter: createMockChinaPaymentProviderContract(),
    reason: "Mock China payment provider contract resolved.",
  };
};
