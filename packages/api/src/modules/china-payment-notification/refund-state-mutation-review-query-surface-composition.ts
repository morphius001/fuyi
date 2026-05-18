import {
  parseRefundReviewQuerySurfaceConfig,
  RefundReviewQuerySurfaceConfigDecision,
} from "./refund-state-mutation-review-query-surface-config";
import {
  RefundReviewFixtureAdapterQuery,
} from "./refund-state-mutation-review-fixture-adapter";
import { RefundReviewFixtureSelectorInput } from "./refund-state-mutation-review-fixture-registry";
import {
  buildRefundReviewQuerySurfaceDisabledResponse,
  buildRefundReviewQuerySurfaceRepositoryResolverResponse,
  buildRefundReviewQuerySurfaceResolverResponse,
  RefundReviewQuerySurfaceSafeResponse,
} from "./refund-state-mutation-review-query-surface-response";
import { resolveRefundReviewQuerySurfaceLocalResult } from "./refund-state-mutation-review-query-surface-local-resolver";
import {
  RefundReviewQuerySurfaceRepositoryReaders,
  resolveRefundReviewQuerySurfaceRepositoryResult,
} from "./refund-state-mutation-review-query-surface-repository-resolver";

export type RefundReviewQuerySurfaceCompositionInput = {
  env: Record<string, string | undefined>;
  environment: "development" | "test" | "staging" | "production";
  selector?: RefundReviewFixtureSelectorInput;
  query: RefundReviewFixtureAdapterQuery;
  repositories?: RefundReviewQuerySurfaceRepositoryReaders;
};

export type RefundReviewQuerySurfaceCompositionResult = {
  config: RefundReviewQuerySurfaceConfigDecision;
  response: RefundReviewQuerySurfaceSafeResponse;
};

export const resolveRefundReviewQuerySurfaceRequest = async (
  input: RefundReviewQuerySurfaceCompositionInput,
): Promise<RefundReviewQuerySurfaceCompositionResult> => {
  const config = parseRefundReviewQuerySurfaceConfig(input.env);

  if (!config.enabled) {
    return {
      config,
      response: buildRefundReviewQuerySurfaceDisabledResponse(config),
    };
  }

  if (config.mode === "isolated_preprod_repository") {
    const resolution = input.repositories
      ? await resolveRefundReviewQuerySurfaceRepositoryResult({
          mode: config.mode,
          environment: {
            environment: input.environment,
            isolatedPreprodVerified: config.targetEnv === "isolated_preprod",
          },
          query: input.query,
          repositories: input.repositories,
        })
      : {
          status: "blocked" as const,
          blockCode: "resolver_repository_mode_blocked" as const,
          reason:
            "Refund review query surface repository readers are not available.",
        };

    return {
      config,
      response: buildRefundReviewQuerySurfaceRepositoryResolverResponse(
        config.mode,
        resolution,
      ),
    };
  }

  const resolution = resolveRefundReviewQuerySurfaceLocalResult({
    mode: config.mode,
    environment: input.environment,
    selector: input.selector,
    query: input.query,
  });

  return {
    config,
    response: buildRefundReviewQuerySurfaceResolverResponse(
      config.mode,
      resolution,
    ),
  };
};
