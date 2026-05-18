import { parseRefundReviewQuerySurfaceRequest } from "../refund-state-mutation-review-query-surface-request";

describe("refund state mutation review query surface request parser", () => {
  it("parses an explicit source key request", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      }),
    ).toEqual({
      status: "valid",
      selector: {
        selectorMode: "explicit_source_key",
        localOnly: true,
        fixtureSourceKey: "operator_review_ready_fixture_001",
      },
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    });
  });

  it("rejects missing selector fields", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "scenario_default",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_SELECTOR_INVALID",
      reason:
        "Refund review query surface scenario selector requires scenario_type.",
    });
  });

  it("rejects invalid query payloads", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "provider_refund_reference",
        provider_name: "wechat_pay",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_QUERY_INVALID",
      reason:
        "Refund review query surface query_kind 'provider_refund_reference' is invalid or missing required fields.",
    });
  });

  it("rejects unsupported scenario types", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "scenario_default",
        scenario_type: "unsupported_scenario",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_SELECTOR_INVALID",
      reason:
        "Refund review query surface scenario selector requires scenario_type.",
    });
  });

  it("rejects unsupported provider names", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "provider_refund_reference",
        provider_name: "unknown_provider",
        provider_refund_reference: "refund_ref_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_QUERY_INVALID",
      reason:
        "Refund review query surface query_kind 'provider_refund_reference' is invalid or missing required fields.",
    });
  });

  it("rejects whitespace-only explicit fixture source keys", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "explicit_source_key",
        fixture_source_key: "   ",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_SELECTOR_INVALID",
      reason:
        "Refund review query surface explicit selector requires fixture_source_key.",
    });
  });

  it("rejects whitespace-only provider refund references", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "provider_refund_reference",
        provider_name: "wechat_pay",
        provider_refund_reference: "   ",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_QUERY_INVALID",
      reason:
        "Refund review query surface query_kind 'provider_refund_reference' is invalid or missing required fields.",
    });
  });

  it("rejects ambiguous multi-value selector_mode arrays", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: ["explicit_source_key", "scenario_default"],
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_SELECTOR_INVALID",
      reason:
        "Refund review query surface requires selector_mode=explicit_source_key or scenario_default.",
    });
  });

  it("rejects ambiguous multi-value provider_name arrays", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "provider_refund_reference",
        provider_name: ["wechat_pay", "alipay"],
        provider_refund_reference: "refund_ref_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_QUERY_INVALID",
      reason:
        "Refund review query surface query_kind 'provider_refund_reference' is invalid or missing required fields.",
    });
  });

  it("rejects whitespace-only selector_mode", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "   ",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "platform_refund_id",
        platform_refund_id: "refund_platform_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_SELECTOR_INVALID",
      reason:
        "Refund review query surface requires selector_mode=explicit_source_key or scenario_default.",
    });
  });

  it("rejects whitespace-only query_kind", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest({
        selector_mode: "explicit_source_key",
        fixture_source_key: "operator_review_ready_fixture_001",
        query_kind: "   ",
        platform_refund_id: "refund_platform_001",
      }),
    ).toEqual({
      status: "invalid",
      code: "REQUEST_QUERY_MISSING",
      reason: "Refund review query surface requires query_kind.",
    });
  });

  it("allows repository mode style queries without selector when selector is optional", () => {
    expect(
      parseRefundReviewQuerySurfaceRequest(
        {
          query_kind: "platform_refund_id",
          platform_refund_id: "refund_platform_001",
        },
        {
          selectorRequired: false,
        },
      ),
    ).toEqual({
      status: "valid",
      selector: undefined,
      query: {
        kind: "platform_refund_id",
        platformRefundId: "refund_platform_001",
      },
    });
  });
});
