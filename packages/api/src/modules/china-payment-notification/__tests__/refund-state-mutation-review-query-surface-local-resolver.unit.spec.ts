import { resolveRefundReviewQuerySurfaceLocalResult } from "..";
import {
  operatorReviewReadyFixtureScenarioType,
  operatorReviewReadyFixtureSourceKey,
} from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

describe("refund state mutation review query surface local resolver", () => {
  it("blocks when resolver mode is disabled", () => {
    expect(
      resolveRefundReviewQuerySurfaceLocalResult({
        mode: "disabled",
        environment: "development",
        query: {
          kind: "platform_refund_id",
          platformRefundId: "refund_platform_001",
        },
      }),
    ).toEqual({
      status: "blocked",
      blockCode: "resolver_runtime_mode_blocked",
      reason: "Refund review query surface resolver mode is disabled.",
    });
  });

  it("blocks local fixture mode in production", () => {
    expect(
      resolveRefundReviewQuerySurfaceLocalResult({
        mode: "local_fixture",
        environment: "production",
        selector: {
          selectorMode: "explicit_source_key",
          localOnly: true,
          fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
        },
        query: {
          kind: "platform_refund_id",
          platformRefundId: "refund_platform_001",
        },
      }),
    ).toEqual({
      status: "blocked",
      blockCode: "resolver_runtime_environment_blocked",
      reason:
        "Refund review query surface local fixture mode is blocked in production.",
    });
  });

  it("blocks when local fixture mode has no selector", () => {
    expect(
      resolveRefundReviewQuerySurfaceLocalResult({
        mode: "local_fixture",
        environment: "development",
        query: {
          kind: "platform_refund_id",
          platformRefundId: "refund_platform_001",
        },
      }),
    ).toEqual({
      status: "blocked",
      blockCode: "resolver_runtime_source_gate_blocked",
      reason:
        "Refund review query surface local fixture mode requires an explicit selector.",
    });
  });

  it("resolves a local fixture review case through scenario default", () => {
    const result = resolveRefundReviewQuerySurfaceLocalResult({
      mode: "local_fixture",
      environment: "staging",
      selector: {
        selectorMode: "scenario_default",
        localOnly: true,
        scenarioType: operatorReviewReadyFixtureScenarioType,
      },
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    });

    expect(result).toMatchObject({
      status: "resolved",
      result: {
        status: "resolved",
        reviewCaseResult: {
          resultType: "review_case",
          platformRefundId: "refund_platform_001",
        },
      },
    });
  });
});
