import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

import {
  buildChinaUnitPermissionView,
  listChinaUnitPermissionSellerBindings,
  listChinaUnitPermissionSellerOptions,
  resetChinaUnitPermissionConfigs,
  updateChinaUnitPermissionSellerBinding,
  updateChinaUnitPermissionConfig,
  type ChinaUnitPermissionSellerBindingUpdateRequest,
  type ChinaUnitPermissionUpdateRequest,
} from "../../../../lib/china-unit-permission-config";
import {
  readChinaUnitPermissionConfigsFromPg,
  readChinaUnitPermissionSellerBindingsFromPg,
  readChinaUnitPermissionSellerOptionsFromPg,
  resetChinaUnitPermissionConfigsInPg,
  updateChinaUnitPermissionConfigInPg,
  updateChinaUnitPermissionSellerBindingInPg,
  type ChinaUnitPermissionActor,
  type ChinaUnitPermissionPgConnection,
} from "../../../../lib/china-unit-permission-pg-repository";

const isUnitPermissionUpdateRequest = (
  body: unknown,
): body is ChinaUnitPermissionUpdateRequest => {
  const candidate = body as Partial<ChinaUnitPermissionUpdateRequest>;

  return (
    typeof candidate?.unitKey === "string" &&
    typeof candidate.moduleKey === "string" &&
    typeof candidate.visible === "boolean"
  );
};

const isUnitPermissionSellerBindingUpdateRequest = (
  body: unknown,
): body is ChinaUnitPermissionSellerBindingUpdateRequest => {
  const candidate =
    body as Partial<ChinaUnitPermissionSellerBindingUpdateRequest>;

  return (
    typeof candidate?.unitKey === "string" &&
    (typeof candidate.sellerId === "string" ||
      typeof candidate.sellerHandle === "string")
  );
};

const resolvePg = (req: MedusaRequest) => {
  try {
    return req.scope.resolve(
      ContainerRegistrationKeys.PG_CONNECTION,
    ) as ChinaUnitPermissionPgConnection;
  } catch {
    return undefined;
  }
};

const resolveActor = (req: MedusaRequest): ChinaUnitPermissionActor => {
  const request = req as MedusaRequest & {
    auth_context?: {
      actor_id?: string;
      actor_type?: string;
    };
  };

  return {
    actorId: request.auth_context?.actor_id,
    actorType: request.auth_context?.actor_type ?? "admin",
  };
};

const buildUnitPermissionAdminResponse = async (
  pg: ChinaUnitPermissionPgConnection | undefined,
) => {
  const pgConfigs = await readChinaUnitPermissionConfigsFromPg(pg);
  const sellerBindings =
    (await readChinaUnitPermissionSellerBindingsFromPg(pg)) ??
    listChinaUnitPermissionSellerBindings();
  const sellerOptions =
    (await readChinaUnitPermissionSellerOptionsFromPg(pg)) ??
    listChinaUnitPermissionSellerOptions();

  return {
    ...buildChinaUnitPermissionView({
      items: pgConfigs,
      source: pgConfigs ? "pg_admin_draft" : "server_memory_draft",
    }),
    sellerBindings,
    sellerOptions,
  };
};

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  return res.json(await buildUnitPermissionAdminResponse(resolvePg(req)));
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  if (isUnitPermissionSellerBindingUpdateRequest(req.body)) {
    const pg = resolvePg(req);
    const updatedInPg = await updateChinaUnitPermissionSellerBindingInPg(
      pg,
      req.body,
      resolveActor(req),
    );
    const updatedBinding =
      updatedInPg === undefined
        ? updateChinaUnitPermissionSellerBinding(req.body)
        : updatedInPg;

    if (!updatedBinding) {
      return res.status(404).json({
        error: "unit_permission_seller_binding_not_found",
        message:
          "No matching unit permission seller binding entry could be saved.",
      });
    }

    return res.json({
      updatedBinding,
      ...(await buildUnitPermissionAdminResponse(pg)),
    });
  }

  if (!isUnitPermissionUpdateRequest(req.body)) {
    return res.status(400).json({
      error: "invalid_unit_permission_update",
      message:
        "unitKey with moduleKey/visible or unitKey with sellerId/sellerHandle is required.",
    });
  }

  const pg = resolvePg(req);
  const updatedInPg = await updateChinaUnitPermissionConfigInPg(
    pg,
    req.body,
    resolveActor(req),
  );
  const updated = updatedInPg ?? updateChinaUnitPermissionConfig(req.body);

  if (!updated) {
    return res.status(404).json({
      error: "unit_permission_not_found",
      message: "No matching unit/module permission entry was found.",
    });
  }

  return res.json({
    updated,
    ...(await buildUnitPermissionAdminResponse(pg)),
  });
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const pg = resolvePg(req);
  const pgConfigs = await resetChinaUnitPermissionConfigsInPg(
    pg,
    resolveActor(req),
  );

  if (pgConfigs) {
    return res.json(await buildUnitPermissionAdminResponse(pg));
  }

  resetChinaUnitPermissionConfigs();
  return res.json(await buildUnitPermissionAdminResponse(undefined));
}
