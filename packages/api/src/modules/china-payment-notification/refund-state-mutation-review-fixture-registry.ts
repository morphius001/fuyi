import { RefundStateMutationIsolatedPreprodQuerySurfaceInput } from "./refund-state-mutation-isolated-preprod-query-surface";
import {
  operatorReviewReadyFixtureScenarioType,
  operatorReviewReadyFixtureSourceKey,
  operatorReviewReadyReviewInput,
} from "./fixtures/review-query-surface/scenarios/operator-review-ready.fixture";

export type RefundReviewFixtureScenarioType =
  | typeof operatorReviewReadyFixtureScenarioType;

export type RefundReviewFixtureSelectorMode =
  | "explicit_source_key"
  | "scenario_default";

export type RefundReviewFixtureStatus = "active" | "deprecated";

export type RefundReviewFixtureVersion = "review_query_surface_fixture_v1";

export type RefundReviewFixtureRegistryBlockCode =
  | "fixture_selector_missing"
  | "fixture_selector_invalid"
  | "fixture_selector_local_only_required"
  | "fixture_selector_ambiguous"
  | "fixture_manifest_missing"
  | "fixture_manifest_invalid"
  | "fixture_manifest_duplicate_source_key"
  | "fixture_default_missing"
  | "fixture_default_ambiguous"
  | "fixture_bundle_missing"
  | "fixture_bundle_cross_reference_invalid"
  | "fixture_bundle_not_redacted"
  | "fixture_bundle_not_local_only";

export type RefundReviewFixtureManifestEntry = {
  fixtureSourceKey: string;
  fixtureId: string;
  scenarioType: RefundReviewFixtureScenarioType;
  localOnly: true;
  redacted: true;
  version: RefundReviewFixtureVersion;
  status: RefundReviewFixtureStatus;
  defaultScenario: boolean;
};

export type RefundReviewFixtureBundle = {
  fixtureSourceKey: string;
  fixtureId: string;
  scenarioType: RefundReviewFixtureScenarioType;
  localOnly: true;
  redacted: true;
  version: RefundReviewFixtureVersion;
  reviewInput: RefundStateMutationIsolatedPreprodQuerySurfaceInput;
};

export type RefundReviewFixtureSelectorInput =
  | {
      selectorMode: "explicit_source_key";
      localOnly: true;
      fixtureSourceKey: string;
    }
  | {
      selectorMode: "scenario_default";
      localOnly: true;
      scenarioType: RefundReviewFixtureScenarioType;
    };

export type RefundReviewFixtureRegistrySource = {
  manifestEntries: RefundReviewFixtureManifestEntry[];
  bundles: RefundReviewFixtureBundle[];
};

export type RefundReviewFixtureManifestIndexResult =
  | {
      status: "blocked";
      blockCode: Extract<
        RefundReviewFixtureRegistryBlockCode,
        | "fixture_manifest_missing"
        | "fixture_manifest_invalid"
        | "fixture_manifest_duplicate_source_key"
      >;
      reason: string;
    }
  | {
      status: "ready";
      entriesBySourceKey: Record<string, RefundReviewFixtureManifestEntry>;
    };

export type RefundReviewFixtureDefaultIndexResult =
  | {
      status: "blocked";
      blockCode: Extract<
        RefundReviewFixtureRegistryBlockCode,
        | "fixture_manifest_missing"
        | "fixture_manifest_invalid"
        | "fixture_manifest_duplicate_source_key"
        | "fixture_default_ambiguous"
      >;
      reason: string;
    }
  | {
      status: "ready";
      defaultsByScenarioType: Record<RefundReviewFixtureScenarioType, string>;
    };

export type RefundReviewFixtureBundleLookupResult =
  | {
      status: "blocked";
      blockCode: Extract<
        RefundReviewFixtureRegistryBlockCode,
        | "fixture_bundle_missing"
        | "fixture_bundle_cross_reference_invalid"
        | "fixture_bundle_not_redacted"
        | "fixture_bundle_not_local_only"
      >;
      reason: string;
    }
  | {
      status: "ready";
      bundle: RefundReviewFixtureBundle;
    };

export type RefundReviewFixtureSelectorResolution =
  | {
      status: "blocked";
      blockCode: RefundReviewFixtureRegistryBlockCode;
      reason: string;
    }
  | {
      status: "resolved";
      resolvedBy: "explicit_source_key" | "default_scenario_fixture";
      manifestEntry: RefundReviewFixtureManifestEntry;
      bundle: RefundReviewFixtureBundle;
    };

const reviewFixtureVersion: RefundReviewFixtureVersion =
  "review_query_surface_fixture_v1";

const localFixtureSource: RefundReviewFixtureRegistrySource = {
  manifestEntries: [
    {
      fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      fixtureId: "fixture_operator_review_ready_001",
      scenarioType: operatorReviewReadyFixtureScenarioType,
      localOnly: true,
      redacted: true,
      version: reviewFixtureVersion,
      status: "active",
      defaultScenario: true,
    },
  ],
  bundles: [
    {
      fixtureSourceKey: operatorReviewReadyFixtureSourceKey,
      fixtureId: "fixture_operator_review_ready_001",
      scenarioType: operatorReviewReadyFixtureScenarioType,
      localOnly: true,
      redacted: true,
      version: reviewFixtureVersion,
      reviewInput: operatorReviewReadyReviewInput(),
    },
  ],
};

const defaultSource = (
  source?: Partial<RefundReviewFixtureRegistrySource>,
): RefundReviewFixtureRegistrySource => ({
  manifestEntries: source?.manifestEntries ?? localFixtureSource.manifestEntries,
  bundles: source?.bundles ?? localFixtureSource.bundles,
});

export const loadRefundReviewFixtureManifestIndex = (
  source?: Partial<RefundReviewFixtureRegistrySource>,
): RefundReviewFixtureManifestIndexResult => {
  const entries = defaultSource(source).manifestEntries;

  if (entries.length === 0) {
    return {
      status: "blocked",
      blockCode: "fixture_manifest_missing",
      reason: "No local refund review fixture manifest entries were registered.",
    };
  }

  const entriesBySourceKey: Record<string, RefundReviewFixtureManifestEntry> = {};

  for (const entry of entries) {
    if (
      !entry.fixtureSourceKey ||
      !entry.fixtureId ||
      !entry.scenarioType ||
      !entry.localOnly ||
      !entry.redacted
    ) {
      return {
        status: "blocked",
        blockCode: "fixture_manifest_invalid",
        reason: "Refund review fixture manifest entry is missing required fields.",
      };
    }

    if (entriesBySourceKey[entry.fixtureSourceKey]) {
      return {
        status: "blocked",
        blockCode: "fixture_manifest_duplicate_source_key",
        reason: `Refund review fixture source key '${entry.fixtureSourceKey}' is duplicated.`,
      };
    }

    entriesBySourceKey[entry.fixtureSourceKey] = entry;
  }

  return {
    status: "ready",
    entriesBySourceKey,
  };
};

export const loadRefundReviewFixtureScenarioDefaults = (
  source?: Partial<RefundReviewFixtureRegistrySource>,
): RefundReviewFixtureDefaultIndexResult => {
  const manifestIndex = loadRefundReviewFixtureManifestIndex(source);

  if (manifestIndex.status === "blocked") {
    return manifestIndex;
  }

  const defaultsByScenarioType = {} as Record<
    RefundReviewFixtureScenarioType,
    string
  >;

  for (const entry of Object.values(manifestIndex.entriesBySourceKey)) {
    if (!entry.defaultScenario) {
      continue;
    }

    const existing = defaultsByScenarioType[entry.scenarioType];

    if (existing && existing !== entry.fixtureSourceKey) {
      return {
        status: "blocked",
        blockCode: "fixture_default_ambiguous",
        reason: `Scenario '${entry.scenarioType}' has multiple default fixtures.`,
      };
    }

    defaultsByScenarioType[entry.scenarioType] = entry.fixtureSourceKey;
  }

  return {
    status: "ready",
    defaultsByScenarioType,
  };
};

export const listRefundReviewFixtureSourceKeys = (
  source?: Partial<RefundReviewFixtureRegistrySource>,
): string[] => {
  const manifestIndex = loadRefundReviewFixtureManifestIndex(source);

  if (manifestIndex.status === "blocked") {
    return [];
  }

  return Object.keys(manifestIndex.entriesBySourceKey).sort();
};

export const listRefundReviewFixtureScenarioTypes = (
  source?: Partial<RefundReviewFixtureRegistrySource>,
): RefundReviewFixtureScenarioType[] => {
  const manifestIndex = loadRefundReviewFixtureManifestIndex(source);

  if (manifestIndex.status === "blocked") {
    return [];
  }

  return [
    ...new Set(
      Object.values(manifestIndex.entriesBySourceKey).map(
        (entry) => entry.scenarioType,
      ),
    ),
  ].sort() as RefundReviewFixtureScenarioType[];
};

export const loadRefundReviewFixtureBundleBySourceKey = (
  fixtureSourceKey: string,
  source?: Partial<RefundReviewFixtureRegistrySource>,
): RefundReviewFixtureBundleLookupResult => {
  const manifestIndex = loadRefundReviewFixtureManifestIndex(source);

  if (manifestIndex.status === "blocked") {
    return {
      status: "blocked",
      blockCode: "fixture_bundle_missing",
      reason: manifestIndex.reason,
    };
  }

  const manifestEntry = manifestIndex.entriesBySourceKey[fixtureSourceKey];

  if (!manifestEntry) {
    return {
      status: "blocked",
      blockCode: "fixture_bundle_missing",
      reason: `Refund review fixture source key '${fixtureSourceKey}' is not registered.`,
    };
  }

  const bundle = defaultSource(source).bundles.find(
    (candidate) => candidate.fixtureSourceKey === fixtureSourceKey,
  );

  if (!bundle) {
    return {
      status: "blocked",
      blockCode: "fixture_bundle_missing",
      reason: `Refund review fixture bundle '${fixtureSourceKey}' is missing.`,
    };
  }

  if (!bundle.localOnly) {
    return {
      status: "blocked",
      blockCode: "fixture_bundle_not_local_only",
      reason: `Refund review fixture bundle '${fixtureSourceKey}' is not local-only.`,
    };
  }

  if (!bundle.redacted) {
    return {
      status: "blocked",
      blockCode: "fixture_bundle_not_redacted",
      reason: `Refund review fixture bundle '${fixtureSourceKey}' is not redacted.`,
    };
  }

  if (
    bundle.fixtureId !== manifestEntry.fixtureId ||
    bundle.scenarioType !== manifestEntry.scenarioType ||
    bundle.version !== manifestEntry.version
  ) {
    return {
      status: "blocked",
      blockCode: "fixture_bundle_cross_reference_invalid",
      reason: `Refund review fixture bundle '${fixtureSourceKey}' does not match its manifest entry.`,
    };
  }

  return {
    status: "ready",
    bundle,
  };
};

export const resolveRefundReviewFixtureSelector = (
  input:
    | RefundReviewFixtureSelectorInput
    | ({
        selectorMode?: RefundReviewFixtureSelectorMode;
        localOnly?: boolean;
        fixtureSourceKey?: string;
        scenarioType?: RefundReviewFixtureScenarioType;
      } & Record<string, unknown>),
  source?: Partial<RefundReviewFixtureRegistrySource>,
): RefundReviewFixtureSelectorResolution => {
  if (!input.localOnly) {
    return {
      status: "blocked",
      blockCode: "fixture_selector_local_only_required",
      reason: "Refund review fixture selector must remain local-only.",
    };
  }

  if (input.selectorMode === "explicit_source_key") {
    if (!input.fixtureSourceKey?.trim()) {
      return {
        status: "blocked",
        blockCode: "fixture_selector_missing",
        reason: "Explicit refund review fixture selection requires fixtureSourceKey.",
      };
    }

    const manifestIndex = loadRefundReviewFixtureManifestIndex(source);

    if (manifestIndex.status === "blocked") {
      return manifestIndex;
    }

    const manifestEntry = manifestIndex.entriesBySourceKey[input.fixtureSourceKey];

    if (!manifestEntry) {
      return {
        status: "blocked",
        blockCode: "fixture_selector_invalid",
        reason: `Unknown refund review fixture source key '${input.fixtureSourceKey}'.`,
      };
    }

    const bundleResult = loadRefundReviewFixtureBundleBySourceKey(
      input.fixtureSourceKey,
      source,
    );

    if (bundleResult.status === "blocked") {
      return bundleResult;
    }

    return {
      status: "resolved",
      resolvedBy: "explicit_source_key",
      manifestEntry,
      bundle: bundleResult.bundle,
    };
  }

  if (input.selectorMode === "scenario_default") {
    if (!input.scenarioType) {
      return {
        status: "blocked",
        blockCode: "fixture_selector_missing",
        reason: "Scenario default refund review fixture selection requires scenarioType.",
      };
    }

    const defaults = loadRefundReviewFixtureScenarioDefaults(source);

    if (defaults.status === "blocked") {
      return defaults;
    }

    const fixtureSourceKey = defaults.defaultsByScenarioType[input.scenarioType];

    if (!fixtureSourceKey) {
      return {
        status: "blocked",
        blockCode: "fixture_default_missing",
        reason: `Scenario '${input.scenarioType}' has no default refund review fixture.`,
      };
    }

    const explicitResolution = resolveRefundReviewFixtureSelector(
      {
        selectorMode: "explicit_source_key",
        localOnly: true,
        fixtureSourceKey,
      },
      source,
    );

    return explicitResolution.status === "resolved"
      ? {
          ...explicitResolution,
          resolvedBy: "default_scenario_fixture",
        }
      : explicitResolution;
  }

  return {
    status: "blocked",
    blockCode: "fixture_selector_invalid",
    reason: "Refund review fixture selector mode is invalid or missing.",
  };
};
