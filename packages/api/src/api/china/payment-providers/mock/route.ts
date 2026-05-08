import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const runtimeRequested = () =>
  process.env.CHINA_PAYMENT_NOTIFICATION_RUNTIME_ENABLED === "true" ||
  process.env.CHINA_PAYMENT_PROVIDER_REGISTRY_MODE === "mock_contract_only";

export const POST = async (_req: MedusaRequest, res: MedusaResponse) => {
  const productionBlocked = process.env.NODE_ENV === "production";

  return res.status(503).json({
    status: "disabled",
    provider: "mock_china_pay",
    runtime: productionBlocked ? "production_blocked" : "disabled",
    reason: productionBlocked
      ? "Mock China payment provider runtime is blocked in production."
      : "Mock China payment provider runtime is disabled.",
    runtimeRequested: runtimeRequested(),
  });
};
