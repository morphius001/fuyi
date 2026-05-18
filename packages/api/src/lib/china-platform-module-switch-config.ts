export type ChinaPlatformModuleSwitchStatus =
  | "enabled"
  | "disabled"
  | "pilot"
  | "reviewing"
  | "paused";

export type ChinaPlatformModuleSwitchConfig = {
  moduleKey: string;
  status: ChinaPlatformModuleSwitchStatus;
  switchOn: boolean;
  layerKey: "platform" | "market" | "role";
  scopeKey: string;
  vendorImpactKey: string;
  policyKey: string;
  guardrailKey: string;
  updatedAt: string;
};

export type ChinaPlatformModuleSwitchUpdateRequest = {
  moduleKey: string;
  switchOn: boolean;
};

export const CHINA_PLATFORM_MODULE_SWITCH_NOTE =
  "This platform module switch view persists an Admin draft for platform default planning only. It does not grant RBAC permissions, execute workflows, or change payment, order, refund, fulfillment, settlement, commission, payout, or logistics behavior.";

export const defaultChinaPlatformModuleSwitchConfigs: ChinaPlatformModuleSwitchConfig[] =
  [
    {
      moduleKey: "seafoodTrade",
      status: "enabled",
      switchOn: true,
      layerKey: "platform",
      scopeKey: "freshTrade",
      vendorImpactKey: "visible",
      policyKey: "open",
      guardrailKey: "noBusinessMutation",
      updatedAt: "2026-05-03 09:00",
    },
    {
      moduleKey: "frozenGoods",
      status: "pilot",
      switchOn: true,
      layerKey: "market",
      scopeKey: "coldChain",
      vendorImpactKey: "marketPilot",
      policyKey: "marketPilot",
      guardrailKey: "requiresMarketSettings",
      updatedAt: "2026-05-03 09:05",
    },
    {
      moduleKey: "dryGoods",
      status: "enabled",
      switchOn: true,
      layerKey: "platform",
      scopeKey: "freshTrade",
      vendorImpactKey: "visible",
      policyKey: "open",
      guardrailKey: "noBusinessMutation",
      updatedAt: "2026-05-03 09:10",
    },
    {
      moduleKey: "fruitsVegetables",
      status: "enabled",
      switchOn: true,
      layerKey: "platform",
      scopeKey: "freshTrade",
      vendorImpactKey: "visible",
      policyKey: "open",
      guardrailKey: "noBusinessMutation",
      updatedAt: "2026-05-03 09:00",
    },
    {
      moduleKey: "marketMaterials",
      status: "pilot",
      switchOn: true,
      layerKey: "market",
      scopeKey: "marketOps",
      vendorImpactKey: "marketPilot",
      policyKey: "marketPilot",
      guardrailKey: "merchantOnly",
      updatedAt: "2026-05-03 09:20",
    },
    {
      moduleKey: "deliverySuppliers",
      status: "reviewing",
      switchOn: false,
      layerKey: "role",
      scopeKey: "deliveryNetwork",
      vendorImpactKey: "afterReview",
      policyKey: "reviewRequired",
      guardrailKey: "noRealLogistics",
      updatedAt: "2026-05-03 10:10",
    },
    {
      moduleKey: "upstreamSupply",
      status: "enabled",
      switchOn: true,
      layerKey: "platform",
      scopeKey: "supplyChain",
      vendorImpactKey: "visible",
      policyKey: "open",
      guardrailKey: "merchantOnly",
      updatedAt: "2026-05-02 18:30",
    },
    {
      moduleKey: "seedlingWholesale",
      status: "disabled",
      switchOn: false,
      layerKey: "market",
      scopeKey: "agriculture",
      vendorImpactKey: "hidden",
      policyKey: "notOpen",
      guardrailKey: "requiresMarketSettings",
      updatedAt: "2026-05-02 17:40",
    },
    {
      moduleKey: "remoteWholesalers",
      status: "pilot",
      switchOn: true,
      layerKey: "role",
      scopeKey: "crossRegion",
      vendorImpactKey: "rolePilot",
      policyKey: "rolePilot",
      guardrailKey: "merchantOnly",
      updatedAt: "2026-05-02 16:15",
    },
    {
      moduleKey: "livestream",
      status: "paused",
      switchOn: false,
      layerKey: "role",
      scopeKey: "stallStoreStatus",
      vendorImpactKey: "storeStatusOnly",
      policyKey: "placeholderOnly",
      guardrailKey: "noRealLivestream",
      updatedAt: "2026-05-01 11:00",
    },
    {
      moduleKey: "pickupCard",
      status: "enabled",
      switchOn: true,
      layerKey: "platform",
      scopeKey: "pickupCard",
      vendorImpactKey: "consumerEntitlement",
      policyKey: "open",
      guardrailKey: "notPayment",
      updatedAt: "2026-05-03 09:30",
    },
    {
      moduleKey: "storeDecoration",
      status: "enabled",
      switchOn: true,
      layerKey: "role",
      scopeKey: "stallStoreStatus",
      vendorImpactKey: "visible",
      policyKey: "open",
      guardrailKey: "noBusinessMutation",
      updatedAt: "2026-05-15 22:10",
    },
    {
      moduleKey: "aiQuickListing",
      status: "pilot",
      switchOn: true,
      layerKey: "role",
      scopeKey: "listingTools",
      vendorImpactKey: "rolePilot",
      policyKey: "rolePilot",
      guardrailKey: "draftOnly",
      updatedAt: "2026-05-03 08:45",
    },
    {
      moduleKey: "expressPrint",
      status: "reviewing",
      switchOn: false,
      layerKey: "market",
      scopeKey: "fulfillmentTools",
      vendorImpactKey: "afterReview",
      policyKey: "reviewRequired",
      guardrailKey: "noRealWaybill",
      updatedAt: "2026-05-02 14:05",
    },
  ];

type ChinaPlatformModuleSwitchGlobalState = {
  __chinaPlatformModuleSwitchConfigs?: ChinaPlatformModuleSwitchConfig[];
};

const cloneConfigs = (configs: ChinaPlatformModuleSwitchConfig[]) =>
  configs.map((config) => ({ ...config }));

const getMutableConfigs = () => {
  const state = globalThis as ChinaPlatformModuleSwitchGlobalState;

  if (!state.__chinaPlatformModuleSwitchConfigs) {
    state.__chinaPlatformModuleSwitchConfigs = cloneConfigs(
      defaultChinaPlatformModuleSwitchConfigs,
    );
  }

  return state.__chinaPlatformModuleSwitchConfigs;
};

export const listChinaPlatformModuleSwitchConfigs = () =>
  cloneConfigs(getMutableConfigs());

export const resetChinaPlatformModuleSwitchConfigs = () => {
  const state = globalThis as ChinaPlatformModuleSwitchGlobalState;
  state.__chinaPlatformModuleSwitchConfigs = cloneConfigs(
    defaultChinaPlatformModuleSwitchConfigs,
  );

  return listChinaPlatformModuleSwitchConfigs();
};

export const updateChinaPlatformModuleSwitchConfig = ({
  moduleKey,
  switchOn,
}: ChinaPlatformModuleSwitchUpdateRequest) => {
  const configs = getMutableConfigs();
  const config = configs.find((candidate) => candidate.moduleKey === moduleKey);

  if (!config) {
    return undefined;
  }

  config.switchOn = switchOn;
  config.updatedAt = new Date().toISOString();

  return { ...config };
};

export const buildChinaPlatformModuleSwitchView = ({
  items,
  source = "server_memory_draft",
}: {
  items?: ChinaPlatformModuleSwitchConfig[];
  source?: string;
} = {}) => ({
  platformModuleSwitches: {
    mode: "platform_module_switch_draft",
    source,
    note: CHINA_PLATFORM_MODULE_SWITCH_NOTE,
    items: items
      ? cloneConfigs(items)
      : listChinaPlatformModuleSwitchConfigs(),
  },
});
