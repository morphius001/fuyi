export type VendorUnitPermissionEffectiveView = {
  mode: "unit_permission_menu_visibility_effective";
  source: string;
  note: string;
  unit: {
    unitKey: string;
    moduleAccess: {
      moduleKey: string;
      visible: boolean;
      reasonKey: string;
    }[];
  };
  visibleModuleKeys: string[];
  hiddenModuleKeys: string[];
};

export type VendorUnitPermissionResponse = {
  unitPermissionEffective: VendorUnitPermissionEffectiveView;
};

export type VendorUnitPermissionAccessResult = {
  mode: "unit_permission_vendor_module_access_guard";
  allowed: boolean;
  statusCode: 200 | 403;
  reason?:
    | "seller_unbound"
    | "unit_not_found"
    | "module_not_found"
    | "module_hidden_for_unit";
  source: string;
  note: string;
  sellerId?: string;
  sellerHandle?: string | null;
  unitKey?: string;
  moduleKey: string;
  visibleModuleKeys: string[];
  hiddenModuleKeys: string[];
};

export type VendorUnitPermissionAccessResponse = {
  unitPermissionAccess: VendorUnitPermissionAccessResult;
};

export type VendorModuleSurfacePreview = {
  mode: "vendor_china_module_surface_preview";
  moduleKey: string;
  title: string;
  cards: Array<{
    label: string;
    value: string;
    note: string;
  }>;
  runtimeEnabled: false;
  note: string;
};

export type VendorModuleSurfacePreviewResponse = {
  unitPermissionAccess: VendorUnitPermissionAccessResult;
  moduleSurface?: VendorModuleSurfacePreview;
};

const fallbackVisibleModuleKeys = [
  "seafoodTrade",
  "pickupCard",
  "expressPrint",
];

const getBackendUrl = () =>
  (import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "http://127.0.0.1:9000").replace(
    /\/$/,
    "",
  );
const vendorUnitKey =
  import.meta.env.VITE_CHINA_VENDOR_UNIT_KEY ?? "seafoodStallA12";

export const createVendorUnitPermissionFallback =
  (): VendorUnitPermissionEffectiveView => ({
    mode: "unit_permission_menu_visibility_effective",
    source: "vendor_unit_permission_fallback",
    note: "Unit permission API is unavailable; using seafood stall safe fallback for menu visibility only.",
    unit: {
      unitKey: "seafoodStallA12",
      moduleAccess: fallbackVisibleModuleKeys.map((moduleKey) => ({
        moduleKey,
        visible: true,
        reasonKey: "fallbackVisible",
      })),
    },
    visibleModuleKeys: fallbackVisibleModuleKeys,
    hiddenModuleKeys: [],
  });

export const retrieveChinaVendorUnitPermissions = async (
  unitKey = vendorUnitKey,
): Promise<VendorUnitPermissionEffectiveView> => {
  const params = new URLSearchParams({ unit_key: unitKey });
  const readResponse = async (response: Response) => {
    if (!response.ok) {
      throw new Error(`Vendor unit permission API ${response.status}`);
    }

    return ((await response.json()) as VendorUnitPermissionResponse)
      .unitPermissionEffective;
  };

  return fetch(`${getBackendUrl()}/vendor/china/unit-permissions/effective`, {
    cache: "no-cache",
    credentials: "include",
    method: "GET",
  })
    .then(readResponse)
    .catch(() =>
      fetch(
        `${getBackendUrl()}/china/unit-permissions/effective?${params.toString()}`,
        {
          cache: "no-cache",
          credentials: "include",
          method: "GET",
        },
      ).then(readResponse),
    )
    .catch(createVendorUnitPermissionFallback);
};

export const retrieveChinaVendorUnitModuleAccess = async (
  moduleKey: string,
): Promise<VendorUnitPermissionAccessResult> => {
  const params = new URLSearchParams({ module_key: moduleKey });
  const response = await fetch(
    `${getBackendUrl()}/vendor/china/unit-permissions/authorize?${params.toString()}`,
    {
      cache: "no-cache",
      credentials: "include",
      method: "GET",
    },
  );
  const body = (await response.json().catch(() => ({}))) as Partial<
    VendorUnitPermissionAccessResponse & { error: string }
  >;

  if (body.unitPermissionAccess) {
    return body.unitPermissionAccess;
  }

  throw new Error(
    body.error ?? `Vendor unit permission authorize API ${response.status}`,
  );
};

export const retrieveChinaVendorModuleSurfacePreview = async (
  moduleKey: string,
): Promise<VendorModuleSurfacePreviewResponse> => {
  const params = new URLSearchParams({ module_key: moduleKey });
  const response = await fetch(
    `${getBackendUrl()}/vendor/china/module-surfaces/preview?${params.toString()}`,
    {
      cache: "no-cache",
      credentials: "include",
      method: "GET",
    },
  );
  const body = (await response.json().catch(() => ({}))) as Partial<
    VendorModuleSurfacePreviewResponse & { error: string }
  >;

  if (!response.ok) {
    const access = body.unitPermissionAccess;
    throw new Error(
      access?.reason ??
        body.error ??
        `Vendor module surface preview API ${response.status}`,
    );
  }

  if (!body.unitPermissionAccess || !body.moduleSurface) {
    throw new Error("Vendor module surface preview response is incomplete.");
  }

  return {
    unitPermissionAccess: body.unitPermissionAccess,
    moduleSurface: body.moduleSurface,
  };
};
