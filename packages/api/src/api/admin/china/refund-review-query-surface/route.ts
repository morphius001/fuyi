import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

import { buildRefundReviewQuerySurfaceDisabledResponse } from "../../../../modules/china-payment-notification/refund-state-mutation-review-query-surface-response";
import { parseRefundReviewQuerySurfaceRequest } from "../../../../modules/china-payment-notification/refund-state-mutation-review-query-surface-request";
import { parseRefundReviewQuerySurfaceConfig } from "../../../../modules/china-payment-notification/refund-state-mutation-review-query-surface-config";
import { resolveRefundReviewQuerySurfaceRequest } from "../../../../modules/china-payment-notification/refund-state-mutation-review-query-surface-composition";
import { resolveChinaPaymentNotificationModuleServiceFromScope } from "../../../../modules/china-payment-notification/module-service-scope";
import { ContainerLike } from "../../../../modules/china-payment-notification/container-access";

const buildConfigInput = () => ({
  NODE_ENV: process.env.NODE_ENV,
  APP_ENV: process.env.APP_ENV,
  CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED:
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_ENABLED,
  CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE:
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_MODE,
  CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV:
    process.env.CHINA_REFUND_REVIEW_QUERY_SURFACE_TARGET_ENV,
});

const normalizedEnvValue = (value?: string) => {
  const candidate = value?.trim().toLowerCase();

  return candidate ? candidate : undefined;
};

const resolveRuntimeEnvironment = (): "development" | "test" | "staging" | "production" => {
  const candidate =
    normalizedEnvValue(process.env.APP_ENV) ??
    normalizedEnvValue(process.env.NODE_ENV) ??
    "development";

  if (candidate === "production" || candidate === "prod") {
    return "production";
  }

  if (candidate === "staging" || candidate === "preprod") {
    return "staging";
  }

  if (candidate === "test") {
    return "test";
  }

  return "development";
};

const resolveRequestScope = (req: MedusaRequest): ContainerLike | undefined =>
  (req as MedusaRequest & { scope?: ContainerLike }).scope;

const resolveRepositoryReaders = async (req: MedusaRequest) => {
  const scope = resolveRequestScope(req);

  return (
    (await resolveChinaPaymentNotificationModuleServiceFromScope(
      scope,
    )?.resolveRefundReviewQuerySurfaceRepositoryReaders(scope)) ?? undefined
  );
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const config = parseRefundReviewQuerySurfaceConfig(buildConfigInput());

  if (!config.enabled) {
    return res
      .status(503)
      .json(buildRefundReviewQuerySurfaceDisabledResponse(config));
  }

  const parsedRequest = parseRefundReviewQuerySurfaceRequest(
    (req.query ?? {}) as Record<string, unknown>,
    {
      selectorRequired: config.mode === "local_fixture",
    },
  );

  if (parsedRequest.status === "invalid") {
    return res.status(400).json({
      status: "blocked",
      surface: "refund_state_mutation_review_query_surface",
      mode: config.mode,
      code: parsedRequest.code,
      reason: parsedRequest.reason,
      runtimeMutationBlocked: true,
      workflowExecutionAllowed: false,
      stateMutationAllowed: false,
      refundSuccessState: false,
    });
  }

  const response = (
    await resolveRefundReviewQuerySurfaceRequest({
      env: buildConfigInput(),
      environment: resolveRuntimeEnvironment(),
      selector: parsedRequest.selector,
      query: parsedRequest.query,
      repositories: await resolveRepositoryReaders(req),
    })
  ).response;

  return res.status(response.status === "blocked" ? 400 : 200).json(response);
}
