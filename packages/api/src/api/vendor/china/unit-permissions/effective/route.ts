import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import {
  CHINA_UNIT_PERMISSION_NOTE,
  buildChinaUnitPermissionEffectiveView,
} from "../../../../../lib/china-unit-permission-config";
import {
  readChinaUnitPermissionConfigsFromPg,
  resolveChinaUnitPermissionSellerBindingFromPg,
} from "../../../../../lib/china-unit-permission-pg-repository";
import {
  resolveVendorMarketContextSellerId,
  type VendorSellerContextRequest,
} from "../../market-context/helpers";
import {
  parseChinaUnitPermissionMetadataUnitKey,
  readChinaUnitPermissionSellerIdentity,
  resolveChinaUnitPermissionPg,
} from "../helpers";

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const sellerId = resolveVendorMarketContextSellerId(
    req as VendorSellerContextRequest,
  );
  const pg = resolveChinaUnitPermissionPg(req);
  const seller = await readChinaUnitPermissionSellerIdentity(pg, sellerId);
  const sellerBinding = await resolveChinaUnitPermissionSellerBindingFromPg(
    pg,
    {
      sellerHandle: seller?.handle,
      sellerId,
    },
  );
  const unitKey =
    sellerBinding?.unitKey ??
    parseChinaUnitPermissionMetadataUnitKey(seller?.metadata);
  const pgConfigs = await readChinaUnitPermissionConfigsFromPg(pg);
  const configSource = pgConfigs ? "pg_admin_draft" : "server_memory_draft";

  if (!unitKey) {
    return res.json({
      unitPermissionEffective: {
        mode: "unit_permission_menu_visibility_effective",
        source: `${configSource}:seller_unbound`,
        note: CHINA_UNIT_PERMISSION_NOTE,
        unit: {
          unitKey: "seller_unbound",
          moduleAccess: [],
        },
        visibleModuleKeys: [],
        hiddenModuleKeys: [],
      },
    });
  }

  return res.json(
    buildChinaUnitPermissionEffectiveView(unitKey, {
      items: pgConfigs,
      source: sellerBinding
        ? `${configSource}:${sellerBinding.source}`
        : pgConfigs
          ? "pg_admin_draft:seller_unbound_fallback"
          : "server_memory_draft:seller_unbound_fallback",
    }),
  );
}
