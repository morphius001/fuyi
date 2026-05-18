export type ChinaUnitPermissionModuleAccess = {
  moduleKey: string;
  visible: boolean;
  reasonKey: string;
};

export type ChinaUnitPermissionConfig = {
  unitKey: string;
  status: "enabled" | "pilot" | "reviewing" | "disabled";
  unitTypeKey:
    | "merchantStall"
    | "merchantStore"
    | "deliverySupplier"
    | "materialSupplier";
  marketKey: "sanmenSeafood" | "coastalFrozen" | "northProduce";
  guardrailKey: string;
  updatedAt: string;
  moduleAccess: ChinaUnitPermissionModuleAccess[];
};

export type ChinaUnitPermissionSellerBinding = {
  unitKey: string;
  sellerId?: string | null;
  sellerHandle?: string | null;
  source: "admin_binding" | "seed_binding" | "metadata_fallback";
  updatedAt: string;
};

export type ChinaUnitPermissionSellerOption = {
  sellerId?: string | null;
  sellerHandle?: string | null;
  sellerName?: string | null;
  source: "seller_table" | "seed_binding" | "server_memory_binding";
};

export type ChinaUnitPermissionUpdateRequest = {
  unitKey: string;
  moduleKey: string;
  visible: boolean;
};

export type ChinaUnitPermissionSellerBindingUpdateRequest = {
  unitKey: string;
  sellerId?: string | null;
  sellerHandle?: string | null;
};

export const CHINA_UNIT_PERMISSION_NOTE =
  "This unit permission view controls menu visibility only. It does not grant RBAC permissions, execute workflow actions, or change payment, order, refund, fulfillment, settlement, commission, payout, or logistics behavior.";

export const defaultChinaUnitPermissionConfigs: ChinaUnitPermissionConfig[] = [
  {
    unitKey: "seafoodStallA12",
    status: "enabled",
    unitTypeKey: "merchantStall",
    marketKey: "sanmenSeafood",
    guardrailKey: "requiresMarketSettings",
    updatedAt: "2026-05-15 21:45",
    moduleAccess: [
      { moduleKey: "seafoodTrade", visible: true, reasonKey: "coreCategory" },
      {
        moduleKey: "storeDecoration",
        visible: true,
        reasonKey: "enabledForUnit",
      },
      { moduleKey: "pickupCard", visible: true, reasonKey: "enabledForUnit" },
      { moduleKey: "expressPrint", visible: true, reasonKey: "enabledForUnit" },
      {
        moduleKey: "marketMaterials",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      { moduleKey: "livestream", visible: false, reasonKey: "providerBlocked" },
      {
        moduleKey: "seedlingWholesale",
        visible: false,
        reasonKey: "categoryBlocked",
      },
      {
        moduleKey: "aiQuickListing",
        visible: false,
        reasonKey: "pendingReview",
      },
      {
        moduleKey: "deliverySuppliers",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      {
        moduleKey: "financeReadOnly",
        visible: false,
        reasonKey: "highRiskReadOnly",
      },
    ],
  },
  {
    unitKey: "frozenMerchantB08",
    status: "pilot",
    unitTypeKey: "merchantStore",
    marketKey: "coastalFrozen",
    guardrailKey: "requiresMarketSettings",
    updatedAt: "2026-05-15 21:45",
    moduleAccess: [
      { moduleKey: "frozenGoods", visible: true, reasonKey: "coreCategory" },
      {
        moduleKey: "storeDecoration",
        visible: true,
        reasonKey: "enabledForUnit",
      },
      { moduleKey: "upstreamSupply", visible: true, reasonKey: "rolePilot" },
      { moduleKey: "remoteWholesalers", visible: true, reasonKey: "rolePilot" },
      {
        moduleKey: "pickupCard",
        visible: false,
        reasonKey: "marketNotEnabled",
      },
      { moduleKey: "expressPrint", visible: false, reasonKey: "pendingReview" },
      { moduleKey: "livestream", visible: false, reasonKey: "providerBlocked" },
      {
        moduleKey: "financeReadOnly",
        visible: false,
        reasonKey: "highRiskReadOnly",
      },
    ],
  },
  {
    unitKey: "deliverySupplierTeam",
    status: "reviewing",
    unitTypeKey: "deliverySupplier",
    marketKey: "sanmenSeafood",
    guardrailKey: "noRealLogistics",
    updatedAt: "2026-05-15 21:45",
    moduleAccess: [
      {
        moduleKey: "deliverySuppliers",
        visible: true,
        reasonKey: "enabledForUnit",
      },
      { moduleKey: "expressPrint", visible: false, reasonKey: "pendingReview" },
      {
        moduleKey: "seafoodTrade",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      {
        moduleKey: "storeDecoration",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      { moduleKey: "pickupCard", visible: false, reasonKey: "notInUnitScope" },
      {
        moduleKey: "marketMaterials",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      {
        moduleKey: "aiQuickListing",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      {
        moduleKey: "financeReadOnly",
        visible: false,
        reasonKey: "highRiskReadOnly",
      },
    ],
  },
  {
    unitKey: "materialSupplierNorth",
    status: "pilot",
    unitTypeKey: "materialSupplier",
    marketKey: "northProduce",
    guardrailKey: "merchantOnly",
    updatedAt: "2026-05-15 21:45",
    moduleAccess: [
      {
        moduleKey: "marketMaterials",
        visible: true,
        reasonKey: "enabledForUnit",
      },
      {
        moduleKey: "storeDecoration",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      {
        moduleKey: "fruitsVegetables",
        visible: false,
        reasonKey: "categoryBlocked",
      },
      {
        moduleKey: "seedlingWholesale",
        visible: false,
        reasonKey: "pendingReview",
      },
      { moduleKey: "pickupCard", visible: false, reasonKey: "notInUnitScope" },
      {
        moduleKey: "expressPrint",
        visible: false,
        reasonKey: "notInUnitScope",
      },
      { moduleKey: "livestream", visible: false, reasonKey: "providerBlocked" },
      {
        moduleKey: "financeReadOnly",
        visible: false,
        reasonKey: "highRiskReadOnly",
      },
    ],
  },
];

export const defaultChinaUnitPermissionSellerBindings: ChinaUnitPermissionSellerBinding[] =
  [
    {
      unitKey: "seafoodStallA12",
      sellerHandle: "a-hai-xian-huo-dang",
      source: "seed_binding",
      updatedAt: "2026-05-15 22:45",
    },
  ];

type ChinaUnitPermissionGlobalState = {
  __chinaUnitPermissionConfigs?: ChinaUnitPermissionConfig[];
  __chinaUnitPermissionSellerBindings?: ChinaUnitPermissionSellerBinding[];
};

const cloneConfigs = (configs: ChinaUnitPermissionConfig[]) =>
  configs.map((config) => ({
    ...config,
    moduleAccess: config.moduleAccess.map((moduleAccess) => ({
      ...moduleAccess,
    })),
  }));

const getMutableConfigs = () => {
  const state = globalThis as ChinaUnitPermissionGlobalState;

  if (!state.__chinaUnitPermissionConfigs) {
    state.__chinaUnitPermissionConfigs = cloneConfigs(
      defaultChinaUnitPermissionConfigs,
    );
  }

  return state.__chinaUnitPermissionConfigs;
};

const cloneSellerBindings = (bindings: ChinaUnitPermissionSellerBinding[]) =>
  bindings.map((binding) => ({
    ...binding,
  }));

const getMutableSellerBindings = () => {
  const state = globalThis as ChinaUnitPermissionGlobalState;

  if (!state.__chinaUnitPermissionSellerBindings) {
    state.__chinaUnitPermissionSellerBindings = cloneSellerBindings(
      defaultChinaUnitPermissionSellerBindings,
    );
  }

  return state.__chinaUnitPermissionSellerBindings;
};

export const listChinaUnitPermissionConfigs = () =>
  cloneConfigs(getMutableConfigs());

export const listChinaUnitPermissionSellerBindings = () =>
  cloneSellerBindings(getMutableSellerBindings());

export const listChinaUnitPermissionSellerOptions =
  (): ChinaUnitPermissionSellerOption[] =>
    listChinaUnitPermissionSellerBindings().map((binding) => ({
      sellerId: binding.sellerId,
      sellerHandle: binding.sellerHandle,
      sellerName: binding.sellerHandle ?? binding.sellerId ?? binding.unitKey,
      source:
        binding.source === "seed_binding"
          ? "seed_binding"
          : "server_memory_binding",
    }));

export const resetChinaUnitPermissionConfigs = () => {
  const state = globalThis as ChinaUnitPermissionGlobalState;
  state.__chinaUnitPermissionConfigs = cloneConfigs(
    defaultChinaUnitPermissionConfigs,
  );
  state.__chinaUnitPermissionSellerBindings = cloneSellerBindings(
    defaultChinaUnitPermissionSellerBindings,
  );

  return listChinaUnitPermissionConfigs();
};

export const resetChinaUnitPermissionSellerBindings = () => {
  const state = globalThis as ChinaUnitPermissionGlobalState;
  state.__chinaUnitPermissionSellerBindings = cloneSellerBindings(
    defaultChinaUnitPermissionSellerBindings,
  );

  return listChinaUnitPermissionSellerBindings();
};

export const updateChinaUnitPermissionConfig = ({
  moduleKey,
  unitKey,
  visible,
}: ChinaUnitPermissionUpdateRequest) => {
  const configs = getMutableConfigs();
  const unit = configs.find((config) => config.unitKey === unitKey);

  if (!unit) {
    return undefined;
  }

  const moduleAccess = unit.moduleAccess.find(
    (candidate) => candidate.moduleKey === moduleKey,
  );

  if (!moduleAccess) {
    return undefined;
  }

  moduleAccess.visible = visible;
  moduleAccess.reasonKey = visible ? moduleAccess.reasonKey : "operatorHidden";
  unit.updatedAt = new Date().toISOString();

  return cloneConfigs([unit])[0];
};

export const updateChinaUnitPermissionSellerBinding = ({
  sellerHandle,
  sellerId,
  unitKey,
}: ChinaUnitPermissionSellerBindingUpdateRequest) => {
  const unitExists = listChinaUnitPermissionConfigs().some(
    (config) => config.unitKey === unitKey,
  );
  const normalizedSellerId =
    typeof sellerId === "string" && sellerId.trim() ? sellerId.trim() : null;
  const normalizedSellerHandle =
    typeof sellerHandle === "string" && sellerHandle.trim()
      ? sellerHandle.trim()
      : null;

  if (!unitExists || (!normalizedSellerId && !normalizedSellerHandle)) {
    return undefined;
  }

  const bindings = getMutableSellerBindings();
  const nextBinding: ChinaUnitPermissionSellerBinding = {
    unitKey,
    sellerId: normalizedSellerId,
    sellerHandle: normalizedSellerHandle,
    source: "admin_binding",
    updatedAt: new Date().toISOString(),
  };
  const remainingBindings = bindings.filter(
    (binding) =>
      binding.unitKey !== unitKey &&
      (!normalizedSellerId || binding.sellerId !== normalizedSellerId) &&
      (!normalizedSellerHandle ||
        binding.sellerHandle !== normalizedSellerHandle),
  );
  const state = globalThis as ChinaUnitPermissionGlobalState;
  state.__chinaUnitPermissionSellerBindings = [
    ...remainingBindings,
    nextBinding,
  ];

  return { ...nextBinding };
};

export const buildChinaUnitPermissionView = ({
  items,
  source = "server_memory_draft",
}: {
  items?: ChinaUnitPermissionConfig[];
  source?: string;
} = {}) => ({
  unitPermissions: {
    mode: "unit_permission_menu_visibility",
    source,
    note: CHINA_UNIT_PERMISSION_NOTE,
    items: items ? cloneConfigs(items) : listChinaUnitPermissionConfigs(),
  },
});

export const buildChinaUnitPermissionEffectiveView = (
  unitKey = "seafoodStallA12",
  options: {
    items?: ChinaUnitPermissionConfig[];
    source?: string;
  } = {},
) => {
  const unit =
    (options.items ?? listChinaUnitPermissionConfigs()).find(
      (config) => config.unitKey === unitKey,
    ) ?? (options.items ?? listChinaUnitPermissionConfigs())[0];

  return {
    unitPermissionEffective: {
      mode: "unit_permission_menu_visibility_effective",
      source: options.source ?? "server_memory_draft",
      note: CHINA_UNIT_PERMISSION_NOTE,
      unit,
      visibleModuleKeys: unit.moduleAccess
        .filter((moduleAccess) => moduleAccess.visible)
        .map((moduleAccess) => moduleAccess.moduleKey),
      hiddenModuleKeys: unit.moduleAccess
        .filter((moduleAccess) => !moduleAccess.visible)
        .map((moduleAccess) => moduleAccess.moduleKey),
    },
  };
};
