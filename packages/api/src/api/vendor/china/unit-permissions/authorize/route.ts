import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { resolveChinaVendorUnitModuleAccessForRoute } from "../guard";

const readQueryString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
) {
  const moduleKey = readQueryString(req.query.module_key);

  if (!moduleKey) {
    return res.status(400).json({
      error: "module_key is required.",
    });
  }

  const unitPermissionAccess = await resolveChinaVendorUnitModuleAccessForRoute(
    {
      moduleKey,
      req,
    },
  );

  if (!unitPermissionAccess.allowed) {
    return res.status(unitPermissionAccess.statusCode).json({
      unitPermissionAccess,
    });
  }

  return res.json({
    unitPermissionAccess,
  });
}
