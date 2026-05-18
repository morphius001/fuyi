import { resolveRefundReviewCaseFromFixtureSelector } from "..";
import {
  operatorReviewReadyFixtureScenarioType,
  operatorReviewReadyFixtureSourceKey,
} from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

describe("refund state mutation review fixture adapter", () => {
  it("resolves a review case from an explicit fixture source key", () => {
    const result = resolveRefundReviewCaseFromFixtureSelector(
      {
        selectorMode: "explicit_source_key",
        localOnly: true,
        fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      },
      {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    );

    expect(result).toMatchObject({
      status: "resolved",
      selectorResolution: {
        resolvedBy: "explicit_source_key",
        manifestEntry: {
          fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
        },
      },
      reviewCaseResult: {
        resultType: "review_case",
        platformRefundId: "refund_platform_001",
      },
    });
  });

  it("resolves a review case from a scenario default fixture", () => {
    const result = resolveRefundReviewCaseFromFixtureSelector(
      {
        selectorMode: "scenario_default",
        localOnly: true,
        scenarioType: operatorReviewReadyFixtureScenarioType,
      },
      {
        kind: "provider_refund_reference",
        providerName: "wechat_pay",
        providerRefundReference: "wx_refund_001",
      },
    );

    expect(result).toMatchObject({
      status: "resolved",
      selectorResolution: {
        resolvedBy: "default_scenario_fixture",
      },
      reviewCaseResult: {
        resultType: "review_case",
        providerRefundReference: "wx_refund_001",
      },
    });
  });

  it("fails closed when the fixture selector is invalid", () => {
    const result = resolveRefundReviewCaseFromFixtureSelector(
      {
        selectorMode: "explicit_source_key",
        localOnly: true,
        fixtureSourceKey: "missing_fixture_source_key",
      },
      {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    );

    expect(result).toEqual({
      status: "blocked",
      blockCode: "fixture_selector_invalid",
      reason:
        "Unknown refund review fixture source key 'missing_fixture_source_key'.",
    });
  });

  it("returns a redacted blocked review case when the requested query key is missing in the fixture", () => {
    const result = resolveRefundReviewCaseFromFixtureSelector(
      {
        selectorMode: "explicit_source_key",
        localOnly: true,
        fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      },
      {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_missing",
      },
    );

    expect(result).toMatchObject({
      status: "resolved",
      reviewCaseResult: {
        resultType: "blocked",
        blockCode: "review_case_not_found",
      },
    });
  });
});
