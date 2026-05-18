import {
  listRefundReviewFixtureSourceKeys,
  loadRefundReviewFixtureBundleBySourceKey,
  loadRefundReviewFixtureManifestIndex,
  loadRefundReviewFixtureScenarioDefaults,
  resolveRefundReviewFixtureSelector,
  RefundReviewFixtureBundle,
  RefundReviewFixtureManifestEntry,
} from "..";
import {
  operatorReviewReadyFixtureScenarioType,
  operatorReviewReadyFixtureSourceKey,
} from "../fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

const baseManifestEntry: RefundReviewFixtureManifestEntry = {
  fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
  fixtureId: "fixture_operator_review_ready_001",
  scenarioType: operatorReviewReadyFixtureScenarioType,
  localOnly: true,
  redacted: true,
  version: "review_query_surface_fixture_v1",
  status: "active",
  defaultScenario: true,
};

describe("refund state mutation review fixture registry", () => {
  it("loads the local manifest and source key list", () => {
    const manifestResult = loadRefundReviewFixtureManifestIndex();

    expect(manifestResult.status).toBe("ready");
    expect(listRefundReviewFixtureSourceKeys()).toEqual([
      operatorReviewReadyFixtureSourceKey,
    ]);
  });

  it("resolves an explicit source key to a local redacted bundle", () => {
    const result = resolveRefundReviewFixtureSelector({
      selectorMode: "explicit_source_key",
      localOnly: true,
      fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
    });

    expect(result).toMatchObject({
      status: "resolved",
      resolvedBy: "explicit_source_key",
      manifestEntry: {
        fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      },
      bundle: {
        fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
        localOnly: true,
        redacted: true,
      },
    });
  });

  it("resolves a scenario default to the registered fixture bundle", () => {
    const defaults = loadRefundReviewFixtureScenarioDefaults();

    expect(defaults).toEqual({
      status: "ready",
      defaultsByScenarioType: {
        operator_review_ready: operatorReviewReadyFixtureSourceKey,
      },
    });

    const result = resolveRefundReviewFixtureSelector({
      selectorMode: "scenario_default",
      localOnly: true,
      scenarioType: operatorReviewReadyFixtureScenarioType,
    });

    expect(result).toMatchObject({
      status: "resolved",
      resolvedBy: "default_scenario_fixture",
      manifestEntry: {
        fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      },
      bundle: {
        fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      },
    });
  });

  it("fails closed when localOnly is not asserted", () => {
    const result = resolveRefundReviewFixtureSelector({
      selectorMode: "explicit_source_key",
      fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
    });

    expect(result).toEqual({
      status: "blocked",
      blockCode: "fixture_selector_local_only_required",
      reason: "Refund review fixture selector must remain local-only.",
    });
  });

  it("fails closed when scenario defaults become ambiguous", () => {
    const result = loadRefundReviewFixtureScenarioDefaults({
      manifestEntries: [
        baseManifestEntry,
        {
          ...baseManifestEntry,
          fixtureSourceKey: "operator_review_ready_fixture_002",
        },
      ],
    });

    expect(result).toEqual({
      status: "blocked",
      blockCode: "fixture_default_ambiguous",
      reason: "Scenario 'operator_review_ready' has multiple default fixtures.",
    });
  });

  it("fails closed when a manifest entry does not have a matching bundle", () => {
    const result = loadRefundReviewFixtureBundleBySourceKey(
      operatorReviewReadyFixtureSourceKey,
      {
        manifestEntries: [baseManifestEntry],
        bundles: [],
      },
    );

    expect(result).toEqual({
      status: "blocked",
      blockCode: "fixture_bundle_missing",
      reason:
        "Refund review fixture bundle 'operator_review_ready_fixture_001' is missing.",
    });
  });

  it("fails closed when a bundle is not redacted", () => {
    const result = loadRefundReviewFixtureBundleBySourceKey(
      operatorReviewReadyFixtureSourceKey,
      {
        manifestEntries: [baseManifestEntry],
        bundles: [
          {
            ...(loadRefundReviewFixtureBundleBySourceKey(
              operatorReviewReadyFixtureSourceKey,
            ) as Extract<
              ReturnType<typeof loadRefundReviewFixtureBundleBySourceKey>,
              { status: "ready" }
            >).bundle,
            redacted: false,
          } as unknown as RefundReviewFixtureBundle,
        ],
      },
    );

    expect(result).toEqual({
      status: "blocked",
      blockCode: "fixture_bundle_not_redacted",
      reason:
        "Refund review fixture bundle 'operator_review_ready_fixture_001' is not redacted.",
    });
  });
});
