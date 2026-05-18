import {
  RefundReviewFixtureAdapterQuery,
} from "./refund-state-mutation-review-fixture-adapter";
import {
  RefundReviewFixtureScenarioType,
  RefundReviewFixtureSelectorInput,
  listRefundReviewFixtureScenarioTypes,
} from "./refund-state-mutation-review-fixture-registry";

export type RefundReviewQuerySurfaceParsedRequest =
  | {
      status: "invalid";
      code:
        | "REQUEST_SELECTOR_INVALID"
        | "REQUEST_QUERY_INVALID"
        | "REQUEST_QUERY_MISSING";
      reason: string;
    }
  | {
      status: "valid";
      selector?: RefundReviewFixtureSelectorInput;
      query: RefundReviewFixtureAdapterQuery;
    };

const stringValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return value.length === 1 && typeof value[0] === "string"
      ? value[0]
      : undefined;
  }

  return typeof value === "string" ? value : undefined;
};

const nonEmptyStringValue = (value: unknown): string | undefined => {
  const candidate = stringValue(value)?.trim();

  return candidate ? candidate : undefined;
};

const supportedScenarioTypes = new Set(listRefundReviewFixtureScenarioTypes());
const supportedProviderNames = new Set([
  "wechat_pay",
  "alipay",
  "mock_china_pay",
]);

const scenarioTypeValue = (
  value: unknown,
): RefundReviewFixtureScenarioType | undefined => {
  const candidate = nonEmptyStringValue(value);

  return candidate && supportedScenarioTypes.has(candidate as never)
    ? (candidate as RefundReviewFixtureScenarioType)
    : undefined;
};

const providerNameValue = (value: unknown) => {
  const candidate = nonEmptyStringValue(value);

  return candidate && supportedProviderNames.has(candidate)
    ? (candidate as "wechat_pay" | "alipay" | "mock_china_pay")
    : undefined;
};

export const parseRefundReviewQuerySurfaceRequest = (
  query: Record<string, unknown>,
  options?: {
    selectorRequired?: boolean;
  },
): RefundReviewQuerySurfaceParsedRequest => {
  const selectorRequired = options?.selectorRequired ?? true;
  const selectorMode = nonEmptyStringValue(query.selector_mode);

  let selector: RefundReviewFixtureSelectorInput | undefined;

  if (selectorMode === "explicit_source_key") {
    const fixtureSourceKey = nonEmptyStringValue(query.fixture_source_key);

    if (!fixtureSourceKey) {
      return {
        status: "invalid",
        code: "REQUEST_SELECTOR_INVALID",
        reason:
          "Refund review query surface explicit selector requires fixture_source_key.",
      };
    }

    selector = {
      selectorMode: "explicit_source_key",
      localOnly: true,
      fixtureSourceKey,
    };
  } else if (selectorMode === "scenario_default") {
    const scenarioType = scenarioTypeValue(query.scenario_type);

    if (!scenarioType) {
      return {
        status: "invalid",
        code: "REQUEST_SELECTOR_INVALID",
        reason:
          "Refund review query surface scenario selector requires scenario_type.",
      };
    }

    selector = {
      selectorMode: "scenario_default",
      localOnly: true,
      scenarioType,
    };
  } else if (selectorRequired) {
    return {
      status: "invalid",
      code: "REQUEST_SELECTOR_INVALID",
      reason:
        "Refund review query surface requires selector_mode=explicit_source_key or scenario_default.",
    };
  }

  const queryKind = nonEmptyStringValue(query.query_kind);

  if (!queryKind) {
    return {
      status: "invalid",
      code: "REQUEST_QUERY_MISSING",
      reason: "Refund review query surface requires query_kind.",
    };
  }

  const parsedQuery = (() => {
    switch (queryKind) {
      case "platform_refund_id": {
        const platformRefundId = nonEmptyStringValue(query.platform_refund_id);

        return platformRefundId
          ? ({
              kind: "platform_refund_id",
              platformRefundId,
            } satisfies RefundReviewFixtureAdapterQuery)
          : undefined;
      }
      case "approval_persistence_idempotency_key": {
        const approvalPersistenceIdempotencyKey = nonEmptyStringValue(
          query.approval_persistence_idempotency_key,
        );

        return approvalPersistenceIdempotencyKey
          ? ({
              kind: "approval_persistence_idempotency_key",
              approvalPersistenceIdempotencyKey,
            } satisfies RefundReviewFixtureAdapterQuery)
          : undefined;
      }
      case "runtime_attempt_persistence_idempotency_key": {
        const runtimeAttemptPersistenceIdempotencyKey = nonEmptyStringValue(
          query.runtime_attempt_persistence_idempotency_key,
        );

        return runtimeAttemptPersistenceIdempotencyKey
          ? ({
              kind: "runtime_attempt_persistence_idempotency_key",
              runtimeAttemptPersistenceIdempotencyKey,
            } satisfies RefundReviewFixtureAdapterQuery)
          : undefined;
      }
      case "terminal_conflict_persistence_idempotency_key": {
        const terminalConflictPersistenceIdempotencyKey = nonEmptyStringValue(
          query.terminal_conflict_persistence_idempotency_key,
        );

        return terminalConflictPersistenceIdempotencyKey
          ? ({
              kind: "terminal_conflict_persistence_idempotency_key",
              terminalConflictPersistenceIdempotencyKey,
            } satisfies RefundReviewFixtureAdapterQuery)
          : undefined;
      }
      case "provider_refund_reference": {
        const providerName = providerNameValue(query.provider_name);
        const providerRefundReference = nonEmptyStringValue(
          query.provider_refund_reference,
        );

        return providerName && providerRefundReference
          ? ({
              kind: "provider_refund_reference",
              providerName,
              providerRefundReference,
            } satisfies RefundReviewFixtureAdapterQuery)
          : undefined;
      }
      default:
        return undefined;
    }
  })();

  if (!parsedQuery) {
    return {
      status: "invalid",
      code: "REQUEST_QUERY_INVALID",
      reason: `Refund review query surface query_kind '${queryKind}' is invalid or missing required fields.`,
    };
  }

  return {
    status: "valid",
    selector,
    query: parsedQuery,
  };
};
