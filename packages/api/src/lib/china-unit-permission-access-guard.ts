import {
  CHINA_UNIT_PERMISSION_NOTE,
  ChinaUnitPermissionConfig,
  listChinaUnitPermissionConfigs,
} from "./china-unit-permission-config";
import {
  readChinaUnitPermissionConfigsFromPg,
  resolveChinaUnitPermissionSellerBindingFromPg,
  type ChinaUnitPermissionPgConnection,
} from "./china-unit-permission-pg-repository";

export type ChinaUnitPermissionAccessDeniedReason =
  | "seller_unbound"
  | "unit_not_found"
  | "module_not_found"
  | "module_hidden_for_unit";

export type ChinaUnitPermissionAccessGuardResult = {
  mode: "unit_permission_vendor_module_access_guard";
  allowed: boolean;
  statusCode: 200 | 403;
  reason?: ChinaUnitPermissionAccessDeniedReason;
  source: string;
  note: string;
  sellerId?: string;
  sellerHandle?: string | null;
  unitKey?: string;
  moduleKey: string;
  visibleModuleKeys: string[];
  hiddenModuleKeys: string[];
};

export const CHINA_UNIT_PERMISSION_ACCESS_GUARD_NOTE = `${CHINA_UNIT_PERMISSION_NOTE} This guard is scoped to China custom Vendor API surfaces and is not a replacement for Medusa/Mercur RBAC.`;

const buildSource = ({
  hasPgConfigs,
  sellerBindingSource,
  metadataFallback,
}: {
  hasPgConfigs: boolean;
  sellerBindingSource?: string;
  metadataFallback: boolean;
}) => {
  const storage = hasPgConfigs ? "pg_admin_draft" : "server_memory_draft";

  if (sellerBindingSource) {
    return `${storage}:${sellerBindingSource}`;
  }

  return metadataFallback
    ? `${storage}:seller_metadata_fallback`
    : `${storage}:seller_unbound`;
};

const getVisibleModuleKeys = (unit: ChinaUnitPermissionConfig) =>
  unit.moduleAccess
    .filter((moduleAccess) => moduleAccess.visible)
    .map((moduleAccess) => moduleAccess.moduleKey);

const getHiddenModuleKeys = (unit: ChinaUnitPermissionConfig) =>
  unit.moduleAccess
    .filter((moduleAccess) => !moduleAccess.visible)
    .map((moduleAccess) => moduleAccess.moduleKey);

type ChinaUnitPermissionAccessDeniedInput = {
  hiddenModuleKeys?: string[];
  moduleKey: string;
  reason: ChinaUnitPermissionAccessDeniedReason;
  sellerHandle?: string | null;
  sellerId?: string;
  source: string;
  unitKey?: string;
  visibleModuleKeys?: string[];
};

const denied = ({
  hiddenModuleKeys = [],
  moduleKey,
  reason,
  sellerHandle,
  sellerId,
  source,
  unitKey,
  visibleModuleKeys = [],
}: ChinaUnitPermissionAccessDeniedInput): ChinaUnitPermissionAccessGuardResult => ({
  mode: "unit_permission_vendor_module_access_guard",
  allowed: false,
  statusCode: 403,
  reason,
  source,
  note: CHINA_UNIT_PERMISSION_ACCESS_GUARD_NOTE,
  sellerId,
  sellerHandle,
  unitKey,
  moduleKey,
  visibleModuleKeys,
  hiddenModuleKeys,
});

export const resolveChinaUnitPermissionModuleAccess = async ({
  configs,
  moduleKey,
  pg,
  seller,
}: {
  configs?: ChinaUnitPermissionConfig[];
  moduleKey: string;
  pg?: ChinaUnitPermissionPgConnection;
  seller: {
    sellerId?: string;
    sellerHandle?: string | null;
    unitKey?: string;
  };
}): Promise<ChinaUnitPermissionAccessGuardResult> => {
  const normalizedModuleKey = moduleKey.trim();
  const sellerBinding = await resolveChinaUnitPermissionSellerBindingFromPg(
    pg,
    {
      sellerHandle: seller.sellerHandle,
      sellerId: seller.sellerId,
    },
  );
  const unitKey = sellerBinding?.unitKey ?? seller.unitKey;
  const pgConfigs = configs ?? (await readChinaUnitPermissionConfigsFromPg(pg));
  const items = pgConfigs ?? listChinaUnitPermissionConfigs();
  const source = buildSource({
    hasPgConfigs: Boolean(pgConfigs),
    metadataFallback: Boolean(!sellerBinding && seller.unitKey),
    sellerBindingSource: sellerBinding?.source,
  });

  if (!unitKey) {
    return denied({
      moduleKey: normalizedModuleKey,
      reason: "seller_unbound",
      sellerHandle: seller.sellerHandle,
      sellerId: seller.sellerId,
      source,
    });
  }

  const unit = items.find((config) => config.unitKey === unitKey);

  if (!unit) {
    return denied({
      moduleKey: normalizedModuleKey,
      reason: "unit_not_found",
      sellerHandle: seller.sellerHandle,
      sellerId: seller.sellerId,
      source,
      unitKey,
    });
  }

  const visibleModuleKeys = getVisibleModuleKeys(unit);
  const hiddenModuleKeys = getHiddenModuleKeys(unit);
  const moduleAccess = unit.moduleAccess.find(
    (candidate) => candidate.moduleKey === normalizedModuleKey,
  );

  if (!moduleAccess) {
    return denied({
      hiddenModuleKeys,
      moduleKey: normalizedModuleKey,
      reason: "module_not_found",
      sellerHandle: seller.sellerHandle,
      sellerId: seller.sellerId,
      source,
      unitKey,
      visibleModuleKeys,
    });
  }

  if (!moduleAccess.visible) {
    return denied({
      hiddenModuleKeys,
      moduleKey: normalizedModuleKey,
      reason: "module_hidden_for_unit",
      sellerHandle: seller.sellerHandle,
      sellerId: seller.sellerId,
      source,
      unitKey,
      visibleModuleKeys,
    });
  }

  return {
    mode: "unit_permission_vendor_module_access_guard",
    allowed: true,
    statusCode: 200,
    source,
    note: CHINA_UNIT_PERMISSION_ACCESS_GUARD_NOTE,
    sellerId: seller.sellerId,
    sellerHandle: seller.sellerHandle,
    unitKey,
    moduleKey: normalizedModuleKey,
    visibleModuleKeys,
    hiddenModuleKeys,
  };
};
