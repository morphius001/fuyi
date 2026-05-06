export type ChinaAdminSpecTemplateStatus = "active" | "pilot" | "draft" | "paused"

export type ChinaAdminSpecTemplateStatusColor = "green" | "blue" | "grey" | "red"

export const chinaAdminSpecTemplateStatusColorByStatus: Record<
  ChinaAdminSpecTemplateStatus,
  ChinaAdminSpecTemplateStatusColor
> = {
  active: "green",
  pilot: "blue",
  draft: "grey",
  paused: "red",
}

export const chinaAdminSpecTemplateSummaryCards = [
  { key: "activeTemplates", value: "5", status: "active" },
  { key: "pilotMarkets", value: "3", status: "pilot" },
  { key: "draftVersions", value: "2", status: "draft" },
  { key: "pausedTemplates", value: "1", status: "paused" },
] as const satisfies ReadonlyArray<{
  key: string
  value: string
  status: ChinaAdminSpecTemplateStatus
}>

export const chinaAdminSpecTemplateRows = [
  {
    key: "seafoodLive",
    categoryKey: "seafoodLive",
    scopeKey: "marketAndMerchantType",
    merchantTypesKey: "seafoodStall",
    requiredKey: "seafoodRequired",
    displayKey: "seafoodDisplay",
    version: "v1.3",
    status: "active",
  },
  {
    key: "fruitVegetable",
    categoryKey: "fruitVegetable",
    scopeKey: "platform",
    merchantTypesKey: "fruitVegetableMerchant",
    requiredKey: "produceRequired",
    displayKey: "produceDisplay",
    version: "v1.1",
    status: "active",
  },
  {
    key: "marketMaterials",
    categoryKey: "marketMaterials",
    scopeKey: "rolePilot",
    merchantTypesKey: "materialsSupplier",
    requiredKey: "materialsRequired",
    displayKey: "materialsDisplay",
    version: "v0.8",
    status: "pilot",
  },
  {
    key: "seedlingWholesale",
    categoryKey: "seedlingWholesale",
    scopeKey: "marketPilot",
    merchantTypesKey: "seedlingSupplier",
    requiredKey: "seedlingRequired",
    displayKey: "seedlingDisplay",
    version: "v0.5",
    status: "draft",
  },
  {
    key: "regionalWholesaler",
    categoryKey: "regionalWholesaler",
    scopeKey: "rolePilot",
    merchantTypesKey: "regionalWholesaler",
    requiredKey: "regionalRequired",
    displayKey: "regionalDisplay",
    version: "v0.7",
    status: "pilot",
  },
] as const satisfies ReadonlyArray<{
  key: string
  categoryKey: string
  scopeKey: string
  merchantTypesKey: string
  requiredKey: string
  displayKey: string
  version: string
  status: ChinaAdminSpecTemplateStatus
}>

export const chinaAdminSpecTemplateFieldRows = [
  {
    key: "base",
    fieldGroupKey: "base",
    fieldsKey: "base",
    requiredKey: "yes",
    consumerKey: "titleMarketStall",
    vendorKey: "quickListing",
  },
  {
    key: "spec",
    fieldGroupKey: "spec",
    fieldsKey: "spec",
    requiredKey: "yes",
    consumerKey: "oneLineSpec",
    vendorKey: "templateFields",
  },
  {
    key: "unit",
    fieldGroupKey: "unit",
    fieldsKey: "unit",
    requiredKey: "yes",
    consumerKey: "unitLine",
    vendorKey: "unitSplit",
  },
  {
    key: "price",
    fieldGroupKey: "price",
    fieldsKey: "price",
    requiredKey: "yes",
    consumerKey: "priceLine",
    vendorKey: "priceType",
  },
  {
    key: "fulfillment",
    fieldGroupKey: "fulfillment",
    fieldsKey: "fulfillment",
    requiredKey: "conditional",
    consumerKey: "stallCapability",
    vendorKey: "merchantConfig",
  },
] as const

export const chinaAdminSpecTemplateBoundaryRows = [
  {
    key: "admin",
    surfaceKey: "admin",
    readKey: "readTemplates",
    writeKey: "versionedAudit",
    guardrailKey: "noProductPublish",
  },
  {
    key: "vendor",
    surfaceKey: "vendor",
    readKey: "readAvailableTemplates",
    writeKey: "draftOnly",
    guardrailKey: "merchantConfirm",
  },
  {
    key: "storefront",
    surfaceKey: "storefront",
    readKey: "readSpecView",
    writeKey: "noWrite",
    guardrailKey: "hideInternalRules",
  },
] as const
