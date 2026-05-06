export type OperationStatus = "enabled" | "disabled" | "pilot" | "reviewing" | "paused"

export const statusColorByStatus: Record<OperationStatus, "green" | "grey" | "blue" | "orange" | "red"> = {
  enabled: "green",
  disabled: "grey",
  pilot: "blue",
  reviewing: "orange",
  paused: "red",
}

export const controlSummaryCards = [
  {
    key: "mockOnly",
    value: "13",
    status: "reviewing" as OperationStatus,
  },
  {
    key: "marketScoped",
    value: "6",
    status: "pilot" as OperationStatus,
  },
  {
    key: "roleScoped",
    value: "7",
    status: "reviewing" as OperationStatus,
  },
  {
    key: "blockedRealProviders",
    value: "0",
    status: "paused" as OperationStatus,
  },
]

export const capabilityControlRows: {
  key: string
  status: OperationStatus
  platformDefault: boolean
  marketDefault: boolean
  merchantChoice: boolean
  guardrailKey: string
}[] = [
  {
    key: "unifiedDelivery",
    status: "pilot",
    platformDefault: true,
    marketDefault: true,
    merchantChoice: true,
    guardrailKey: "noRealLogistics",
  },
  {
    key: "merchantSelfDelivery",
    status: "enabled",
    platformDefault: true,
    marketDefault: true,
    merchantChoice: true,
    guardrailKey: "requiresMarketSettings",
  },
  {
    key: "materialSupplierOrders",
    status: "pilot",
    platformDefault: true,
    marketDefault: true,
    merchantChoice: false,
    guardrailKey: "merchantOnly",
  },
  {
    key: "livestreamStoreStatus",
    status: "paused",
    platformDefault: false,
    marketDefault: false,
    merchantChoice: true,
    guardrailKey: "noRealLivestream",
  },
  {
    key: "aiQuickListingDraft",
    status: "pilot",
    platformDefault: true,
    marketDefault: true,
    merchantChoice: true,
    guardrailKey: "draftOnly",
  },
  {
    key: "expressPrintTool",
    status: "reviewing",
    platformDefault: false,
    marketDefault: false,
    merchantChoice: true,
    guardrailKey: "noRealWaybill",
  },
]

export const moduleRows: {
  key: string
  status: OperationStatus
  switchOn: boolean
  layerKey: string
  scopeKey: string
  vendorImpactKey: string
  policyKey: string
  guardrailKey: string
  updatedAt: string
}[] = [
  {
    key: "seafoodTrade",
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
    key: "frozenGoods",
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
    key: "dryGoods",
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
    key: "fruitsVegetables",
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
    key: "marketMaterials",
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
    key: "deliverySuppliers",
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
    key: "upstreamSupply",
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
    key: "seedlingWholesale",
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
    key: "remoteWholesalers",
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
    key: "livestream",
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
    key: "pickupCard",
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
    key: "aiQuickListing",
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
    key: "expressPrint",
    status: "reviewing",
    switchOn: false,
    layerKey: "market",
    scopeKey: "fulfillmentTools",
    vendorImpactKey: "afterReview",
    policyKey: "reviewRequired",
    guardrailKey: "noRealWaybill",
    updatedAt: "2026-05-02 14:05",
  },
]

export const markets = [
  {
    key: "sanmenSeafood",
    active: true,
    status: "enabled" as OperationStatus,
    capabilityKeys: ["pickupCard", "deliverySuppliers", "expressPrint", "aiQuickListing", "livestream"],
  },
  {
    key: "northProduce",
    active: false,
    status: "pilot" as OperationStatus,
    capabilityKeys: ["fruitsVegetables", "marketMaterials", "deliverySuppliers", "seedlingWholesale"],
  },
  {
    key: "coastalFrozen",
    active: false,
    status: "reviewing" as OperationStatus,
    capabilityKeys: ["remoteWholesalers", "upstreamSupply", "expressPrint"],
  },
]

export const marketCapabilityRows = [
  {
    key: "pickupCard",
    status: "enabled" as OperationStatus,
    ownerKey: "platformOps",
    vendorImpactKey: "visible",
    policyKey: "open",
    guardrailKey: "notPayment",
  },
  {
    key: "fruitsVegetables",
    status: "enabled" as OperationStatus,
    ownerKey: "merchantOps",
    vendorImpactKey: "visible",
    policyKey: "open",
    guardrailKey: "noBusinessMutation",
  },
  {
    key: "marketMaterials",
    status: "pilot" as OperationStatus,
    ownerKey: "merchantOps",
    vendorImpactKey: "marketPilot",
    policyKey: "marketPilot",
    guardrailKey: "merchantOnly",
  },
  {
    key: "deliverySuppliers",
    status: "pilot" as OperationStatus,
    ownerKey: "deliveryOps",
    vendorImpactKey: "marketPilot",
    policyKey: "reviewRequired",
    guardrailKey: "noRealLogistics",
  },
  {
    key: "upstreamSupply",
    status: "pilot" as OperationStatus,
    ownerKey: "merchantOps",
    vendorImpactKey: "rolePilot",
    policyKey: "rolePilot",
    guardrailKey: "merchantOnly",
  },
  {
    key: "seedlingWholesale",
    status: "disabled" as OperationStatus,
    ownerKey: "merchantOps",
    vendorImpactKey: "hidden",
    policyKey: "notOpen",
    guardrailKey: "requiresMarketSettings",
  },
  {
    key: "remoteWholesalers",
    status: "pilot" as OperationStatus,
    ownerKey: "merchantOps",
    vendorImpactKey: "rolePilot",
    policyKey: "rolePilot",
    guardrailKey: "merchantOnly",
  },
  {
    key: "livestream",
    status: "paused" as OperationStatus,
    ownerKey: "contentOps",
    vendorImpactKey: "storeStatusOnly",
    policyKey: "placeholderOnly",
    guardrailKey: "noRealLivestream",
  },
  {
    key: "expressPrint",
    status: "reviewing" as OperationStatus,
    ownerKey: "fulfillmentOps",
    vendorImpactKey: "afterReview",
    policyKey: "reviewRequired",
    guardrailKey: "noRealWaybill",
  },
  {
    key: "aiQuickListing",
    status: "pilot" as OperationStatus,
    ownerKey: "merchantOps",
    vendorImpactKey: "rolePilot",
    policyKey: "rolePilot",
    guardrailKey: "draftOnly",
  },
]

export const integrationRows = [
  {
    key: "featureFlags",
    ownerKey: "platformOps",
    sourceKey: "featureFlags",
    status: "reviewing" as OperationStatus,
  },
  {
    key: "marketSettings",
    ownerKey: "platformOps",
    sourceKey: "marketSettings",
    status: "reviewing" as OperationStatus,
  },
  {
    key: "roleCapabilities",
    ownerKey: "merchantOps",
    sourceKey: "roleCapabilities",
    status: "reviewing" as OperationStatus,
  },
  {
    key: "mockProviders",
    ownerKey: "platformOps",
    sourceKey: "mockProviders",
    status: "reviewing" as OperationStatus,
  },
  {
    key: "auditLogs",
    ownerKey: "platformOps",
    sourceKey: "auditLogs",
    status: "reviewing" as OperationStatus,
  },
]

export const roleRows: {
  key: string
  status: OperationStatus
  typeKey: string
  qualificationKey: string
  marketKey: string
  scopeKey: string
  moduleKeys: string[]
}[] = [
  {
    key: "seafoodStall",
    status: "enabled",
    typeKey: "ordinaryMerchant",
    qualificationKey: "approved",
    marketKey: "sanmenSeafood",
    scopeKey: "stallA12",
    moduleKeys: ["pickupCard", "expressPrint"],
  },
  {
    key: "frozenMerchant",
    status: "pilot",
    typeKey: "ordinaryMerchant",
    qualificationKey: "approved",
    marketKey: "coastalFrozen",
    scopeKey: "coldChain",
    moduleKeys: ["upstreamSupply", "remoteWholesalers"],
  },
  {
    key: "dryGoodsMerchant",
    status: "reviewing",
    typeKey: "ordinaryMerchant",
    qualificationKey: "pending",
    marketKey: "sanmenSeafood",
    scopeKey: "stallB08",
    moduleKeys: ["marketMaterials"],
  },
  {
    key: "produceMerchant",
    status: "enabled",
    typeKey: "ordinaryMerchant",
    qualificationKey: "approved",
    marketKey: "northProduce",
    scopeKey: "produceZone",
    moduleKeys: ["fruitsVegetables", "aiQuickListing"],
  },
  {
    key: "materialSupplier",
    status: "pilot",
    typeKey: "materialSupplier",
    qualificationKey: "pending",
    marketKey: "northProduce",
    scopeKey: "materialSupply",
    moduleKeys: ["marketMaterials"],
  },
  {
    key: "deliverySupplier",
    status: "reviewing",
    typeKey: "deliverySupplier",
    qualificationKey: "pending",
    marketKey: "sanmenSeafood",
    scopeKey: "cityDelivery",
    moduleKeys: ["deliverySuppliers", "expressPrint"],
  },
  {
    key: "aquacultureFarm",
    status: "enabled",
    typeKey: "originSupplier",
    qualificationKey: "approved",
    marketKey: "sanmenSeafood",
    scopeKey: "originSupply",
    moduleKeys: ["upstreamSupply"],
  },
  {
    key: "grower",
    status: "pilot",
    typeKey: "originSupplier",
    qualificationKey: "approved",
    marketKey: "northProduce",
    scopeKey: "originSupply",
    moduleKeys: ["fruitsVegetables", "upstreamSupply"],
  },
  {
    key: "seedlingSupplier",
    status: "disabled",
    typeKey: "seedlingSupplier",
    qualificationKey: "draft",
    marketKey: "northProduce",
    scopeKey: "seedlingArea",
    moduleKeys: ["seedlingWholesale"],
  },
  {
    key: "remoteWholesaler",
    status: "pilot",
    typeKey: "remoteWholesaler",
    qualificationKey: "approved",
    marketKey: "coastalFrozen",
    scopeKey: "crossRegion",
    moduleKeys: ["remoteWholesalers", "upstreamSupply"],
  },
]
