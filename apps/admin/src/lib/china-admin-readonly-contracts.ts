export type ChinaReadonlyContractStatus =
  | "readOnly"
  | "displayOnly"
  | "designOnly"
  | "blocked"

export type ChinaReadonlyContract = {
  key: string
  status: ChinaReadonlyContractStatus
  surfacesKey: string
  runtimeKey: string
  blockedKey: string
  nextKey: string
}

export type ChinaReadonlyContractGroup = {
  key: string
  contracts: ChinaReadonlyContract[]
}

export const readonlyContractSummaryCards = [
  {
    key: "definedContracts",
    value: "21",
    status: "readOnly" as ChinaReadonlyContractStatus,
  },
  {
    key: "highRiskBoundaries",
    value: "8",
    status: "blocked" as ChinaReadonlyContractStatus,
  },
  {
    key: "displayOnly",
    value: "10",
    status: "displayOnly" as ChinaReadonlyContractStatus,
  },
  {
    key: "surfaces",
    value: "3",
    status: "designOnly" as ChinaReadonlyContractStatus,
  },
]
export const readonlyContractGroups: ChinaReadonlyContractGroup[] = [
  {
    key: "merchantRoles",
    contracts: [
      {
        key: "ordinaryMerchant",
        status: "readOnly",
        surfacesKey: "adminVendor",
        runtimeKey: "readonlyMetadata",
        blockedKey: "rbacSettlement",
        nextKey: "roleConfig",
      },
      {
        key: "materialSupplier",
        status: "displayOnly",
        surfacesKey: "adminVendor",
        runtimeKey: "visibilityOnly",
        blockedKey: "orderFulfillment",
        nextKey: "supplierIntake",
      },
      {
        key: "deliverySupplier",
        status: "designOnly",
        surfacesKey: "adminVendor",
        runtimeKey: "notEnabled",
        blockedKey: "realLogistics",
        nextKey: "deliveryAdapter",
      },
      {
        key: "originSupplier",
        status: "displayOnly",
        surfacesKey: "adminVendorStorefront",
        runtimeKey: "visibilityOnly",
        blockedKey: "procurementSettlement",
        nextKey: "originLink",
      },
      {
        key: "seedlingSupplier",
        status: "designOnly",
        surfacesKey: "adminVendor",
        runtimeKey: "notEnabled",
        blockedKey: "inventoryOrder",
        nextKey: "seedlingPlan",
      },
      {
        key: "remoteWholesaler",
        status: "displayOnly",
        surfacesKey: "adminVendor",
        runtimeKey: "visibilityOnly",
        blockedKey: "crossRegionSettlement",
        nextKey: "wholesaleLink",
      },
    ],
  },
  {
    key: "merchantOps",
    contracts: [
      {
        key: "mobileQuickListing",
        status: "readOnly",
        surfacesKey: "vendorAdmin",
        runtimeKey: "draftOnly",
        blockedKey: "realProductPublish",
        nextKey: "draftReview",
      },
      {
        key: "shopDecoration",
        status: "readOnly",
        surfacesKey: "vendorAdminStorefront",
        runtimeKey: "publicSnapshot",
        blockedKey: "publishWorkflow",
        nextKey: "decorationSnapshot",
      },
      {
        key: "waybillPrinting",
        status: "designOnly",
        surfacesKey: "vendorAdmin",
        runtimeKey: "notEnabled",
        blockedKey: "shipmentWaybill",
        nextKey: "waybillAdapter",
      },
      {
        key: "liveStatus",
        status: "displayOnly",
        surfacesKey: "vendorAdminStorefront",
        runtimeKey: "statusOnly",
        blockedKey: "realLiveProvider",
        nextKey: "liveProvider",
      },
    ],
  },
  {
    key: "consumer",
    contracts: [
      {
        key: "pickupCardFlow",
        status: "readOnly",
        surfacesKey: "storefrontAdminVendor",
        runtimeKey: "flowContractOnly",
        blockedKey: "pickupRedeemOrder",
        nextKey: "pickupReadModel",
      },
      {
        key: "shopLiveBadge",
        status: "displayOnly",
        surfacesKey: "storefrontVendorAdmin",
        runtimeKey: "statusOnly",
        blockedKey: "liveTransaction",
        nextKey: "sellerStatus",
      },
      {
        key: "publicShopSnapshot",
        status: "readOnly",
        surfacesKey: "storefrontVendorAdmin",
        runtimeKey: "publicSnapshot",
        blockedKey: "publishWorkflow",
        nextKey: "snapshotApi",
      },
    ],
  },
  {
    key: "highRisk",
    contracts: [
      {
        key: "payment",
        status: "blocked",
        surfacesKey: "apiAdmin",
        runtimeKey: "serialOnly",
        blockedKey: "paymentTruth",
        nextKey: "paymentRuntimeGate",
      },
      {
        key: "order",
        status: "blocked",
        surfacesKey: "apiAdminVendor",
        runtimeKey: "serialOnly",
        blockedKey: "orderState",
        nextKey: "orderReadiness",
      },
      {
        key: "refund",
        status: "blocked",
        surfacesKey: "apiAdminVendor",
        runtimeKey: "serialOnly",
        blockedKey: "refundState",
        nextKey: "refundPlan",
      },
      {
        key: "settlement",
        status: "blocked",
        surfacesKey: "apiAdminVendor",
        runtimeKey: "serialOnly",
        blockedKey: "settlementMoney",
        nextKey: "settlementPlan",
      },
      {
        key: "commission",
        status: "blocked",
        surfacesKey: "apiAdmin",
        runtimeKey: "serialOnly",
        blockedKey: "commissionRules",
        nextKey: "commissionPlan",
      },
      {
        key: "payout",
        status: "blocked",
        surfacesKey: "apiAdminVendor",
        runtimeKey: "serialOnly",
        blockedKey: "payoutMoney",
        nextKey: "payoutPlan",
      },
      {
        key: "permission",
        status: "blocked",
        surfacesKey: "apiAdmin",
        runtimeKey: "serialOnly",
        blockedKey: "rbacPermission",
        nextKey: "permissionPlan",
      },
      {
        key: "realProviders",
        status: "blocked",
        surfacesKey: "apiAdmin",
        runtimeKey: "serialOnly",
        blockedKey: "providerCredential",
        nextKey: "providerAdapter",
      },
    ],
  },
]
