import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

const runtimeRequested = () =>
  process.env.CHINA_REFUND_INBOX_ROUTE_ENABLED === "true" ||
  process.env.CHINA_REFUND_INBOX_ROUTE_MODE === "mock_local_inbox_only";

const disabledBody = (productionBlocked: boolean) => ({
  status: "disabled",
  surface: "refund_inbox",
  provider: "mock_china_pay",
  runtime: productionBlocked ? "production_blocked" : "disabled",
  runtimeMutationBlocked: true,
  reason: productionBlocked
    ? "Refund inbox route is blocked in production."
    : "Refund inbox route is disabled.",
  runtimeRequested: runtimeRequested(),
});

const methodNotAllowedBody = () => ({
  status: "disabled",
  surface: "refund_inbox",
  runtime: "method_not_allowed",
  runtimeMutationBlocked: true,
  allowedMethods: ["POST"],
});

export const POST = async (_req: MedusaRequest, res: MedusaResponse) => {
  const productionBlocked = process.env.NODE_ENV === "production";

  return res.status(503).json(disabledBody(productionBlocked));
};

export const GET = async (_req: MedusaRequest, res: MedusaResponse) =>
  res.status(405).json(methodNotAllowedBody());
