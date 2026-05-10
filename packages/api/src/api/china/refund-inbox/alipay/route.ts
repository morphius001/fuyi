import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import {
  buildRefundProviderInboxRouteDisabledResponse,
  parseRefundProviderInboxRouteConfig,
} from "../../../../modules/china-payment-notification";

const methodNotAllowedBody = () => ({
  status: "disabled",
  surface: "refund_provider_inbox",
  provider: "alipay",
  runtime: "method_not_allowed",
  runtimeMutationBlocked: true,
  stateMutationBlocked: true,
  allowedMethods: ["POST"],
});

export const POST = async (_req: MedusaRequest, res: MedusaResponse) => {
  const decision = parseRefundProviderInboxRouteConfig(process.env, "alipay");

  return res.status(503).json(
    buildRefundProviderInboxRouteDisabledResponse(
      decision.enabled
        ? {
            enabled: false,
            provider: "alipay",
            mode: decision.mode,
            code: "REFUND_PROVIDER_ROUTE_DISABLED",
            reason:
              "Alipay refund provider inbox route shadow is intentionally disabled until inbox wiring lands in a later PR.",
            stateMutationBlocked: true,
            runtimeMutationBlocked: true,
            fixtureOnly: true,
            executable: false,
          }
        : decision,
    ),
  );
};

export const GET = async (_req: MedusaRequest, res: MedusaResponse) =>
  res.status(405).json(methodNotAllowedBody());
