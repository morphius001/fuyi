import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Heading,
  Select,
  StatusBadge,
  Switch,
  Table,
  Text,
} from "@medusajs/ui";
import { Link } from "react-router-dom";

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation";
import type { ChinaAdminPageMeta } from "../lib/china-admin-menu";
import {
  retrieveChinaAdminMarkets,
  type ChinaAdminMarket,
  type ChinaMarketStatus,
} from "../lib/china-admin-market-client";
import ChinaAdminShell from "./ChinaAdminShell";
import {
  capabilityControlRows,
  controlSummaryCards,
  integrationRows,
  marketCapabilityRows,
  markets,
  moduleRows,
  roleRows,
  unitPermissionRows,
} from "./china-ops/operationsData";
import {
  MockNotice,
  ReadonlySwitchState,
  TranslatedStatus,
} from "./china-ops/OperationPrimitives";

type ChinaAdminOperationsConsoleProps = {
  page: ChinaAdminPageMeta;
};

type ChinaCapabilityStatus =
  | "enabled_baseline"
  | "read_only_baseline"
  | "disabled_until_backend"
  | "design_only"
  | "high_risk_serial";

type ChinaCapability = {
  key: string;
  label: string;
  description: string;
  status: ChinaCapabilityStatus;
  owner: string;
  risk: "low" | "medium" | "high";
};

type ChinaCapabilityGroup = {
  key: string;
  label: string;
  capabilities: ChinaCapability[];
};

type AdminCapabilityResponse = {
  capabilities: {
    mode: string;
    source: string;
    note: string;
    groups: ChinaCapabilityGroup[];
  };
};

type AdminCapabilityState =
  | { status: "loading" }
  | { status: "ready"; data: AdminCapabilityResponse["capabilities"] }
  | { status: "error"; message: string };

type AdminMarketsState =
  | { status: "loading" }
  | {
      status: "ready";
      data: Awaited<ReturnType<typeof retrieveChinaAdminMarkets>>;
    }
  | { status: "error"; message: string };

const adminCapabilityStatusColors: Record<
  ChinaCapabilityStatus,
  "green" | "grey" | "blue" | "orange" | "red"
> = {
  enabled_baseline: "green",
  read_only_baseline: "blue",
  disabled_until_backend: "grey",
  design_only: "orange",
  high_risk_serial: "red",
};

const marketStatusColors: Record<
  ChinaMarketStatus,
  "green" | "grey" | "blue" | "orange" | "red"
> = {
  draft: "orange",
  open: "green",
  paused: "red",
  closed: "grey",
};

const getBackendUrl = () =>
  (import.meta.env.VITE_MEDUSA_BACKEND_URL ?? "http://127.0.0.1:9000").replace(
    /\/$/,
    "",
  );

const readMarketMetadataString = (market: ChinaAdminMarket, key: string) => {
  const value = market.metadata[key];

  return typeof value === "string" && value.trim() ? value : "-";
};

const ControlSummary = () => {
  const { t } = useChinaAdminTranslation();

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {controlSummaryCards.map((card) => (
        <Container key={card.key} className="p-0">
          <div className="flex h-full flex-col gap-y-3 px-4 py-3">
            <div className="flex items-center justify-between gap-x-3">
              <Text size="small" weight="plus">
                {t(`chinaAdmin.operations.summary.${card.key}.title`)}
              </Text>
              <TranslatedStatus status={card.status} />
            </div>
            <div className="flex items-end justify-between gap-x-3">
              <Heading level="h2">{card.value}</Heading>
              <Text size="xsmall" className="text-right text-ui-fg-subtle">
                {t(`chinaAdmin.operations.summary.${card.key}.description`)}
              </Text>
            </div>
          </div>
        </Container>
      ))}
    </div>
  );
};

const MarketReadonlyApiPanel = () => {
  const { t } = useChinaAdminTranslation();
  const [marketState, setMarketState] = useState<AdminMarketsState>({
    status: "loading",
  });

  useEffect(() => {
    let mounted = true;

    retrieveChinaAdminMarkets()
      .then((data) => {
        if (mounted) {
          setMarketState({ status: "ready", data });
        }
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }

        setMarketState({
          status: "error",
          message: error instanceof Error ? error.message : "unknown",
        });
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Heading level="h2">
            {t("chinaAdmin.operations.marketReadonlyApi.title")}
          </Heading>
          {marketState.status === "ready" ? (
            <Badge size="2xsmall">{marketState.data.source}</Badge>
          ) : null}
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.marketReadonlyApi.description")}
        </Text>
      </div>

      {marketState.status === "loading" ? (
        <div className="px-4 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.marketReadonlyApi.loading")}
          </Text>
        </div>
      ) : null}

      {marketState.status === "error" ? (
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <StatusBadge color="orange">
            {t("chinaAdmin.operations.marketReadonlyApi.fallbackStatus")}
          </StatusBadge>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.marketReadonlyApi.errorMessage", {
              message: marketState.message,
            })}
          </Text>
        </div>
      ) : null}

      {marketState.status === "ready" ? (
        <>
          <div className="grid gap-3 px-4 py-3 md:grid-cols-3">
            <div className="flex flex-col gap-y-0.5 rounded-md bg-ui-bg-subtle px-3 py-2">
              <Text size="xsmall" className="text-ui-fg-muted">
                {t("chinaAdmin.operations.marketReadonlyApi.summary.count")}
              </Text>
              <Heading level="h3">{marketState.data.items.length}</Heading>
            </div>
            <div className="flex flex-col gap-y-0.5 rounded-md bg-ui-bg-subtle px-3 py-2 md:col-span-2">
              <Text size="xsmall" className="text-ui-fg-muted">
                {t("chinaAdmin.operations.marketReadonlyApi.summary.note")}
              </Text>
              <Text size="small" className="line-clamp-2">
                {marketState.data.note}
              </Text>
            </div>
          </div>

          {marketState.data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                      {t(
                        "chinaAdmin.operations.marketReadonlyApi.columns.name",
                      )}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t(
                        "chinaAdmin.operations.marketReadonlyApi.columns.city",
                      )}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t(
                        "chinaAdmin.operations.marketReadonlyApi.columns.hours",
                      )}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t(
                        "chinaAdmin.operations.marketReadonlyApi.columns.notice",
                      )}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t(
                        "chinaAdmin.operations.marketReadonlyApi.columns.status",
                      )}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t(
                        "chinaAdmin.operations.marketReadonlyApi.columns.action",
                      )}
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {marketState.data.items.map((market) => (
                    <Table.Row key={market.id}>
                      <Table.Cell>
                        <div className="flex min-w-[180px] flex-col gap-y-0.5">
                          <Text size="small" weight="plus">
                            {market.name}
                          </Text>
                          <Text size="xsmall" className="text-ui-fg-muted">
                            {market.slug}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {[market.city, market.district]
                          .filter(Boolean)
                          .join(" / ") || "-"}
                      </Table.Cell>
                      <Table.Cell>
                        {readMarketMetadataString(market, "hours")}
                      </Table.Cell>
                      <Table.Cell className="max-w-[360px]">
                        <Text size="small" className="line-clamp-2">
                          {readMarketMetadataString(market, "notice")}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge color={marketStatusColors[market.status]}>
                          {t(
                            `chinaAdmin.operations.marketReadonlyApi.status.${market.status}`,
                          )}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell>
                        <Button asChild size="small" variant="secondary">
                          <Link
                            to={`/cn/operations/market-capabilities/${encodeURIComponent(
                              market.id,
                            )}`}
                          >
                            {t(
                              "chinaAdmin.operations.marketReadonlyApi.actions.viewDetail",
                            )}
                          </Link>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          ) : (
            <div className="px-4 py-3">
              <Text size="small" className="text-ui-fg-subtle">
                {t("chinaAdmin.operations.marketReadonlyApi.empty")}
              </Text>
            </div>
          )}
        </>
      ) : null}
    </Container>
  );
};

const CapabilityContractFromApi = () => {
  const { t } = useChinaAdminTranslation();
  const [capabilityState, setCapabilityState] = useState<AdminCapabilityState>({
    status: "loading",
  });

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${getBackendUrl()}/admin/china/capabilities`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Admin capability API ${response.status}`);
        }

        return (await response.json()) as AdminCapabilityResponse;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setCapabilityState({
            status: "ready",
            data: data.capabilities,
          });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setCapabilityState({
          status: "error",
          message: error instanceof Error ? error.message : "unknown",
        });
      });

    return () => controller.abort();
  }, []);

  const counts = useMemo(() => {
    if (capabilityState.status !== "ready") {
      return {
        groups: 0,
        capabilities: 0,
        highRisk: 0,
      };
    }

    const capabilities = capabilityState.data.groups.flatMap(
      (group) => group.capabilities,
    );

    return {
      groups: capabilityState.data.groups.length,
      capabilities: capabilities.length,
      highRisk: capabilities.filter((capability) => capability.risk === "high")
        .length,
    };
  }, [capabilityState]);

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Heading level="h2">
            {t("chinaAdmin.operations.contract.title")}
          </Heading>
          {capabilityState.status === "ready" ? (
            <Badge size="2xsmall">{capabilityState.data.source}</Badge>
          ) : null}
        </div>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.contract.description")}
        </Text>
      </div>

      {capabilityState.status === "loading" ? (
        <div className="px-4 py-3">
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.contract.loading")}
          </Text>
        </div>
      ) : null}

      {capabilityState.status === "error" ? (
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <StatusBadge color="orange">
            {t("chinaAdmin.operations.contract.fallbackStatus")}
          </StatusBadge>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.contract.errorMessage", {
              message: capabilityState.message,
            })}
          </Text>
        </div>
      ) : null}

      {capabilityState.status === "ready" ? (
        <>
          <div className="grid gap-3 px-4 py-3 md:grid-cols-3">
            <div className="flex flex-col gap-y-0.5 rounded-md bg-ui-bg-subtle px-3 py-2">
              <Text size="xsmall" className="text-ui-fg-muted">
                {t("chinaAdmin.operations.contract.summary.groups")}
              </Text>
              <Heading level="h3">{counts.groups}</Heading>
            </div>
            <div className="flex flex-col gap-y-0.5 rounded-md bg-ui-bg-subtle px-3 py-2">
              <Text size="xsmall" className="text-ui-fg-muted">
                {t("chinaAdmin.operations.contract.summary.capabilities")}
              </Text>
              <Heading level="h3">{counts.capabilities}</Heading>
            </div>
            <div className="flex flex-col gap-y-0.5 rounded-md bg-ui-bg-subtle px-3 py-2">
              <Text size="xsmall" className="text-ui-fg-muted">
                {t("chinaAdmin.operations.contract.summary.highRisk")}
              </Text>
              <Heading level="h3">{counts.highRisk}</Heading>
            </div>
          </div>

          <div className="grid gap-3 p-4 lg:grid-cols-2">
            {capabilityState.data.groups.map((group) => (
              <div
                key={group.key}
                className="flex flex-col gap-y-3 rounded-md bg-ui-bg-base p-3 shadow-borders-base"
              >
                <div className="flex items-center justify-between gap-3">
                  <Text size="small" weight="plus">
                    {group.label}
                  </Text>
                  <Badge size="2xsmall">{group.capabilities.length}</Badge>
                </div>
                <div className="flex flex-col gap-y-2">
                  {group.capabilities.slice(0, 4).map((capability) => (
                    <div
                      key={capability.key}
                      className="flex flex-col gap-y-1 rounded-md bg-ui-bg-subtle px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Text size="small" weight="plus">
                          {capability.label}
                        </Text>
                        <StatusBadge
                          color={adminCapabilityStatusColors[capability.status]}
                        >
                          {t(
                            `chinaAdmin.operations.contract.status.${capability.status}`,
                          )}
                        </StatusBadge>
                      </div>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {capability.description}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {t("chinaAdmin.operations.contract.ownerRisk", {
                          owner: capability.owner,
                          risk: capability.risk,
                        })}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </Container>
  );
};

const CapabilityControlBlueprint = () => {
  const { t } = useChinaAdminTranslation();

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <Heading level="h2">
          {t("chinaAdmin.operations.controlBlueprint.title")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.controlBlueprint.description")}
        </Text>
      </div>
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        {capabilityControlRows.map((row) => (
          <div
            key={row.key}
            className="flex flex-col gap-y-3 rounded-md bg-ui-bg-base p-3 shadow-borders-base"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-y-1">
                <Text size="small" weight="plus">
                  {t(
                    `chinaAdmin.operations.controlBlueprint.rows.${row.key}.title`,
                  )}
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t(
                    `chinaAdmin.operations.controlBlueprint.rows.${row.key}.description`,
                  )}
                </Text>
              </div>
              <TranslatedStatus status={row.status} />
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              {(
                ["platformDefault", "marketDefault", "merchantChoice"] as const
              ).map((field) => (
                <div
                  key={field}
                  className="flex flex-col gap-y-1 rounded-md bg-ui-bg-subtle px-3 py-2"
                >
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(
                      `chinaAdmin.operations.controlBlueprint.fields.${field}`,
                    )}
                  </Text>
                  <ReadonlySwitchState
                    checked={row[field]}
                    label={t(
                      "chinaAdmin.operations.controlBlueprint.switchAriaLabel",
                      {
                        capability: t(
                          `chinaAdmin.operations.controlBlueprint.rows.${row.key}.title`,
                        ),
                        field: t(
                          `chinaAdmin.operations.controlBlueprint.fields.${field}`,
                        ),
                      },
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="flex flex-col gap-y-1">
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t(
                    "chinaAdmin.operations.controlBlueprint.fields.consumerPlacement",
                  )}
                </Text>
                <Text size="small">
                  {t(
                    `chinaAdmin.operations.controlBlueprint.rows.${row.key}.consumerPlacement`,
                  )}
                </Text>
              </div>
              <div className="flex flex-col gap-y-1">
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t(
                    "chinaAdmin.operations.controlBlueprint.fields.vendorPlacement",
                  )}
                </Text>
                <Text size="small">
                  {t(
                    `chinaAdmin.operations.controlBlueprint.rows.${row.key}.vendorPlacement`,
                  )}
                </Text>
              </div>
            </div>

            <Text size="xsmall" className="text-ui-fg-muted">
              {t(`chinaAdmin.operations.guardrails.${row.guardrailKey}`)}
            </Text>
          </div>
        ))}
      </div>
    </Container>
  );
};

const IntegrationReadiness = () => {
  const { t } = useChinaAdminTranslation();

  return (
    <Container className="divide-y p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <Heading level="h2">
          {t("chinaAdmin.operations.integration.title")}
        </Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.integration.description")}
        </Text>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {t("chinaAdmin.operations.integration.columns.item")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("chinaAdmin.operations.integration.columns.source")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("chinaAdmin.operations.columns.owner")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("chinaAdmin.operations.columns.status")}
              </Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {integrationRows.map((row) => (
              <Table.Row key={row.key}>
                <Table.Cell>
                  {t(`chinaAdmin.operations.integration.items.${row.key}`)}
                </Table.Cell>
                <Table.Cell>
                  {t(
                    `chinaAdmin.operations.integration.sources.${row.sourceKey}`,
                  )}
                </Table.Cell>
                <Table.Cell>
                  {t(`chinaAdmin.operations.owners.${row.ownerKey}`)}
                </Table.Cell>
                <Table.Cell>
                  <TranslatedStatus status={row.status} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
    </Container>
  );
};

type UnitPermissionDraft = Record<string, Record<string, boolean>>;

type PlatformModuleSwitchDraftItem = {
  moduleKey: string;
  status: (typeof moduleRows)[number]["status"];
  switchOn: boolean;
  layerKey: string;
  scopeKey: string;
  vendorImpactKey: string;
  policyKey: string;
  guardrailKey: string;
  updatedAt: string;
};

type PlatformModuleSwitchApiResponse = {
  platformModuleSwitches: {
    mode: string;
    source: string;
    note: string;
    items: PlatformModuleSwitchDraftItem[];
  };
};

const createDefaultPlatformModuleSwitchDraft =
  (): PlatformModuleSwitchDraftItem[] =>
    moduleRows.map((row) => ({
      moduleKey: row.key,
      status: row.status,
      switchOn: row.switchOn,
      layerKey: row.layerKey,
      scopeKey: row.scopeKey,
      vendorImpactKey: row.vendorImpactKey,
      policyKey: row.policyKey,
      guardrailKey: row.guardrailKey,
      updatedAt: row.updatedAt,
    }));

const mapPlatformModuleSwitchResponseToDraft = (
  response: PlatformModuleSwitchApiResponse,
) => response.platformModuleSwitches.items;

type UnitPermissionApiItem = {
  unitKey: string;
  moduleAccess: {
    moduleKey: string;
    visible: boolean;
  }[];
};

type UnitPermissionApiSellerBinding = {
  unitKey: string;
  sellerId?: string | null;
  sellerHandle?: string | null;
  source: string;
};

type UnitPermissionApiSellerOption = {
  sellerId?: string | null;
  sellerHandle?: string | null;
  sellerName?: string | null;
  source: string;
};

type UnitPermissionApiResponse = {
  unitPermissions: {
    items: UnitPermissionApiItem[];
  };
  sellerBindings?: UnitPermissionApiSellerBinding[];
  sellerOptions?: UnitPermissionApiSellerOption[];
};

type UnitPermissionEffectiveApiResponse = {
  unitPermissionEffective: {
    source: string;
    note: string;
    unit: UnitPermissionApiItem;
    visibleModuleKeys: string[];
    hiddenModuleKeys: string[];
  };
};

type UnitPermissionEffectivePreviewState =
  | { status: "loading" }
  | {
      status: "ready";
      data: UnitPermissionEffectiveApiResponse["unitPermissionEffective"];
    }
  | { status: "error"; message: string };

const adminVendorPagesByUnitModule: Record<string, string[]> = {
  aiQuickListing: ["aiListingDraft"],
  deliverySuppliers: [
    "deliveryServices",
    "deliveryOrders",
    "deliveryExceptions",
    "deliveryCoverage",
  ],
  expressPrint: ["waybillPrinting"],
  financeReadOnly: ["finance"],
  frozenGoods: ["products", "orders", "logistics", "afterSales"],
  fruitsVegetables: ["products", "orders", "logistics", "afterSales"],
  livestream: ["liveOps"],
  marketMaterials: [
    "materialPurchase",
    "materialSupplier",
    "materialOrders",
    "supplyProducts",
  ],
  pickupCard: ["pickupCards"],
  remoteWholesalers: [
    "externalWholesalers",
    "regionalSources",
    "regionalQuotes",
    "regionalArrivalPlans",
    "coldChainArrivals",
    "wholesalePartners",
  ],
  seafoodTrade: [
    "mobileListing",
    "products",
    "orders",
    "logistics",
    "afterSales",
    "service",
    "marketing",
  ],
  seedlingWholesale: [
    "seedWholesale",
    "seedSuppliers",
    "seedNeeds",
    "seedQuotes",
    "seedPartners",
    "seedArrivalPlans",
  ],
  storeDecoration: ["market", "merchantTypes", "shopDecoration", "store", "data"],
  upstreamSupply: [
    "supplierWorkspace",
    "upstreamSources",
    "farmSuppliers",
    "supplyQuotes",
    "purchaseNeeds",
    "arrivalPlans",
  ],
};

const createDefaultUnitPermissionDraft = (): UnitPermissionDraft =>
  unitPermissionRows.reduce<UnitPermissionDraft>((draft, row) => {
    draft[row.key] = row.moduleAccess.reduce<Record<string, boolean>>(
      (modules, module) => {
        modules[module.moduleKey] = module.visible;

        return modules;
      },
      {},
    );

    return draft;
  }, {});

const createDefaultUnitPermissionBindingDraft = (): Record<string, string> => ({
  seafoodStallA12: "a-hai-xian-huo-dang",
});

const createDefaultUnitPermissionSellerOptions =
  (): UnitPermissionApiSellerOption[] => [
    {
      sellerHandle: "a-hai-xian-huo-dang",
      sellerName: "a-hai-xian-huo-dang",
      source: "seed_binding",
    },
  ];

const readSellerOptionValue = (option: UnitPermissionApiSellerOption) =>
  option.sellerId ?? option.sellerHandle ?? "";

const readSellerOptionLabel = (option: UnitPermissionApiSellerOption) => {
  const identity = option.sellerHandle ?? option.sellerId ?? "-";
  const name = option.sellerName?.trim();

  return name && name !== identity ? `${name} · ${identity}` : identity;
};

const mapUnitPermissionResponseToDraft = (
  response: UnitPermissionApiResponse,
): UnitPermissionDraft =>
  unitPermissionRows.reduce<UnitPermissionDraft>((draft, row) => {
    const apiUnit = response.unitPermissions.items.find(
      (item) => item.unitKey === row.key,
    );

    draft[row.key] = row.moduleAccess.reduce<Record<string, boolean>>(
      (modules, module) => {
        const apiModule = apiUnit?.moduleAccess.find(
          (item) => item.moduleKey === module.moduleKey,
        );

        modules[module.moduleKey] =
          typeof apiModule?.visible === "boolean"
            ? apiModule.visible
            : module.visible;

        return modules;
      },
      {},
    );

    return draft;
  }, {});

const mapUnitPermissionResponseToBindingDraft = (
  response: UnitPermissionApiResponse,
) =>
  unitPermissionRows.reduce<Record<string, string>>((draft, row) => {
    const apiBinding = response.sellerBindings?.find(
      (item) => item.unitKey === row.key,
    );

    draft[row.key] = apiBinding?.sellerHandle ?? apiBinding?.sellerId ?? "";

    return draft;
  }, createDefaultUnitPermissionBindingDraft());

const retrieveUnitPermissionEffectivePreview = async (unitKey: string) => {
  const response = await fetch(
    `${
      getBackendUrl()
    }/admin/china/unit-permissions/effective?${new URLSearchParams({
      unit_key: unitKey,
    }).toString()}`,
    {
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error(`unit permission effective API ${response.status}`);
  }

  return (await response.json()) as UnitPermissionEffectiveApiResponse;
};

const UnitPermissionControls = () => {
  const { t } = useChinaAdminTranslation();
  const [draftAccess, setDraftAccess] = useState<UnitPermissionDraft>(
    createDefaultUnitPermissionDraft,
  );
  const [bindingDraft, setBindingDraft] = useState<Record<string, string>>(
    createDefaultUnitPermissionBindingDraft,
  );
  const [sellerOptions, setSellerOptions] = useState<
    UnitPermissionApiSellerOption[]
  >(createDefaultUnitPermissionSellerOptions);
  const [saveStatus, setSaveStatus] = useState<
    "ready" | "saving" | "saved" | "error"
  >("ready");
  const [selectedPreviewUnitKey, setSelectedPreviewUnitKey] =
    useState("seafoodStallA12");
  const [effectivePreviewState, setEffectivePreviewState] =
    useState<UnitPermissionEffectivePreviewState>({ status: "loading" });

  const loadEffectivePreview = (unitKey: string) => {
    setEffectivePreviewState({ status: "loading" });

    return retrieveUnitPermissionEffectivePreview(unitKey)
      .then((data) => {
        setEffectivePreviewState({
          status: "ready",
          data: data.unitPermissionEffective,
        });
      })
      .catch((error: unknown) => {
        setEffectivePreviewState({
          status: "error",
          message: error instanceof Error ? error.message : "unknown",
        });
      });
  };

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${getBackendUrl()}/admin/china/unit-permissions`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`unit permission API ${response.status}`);
        }

        return (await response.json()) as UnitPermissionApiResponse;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setDraftAccess(mapUnitPermissionResponseToDraft(data));
          setBindingDraft(mapUnitPermissionResponseToBindingDraft(data));
          setSellerOptions(
            data.sellerOptions?.length
              ? data.sellerOptions
              : createDefaultUnitPermissionSellerOptions(),
          );
          setSaveStatus("saved");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSaveStatus("error");
        }
      });

    retrieveUnitPermissionEffectivePreview("seafoodStallA12")
      .then((data) => {
        if (!controller.signal.aborted) {
          setEffectivePreviewState({
            status: "ready",
            data: data.unitPermissionEffective,
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setEffectivePreviewState({
            status: "error",
            message: error instanceof Error ? error.message : "unknown",
          });
        }
      });

    return () => controller.abort();
  }, []);

  const updateModuleAccess = (
    unitKey: string,
    moduleKey: string,
    checked: boolean,
  ) => {
    setSelectedPreviewUnitKey(unitKey);
    setDraftAccess((current) => {
      const next = {
        ...current,
        [unitKey]: {
          ...current[unitKey],
          [moduleKey]: checked,
        },
      };

      return next;
    });

    setSaveStatus("saving");
    fetch(`${getBackendUrl()}/admin/china/unit-permissions`, {
      body: JSON.stringify({ unitKey, moduleKey, visible: checked }),
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`unit permission API ${response.status}`);
        }

        setSaveStatus("saved");
        void loadEffectivePreview(unitKey);
      })
      .catch(() => setSaveStatus("error"));
  };

  const resetDraft = () => {
    setSaveStatus("saving");
    fetch(`${getBackendUrl()}/admin/china/unit-permissions`, {
      credentials: "include",
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`unit permission API ${response.status}`);
        }

        return (await response.json()) as UnitPermissionApiResponse;
      })
      .then((data) => {
        setDraftAccess(mapUnitPermissionResponseToDraft(data));
        setBindingDraft(mapUnitPermissionResponseToBindingDraft(data));
        setSellerOptions(
          data.sellerOptions?.length
            ? data.sellerOptions
            : createDefaultUnitPermissionSellerOptions(),
        );
        setSaveStatus("saved");
        void loadEffectivePreview(selectedPreviewUnitKey);
      })
      .catch(() => setSaveStatus("error"));
  };

  const updateSellerBinding = (unitKey: string) => {
    const sellerValue = bindingDraft[unitKey]?.trim();
    const sellerOption = sellerOptions.find(
      (option) => readSellerOptionValue(option) === sellerValue,
    );

    if (!sellerValue || !sellerOption) {
      setSaveStatus("error");
      return;
    }

    setSaveStatus("saving");
    fetch(`${getBackendUrl()}/admin/china/unit-permissions`, {
      body: JSON.stringify({
        unitKey,
        sellerHandle: sellerOption.sellerHandle,
        sellerId: sellerOption.sellerId,
      }),
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`unit permission binding API ${response.status}`);
        }

        return (await response.json()) as UnitPermissionApiResponse;
      })
      .then((data) => {
        setBindingDraft(mapUnitPermissionResponseToBindingDraft(data));
        setSellerOptions(
          data.sellerOptions?.length
            ? data.sellerOptions
            : createDefaultUnitPermissionSellerOptions(),
        );
        setSaveStatus("saved");
        void loadEffectivePreview(unitKey);
      })
      .catch(() => setSaveStatus("error"));
  };

  return (
    <Container className="p-0">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-y-1">
          <Heading level="h2">
            {t("chinaAdmin.operations.unitPermissionControls.title")}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.unitPermissionControls.description")}
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={resetDraft}>
          {t("chinaAdmin.operations.unitPermissionControls.actions.reset")}
        </Button>
      </div>

      <div className="mx-4 mb-3 rounded-md bg-ui-bg-subtle px-3 py-2 shadow-borders-base">
        <Text size="small" className="text-ui-fg-subtle">
          {t("chinaAdmin.operations.unitPermissionControls.serverDraftNotice", {
            status: t(
              `chinaAdmin.operations.unitPermissionControls.saveStatus.${saveStatus}`,
            ),
          })}
        </Text>
      </div>

      <div className="mx-4 mb-4 flex flex-col gap-3 rounded-md bg-ui-bg-base px-4 py-3 shadow-borders-base">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-y-1">
            <Heading level="h3">
              {t(
                "chinaAdmin.operations.unitPermissionControls.effectivePreview.title",
              )}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t(
                "chinaAdmin.operations.unitPermissionControls.effectivePreview.description",
              )}
            </Text>
          </div>
          {effectivePreviewState.status === "ready" ? (
            <Badge size="2xsmall">{effectivePreviewState.data.source}</Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2" aria-label={t(
          "chinaAdmin.operations.unitPermissionControls.effectivePreview.selectUnit",
        )}>
          {unitPermissionRows.map((row) => (
            <Button
              key={row.key}
              size="small"
              variant={
                row.key === selectedPreviewUnitKey ? "primary" : "secondary"
              }
              onClick={() => {
                setSelectedPreviewUnitKey(row.key);
                void loadEffectivePreview(row.key);
              }}
            >
              {t(`chinaAdmin.operations.units.${row.key}.name`)}
            </Button>
          ))}
        </div>

        {effectivePreviewState.status === "loading" ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t(
              "chinaAdmin.operations.unitPermissionControls.effectivePreview.loading",
            )}
          </Text>
        ) : null}

        {effectivePreviewState.status === "error" ? (
          <Text size="small" className="text-ui-fg-subtle">
            {t(
              "chinaAdmin.operations.unitPermissionControls.effectivePreview.errorMessage",
              {
                message: effectivePreviewState.message,
              },
            )}
          </Text>
        ) : null}

        {effectivePreviewState.status === "ready" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-y-2 rounded-md bg-ui-bg-subtle px-3 py-2">
              <Text size="small" weight="plus">
                {t(
                  "chinaAdmin.operations.unitPermissionControls.effectivePreview.visibleModules",
                )}
              </Text>
              <div className="grid gap-2">
                {effectivePreviewState.data.visibleModuleKeys.map(
                  (moduleKey) => (
                    <div
                      key={moduleKey}
                      className="flex items-center justify-between gap-3 rounded-md bg-ui-bg-base px-3 py-2 shadow-borders-base"
                    >
                      <Text size="small">
                        {t(`chinaAdmin.operations.modules.${moduleKey}`)}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {t(
                          "chinaAdmin.operations.unitPermissionControls.effectivePreview.vendorEntryCount",
                          {
                            count:
                              adminVendorPagesByUnitModule[moduleKey]
                                ?.length ?? 0,
                          },
                        )}
                      </Text>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="flex flex-col gap-y-2 rounded-md bg-ui-bg-subtle px-3 py-2">
              <Text size="small" weight="plus">
                {t(
                  "chinaAdmin.operations.unitPermissionControls.effectivePreview.hiddenModules",
                )}
              </Text>
              <div className="grid gap-2">
                {effectivePreviewState.data.hiddenModuleKeys.map(
                  (moduleKey) => (
                    <div
                      key={moduleKey}
                      className="flex items-center justify-between gap-3 rounded-md bg-ui-bg-base px-3 py-2 shadow-borders-base"
                    >
                      <Text size="small">
                        {t(`chinaAdmin.operations.modules.${moduleKey}`)}
                      </Text>
                      <Text size="xsmall" className="text-ui-fg-muted">
                        {t(
                          "chinaAdmin.operations.unitPermissionControls.effectivePreview.vendorEntryCount",
                          {
                            count:
                              adminVendorPagesByUnitModule[moduleKey]
                                ?.length ?? 0,
                          },
                        )}
                      </Text>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 px-4 pb-4 pt-1 xl:grid-cols-2">
        {unitPermissionRows.map((row) => {
          const visibleCount = row.moduleAccess.filter(
            (module) => draftAccess[row.key]?.[module.moduleKey],
          ).length;

          return (
            <div
              key={row.key}
              className="flex flex-col gap-y-4 rounded-md bg-ui-bg-base p-4 shadow-borders-base"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.operations.units.${row.key}.name`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.operations.units.${row.key}.description`)}
                  </Text>
                </div>
                <TranslatedStatus status={row.status} />
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <div className="flex flex-col gap-y-1 rounded-md bg-ui-bg-subtle px-3 py-2">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(
                      "chinaAdmin.operations.unitPermissionControls.fields.unitType",
                    )}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.operations.unitTypes.${row.unitTypeKey}`)}
                  </Text>
                </div>
                <div className="flex flex-col gap-y-1 rounded-md bg-ui-bg-subtle px-3 py-2">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(
                      "chinaAdmin.operations.unitPermissionControls.fields.market",
                    )}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.operations.markets.${row.marketKey}.name`)}
                  </Text>
                </div>
                <div className="flex flex-col gap-y-1 rounded-md bg-ui-bg-subtle px-3 py-2">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(
                      "chinaAdmin.operations.unitPermissionControls.fields.visibleCount",
                    )}
                  </Text>
                  <Text size="small">
                    {visibleCount} / {row.moduleAccess.length}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-y-2 rounded-md bg-ui-bg-subtle px-3 py-2">
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t(
                    "chinaAdmin.operations.unitPermissionControls.fields.sellerBinding",
                  )}
                </Text>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Select
                    value={bindingDraft[row.key] ?? ""}
                    onValueChange={(value) =>
                      setBindingDraft((current) => ({
                        ...current,
                        [row.key]: value,
                      }))
                    }
                  >
                    <Select.Trigger className="min-w-[260px]">
                      <Select.Value
                        placeholder={t(
                          "chinaAdmin.operations.unitPermissionControls.sellerSelectPlaceholder",
                        )}
                      />
                    </Select.Trigger>
                    <Select.Content>
                      {sellerOptions.map((option) => {
                        const value = readSellerOptionValue(option);

                        return value ? (
                          <Select.Item key={value} value={value}>
                            {readSellerOptionLabel(option)}
                          </Select.Item>
                        ) : null;
                      })}
                    </Select.Content>
                  </Select>
                  <Button
                    size="small"
                    variant="secondary"
                    disabled={!bindingDraft[row.key]}
                    onClick={() => updateSellerBinding(row.key)}
                  >
                    {t(
                      "chinaAdmin.operations.unitPermissionControls.actions.saveBinding",
                    )}
                  </Button>
                </div>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t(
                    "chinaAdmin.operations.unitPermissionControls.bindingNotice",
                  )}
                </Text>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {row.moduleAccess.map((module) => (
                  <div
                    key={module.moduleKey}
                    className="flex min-h-[92px] flex-col justify-between gap-y-2 rounded-md bg-ui-bg-subtle px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Text size="small" weight="plus">
                        {t(`chinaAdmin.operations.modules.${module.moduleKey}`)}
                      </Text>
                      <div className="flex min-w-max items-center gap-x-2">
                        <Switch
                          size="small"
                          checked={Boolean(
                            draftAccess[row.key]?.[module.moduleKey],
                          )}
                          onCheckedChange={(checked) =>
                            updateModuleAccess(
                              row.key,
                              module.moduleKey,
                              checked,
                            )
                          }
                          aria-label={t(
                            "chinaAdmin.operations.unitPermissionControls.switchAriaLabel",
                            {
                              unit: t(
                                `chinaAdmin.operations.units.${row.key}.name`,
                              ),
                              module: t(
                                `chinaAdmin.operations.modules.${module.moduleKey}`,
                              ),
                            },
                          )}
                        />
                        <Text size="xsmall" className="text-ui-fg-muted">
                          {draftAccess[row.key]?.[module.moduleKey]
                            ? t(
                                "chinaAdmin.operations.unitPermissionControls.switchOn",
                              )
                            : t(
                                "chinaAdmin.operations.unitPermissionControls.switchOff",
                              )}
                        </Text>
                      </div>
                    </div>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t(
                        draftAccess[row.key]?.[module.moduleKey]
                          ? `chinaAdmin.operations.unitPermissionControls.reasons.${module.reasonKey}`
                          : "chinaAdmin.operations.unitPermissionControls.hiddenByOperator",
                      )}
                    </Text>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-y-1">
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t("chinaAdmin.operations.columns.mockBoundary")}
                </Text>
                <Text size="small">
                  {t(`chinaAdmin.operations.guardrails.${row.guardrailKey}`)}
                </Text>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t("chinaAdmin.operations.columns.updatedAt")}：
                  {row.updatedAt}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

const UnitPermissionsPage = () => (
  <>
    <MockNotice
      titleKey="chinaAdmin.operations.unitPermissionControls.noticeTitle"
      messageKey="chinaAdmin.operations.unitPermissionControls.noticeMessage"
    />
    <UnitPermissionControls />
  </>
);

const ModuleSwitches = () => {
  const { t } = useChinaAdminTranslation();
  const [draftRows, setDraftRows] = useState<PlatformModuleSwitchDraftItem[]>(
    createDefaultPlatformModuleSwitchDraft,
  );
  const [source, setSource] = useState("local_static_fallback");
  const [saveStatus, setSaveStatus] = useState<
    "ready" | "saving" | "saved" | "error"
  >("ready");

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${getBackendUrl()}/admin/china/module-switches`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`module switches API ${response.status}`);
        }

        return (await response.json()) as PlatformModuleSwitchApiResponse;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setDraftRows(mapPlatformModuleSwitchResponseToDraft(data));
          setSource(data.platformModuleSwitches.source);
          setSaveStatus("saved");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSaveStatus("error");
        }
      });

    return () => controller.abort();
  }, []);

  const updatePlatformSwitch = (moduleKey: string, checked: boolean) => {
    setDraftRows((current) =>
      current.map((row) =>
        row.moduleKey === moduleKey
          ? {
              ...row,
              switchOn: checked,
            }
          : row,
      ),
    );

    setSaveStatus("saving");
    fetch(`${getBackendUrl()}/admin/china/module-switches`, {
      body: JSON.stringify({ moduleKey, switchOn: checked }),
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`module switches API ${response.status}`);
        }

        return (await response.json()) as PlatformModuleSwitchApiResponse;
      })
      .then((data) => {
        setDraftRows(mapPlatformModuleSwitchResponseToDraft(data));
        setSource(data.platformModuleSwitches.source);
        setSaveStatus("saved");
      })
      .catch(() => setSaveStatus("error"));
  };

  const resetDraft = () => {
    setSaveStatus("saving");
    fetch(`${getBackendUrl()}/admin/china/module-switches`, {
      credentials: "include",
      method: "DELETE",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`module switches API ${response.status}`);
        }

        return (await response.json()) as PlatformModuleSwitchApiResponse;
      })
      .then((data) => {
        setDraftRows(mapPlatformModuleSwitchResponseToDraft(data));
        setSource(data.platformModuleSwitches.source);
        setSaveStatus("saved");
      })
      .catch(() => setSaveStatus("error"));
  };

  return (
    <>
      <MockNotice
        titleKey="chinaAdmin.operations.moduleSwitches.noticeTitle"
        messageKey="chinaAdmin.operations.moduleSwitches.noticeMessage"
      />
      <CapabilityContractFromApi />
      <Container className="divide-y p-0">
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Heading level="h2">
                {t("chinaAdmin.operations.moduleSwitches.title")}
              </Heading>
              <Badge size="2xsmall">{source}</Badge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.operations.moduleSwitches.description")}
            </Text>
          </div>
          <Button size="small" variant="secondary" onClick={resetDraft}>
            {t("chinaAdmin.operations.moduleSwitches.actions.reset")}
          </Button>
        </div>

        <div className="mx-4 mb-3 rounded-md bg-ui-bg-subtle px-3 py-2 shadow-borders-base">
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.moduleSwitches.serverDraftNotice", {
              status: t(
                `chinaAdmin.operations.moduleSwitches.saveStatus.${saveStatus}`,
              ),
            })}
          </Text>
        </div>

        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {draftRows.map((row) => (
            <div
              key={row.moduleKey}
              className="flex flex-col gap-y-3 rounded-md bg-ui-bg-base p-3 shadow-borders-base"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.operations.modules.${row.moduleKey}`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.operations.layers.${row.layerKey}`)}
                  </Text>
                </div>
                <TranslatedStatus status={row.status} />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Switch
                  size="small"
                  checked={row.switchOn}
                  disabled={saveStatus === "saving"}
                  onCheckedChange={(checked) =>
                    updatePlatformSwitch(row.moduleKey, checked)
                  }
                  aria-label={t(
                    "chinaAdmin.operations.moduleSwitches.switchAriaLabel",
                    {
                      module: t(
                        `chinaAdmin.operations.modules.${row.moduleKey}`,
                      ),
                    },
                  )}
                />
                <Text size="xsmall" className="text-ui-fg-muted">
                  {row.switchOn
                    ? t("chinaAdmin.operations.moduleSwitches.switchOn")
                    : t("chinaAdmin.operations.moduleSwitches.switchOff")}
                </Text>
                <Badge size="2xsmall">
                  {t(`chinaAdmin.operations.scopes.${row.scopeKey}`)}
                </Badge>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.columns.vendorImpact")}
                  </Text>
                <Text size="small">
                  {t(
                    `chinaAdmin.operations.vendorImpact.${row.vendorImpactKey}`,
                  )}
                </Text>
              </div>
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.columns.openPolicy")}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.operations.policies.${row.policyKey}`)}
                  </Text>
                </div>
              </div>

              <div className="flex flex-col gap-y-1">
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t("chinaAdmin.operations.columns.mockBoundary")}
                </Text>
                <Text size="small">
                  {t(`chinaAdmin.operations.guardrails.${row.guardrailKey}`)}
                </Text>
              </div>

              <Text size="xsmall" className="text-ui-fg-muted">
                {t("chinaAdmin.operations.columns.updatedAt")}：{row.updatedAt}
              </Text>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
};

const MarketCapabilities = () => {
  const { t } = useChinaAdminTranslation();
  const activeMarket = markets.find((market) => market.active) ?? markets[0];

  return (
    <>
      <MockNotice />
      <MarketReadonlyApiPanel />
      <Container className="p-0">
        <div className="flex flex-col gap-y-3 px-4 py-3">
          <div className="flex flex-col gap-y-1">
            <Heading level="h2">
              {t("chinaAdmin.operations.marketCapabilities.switchTitle")}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.operations.marketCapabilities.switchDescription")}
            </Text>
          </div>
          <div className="flex flex-wrap gap-2">
            {markets.map((market) => (
              <Button
                key={market.key}
                size="small"
                variant={market.active ? "primary" : "secondary"}
              >
                {t(`chinaAdmin.operations.markets.${market.key}.name`)}
              </Button>
            ))}
          </div>
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <Heading level="h2">
            {t("chinaAdmin.operations.marketPortfolio.title")}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.marketPortfolio.description")}
          </Text>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          {markets.map((market) => (
            <div
              key={market.key}
              className="flex flex-col gap-y-3 rounded-md bg-ui-bg-base p-3 shadow-borders-base"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.operations.markets.${market.key}.name`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(
                      `chinaAdmin.operations.markets.${market.key}.serviceRange`,
                    )}
                  </Text>
                </div>
                <TranslatedStatus status={market.status} />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.marketCapabilities.fields.hours")}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.operations.markets.${market.key}.hours`)}
                  </Text>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.marketPortfolio.capabilityCount")}
                  </Text>
                  <Text size="small">
                    {market.capabilityKeys.length}{" "}
                    {t("chinaAdmin.operations.marketPortfolio.capabilityUnit")}
                  </Text>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {market.capabilityKeys.map((capabilityKey) => (
                  <Badge key={capabilityKey} size="2xsmall">
                    {t(`chinaAdmin.operations.modules.${capabilityKey}`)}
                  </Badge>
                ))}
              </div>

              {market.active ? (
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t("chinaAdmin.operations.marketPortfolio.currentMock")}
                </Text>
              ) : null}
            </div>
          ))}
        </div>
      </Container>

      <div className="grid gap-3 lg:grid-cols-2">
        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <Heading level="h2">
                {t(`chinaAdmin.operations.markets.${activeMarket.key}.name`)}
              </Heading>
              <TranslatedStatus status={activeMarket.status} />
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {t("chinaAdmin.operations.marketCapabilities.currentMarket")}
            </Text>
          </div>
          <div className="flex flex-col gap-y-2 px-4 py-3">
            <Text size="small" weight="plus">
              {t(
                "chinaAdmin.operations.marketCapabilities.fields.supportedCapabilities",
              )}
            </Text>
            <div className="flex flex-wrap gap-2">
              {activeMarket.capabilityKeys.map((capabilityKey) => (
                <Badge key={capabilityKey} size="2xsmall">
                  {t(`chinaAdmin.operations.modules.${capabilityKey}`)}
                </Badge>
              ))}
            </div>
          </div>
          {[
            "hours",
            "announcement",
            "deliveryRule",
            "pickupRule",
            "serviceRange",
          ].map((key) => (
            <div key={key} className="flex flex-col gap-y-1 px-4 py-3">
              <Text size="xsmall" className="text-ui-fg-muted">
                {t(`chinaAdmin.operations.marketCapabilities.fields.${key}`)}
              </Text>
              <Text size="small">
                {t(`chinaAdmin.operations.markets.${activeMarket.key}.${key}`)}
              </Text>
            </div>
          ))}
        </Container>

        <Container className="divide-y p-0">
          <div className="flex flex-col gap-y-1 px-4 py-3">
            <Heading level="h2">
              {t("chinaAdmin.operations.marketCapabilities.capabilityTitle")}
            </Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {t(
                "chinaAdmin.operations.marketCapabilities.capabilityDescription",
              )}
            </Text>
          </div>
          <div className="divide-y">
            {marketCapabilityRows.map((row) => (
              <div key={row.key} className="flex flex-col gap-y-3 px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-col gap-y-1">
                    <Text size="small" weight="plus">
                      {t(`chinaAdmin.operations.modules.${row.key}`)}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t(`chinaAdmin.operations.owners.${row.ownerKey}`)}
                    </Text>
                  </div>
                  <TranslatedStatus status={row.status} />
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Text size="small">
                    {t(
                      `chinaAdmin.operations.vendorImpact.${row.vendorImpactKey}`,
                    )}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.operations.policies.${row.policyKey}`)}
                  </Text>
                </div>
                <Text size="xsmall" className="text-ui-fg-muted">
                  {t(`chinaAdmin.operations.guardrails.${row.guardrailKey}`)}
                </Text>
              </div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
};

const RoleEnablement = () => {
  const { t } = useChinaAdminTranslation();
  const roleTypeKeys = Array.from(new Set(roleRows.map((row) => row.typeKey)));

  return (
    <>
      <MockNotice />
      <Container className="divide-y p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <Heading level="h2">
            {t("chinaAdmin.operations.rolePortfolio.title")}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.rolePortfolio.description")}
          </Text>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-3">
          {roleTypeKeys.map((typeKey) => {
            const rows = roleRows.filter((row) => row.typeKey === typeKey);
            const marketCount = new Set(rows.map((row) => row.marketKey)).size;
            const moduleCount = new Set(rows.flatMap((row) => row.moduleKeys))
              .size;

            return (
              <div
                key={typeKey}
                className="flex flex-col gap-y-3 rounded-md bg-ui-bg-base p-3 shadow-borders-base"
              >
                <div className="flex flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.operations.roleTypes.${typeKey}`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.rolePortfolio.typeBoundary")}
                  </Text>
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <div className="flex flex-col gap-y-1">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t("chinaAdmin.operations.rolePortfolio.roleCount")}
                    </Text>
                    <Text size="small" weight="plus">
                      {rows.length}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t("chinaAdmin.operations.rolePortfolio.marketCount")}
                    </Text>
                    <Text size="small" weight="plus">
                      {marketCount}
                    </Text>
                  </div>
                  <div className="flex flex-col gap-y-1">
                    <Text size="xsmall" className="text-ui-fg-muted">
                      {t("chinaAdmin.operations.rolePortfolio.moduleCount")}
                    </Text>
                    <Text size="small" weight="plus">
                      {moduleCount}
                    </Text>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Array.from(
                    new Set(rows.flatMap((row) => row.moduleKeys)),
                  ).map((moduleKey) => (
                    <Badge key={moduleKey} size="2xsmall">
                      {t(`chinaAdmin.operations.modules.${moduleKey}`)}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Container>

      <Container className="divide-y p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <Heading level="h2">
            {t("chinaAdmin.operations.roleEnablement.title")}
          </Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.operations.roleEnablement.description")}
          </Text>
        </div>
        <div className="grid gap-3 p-4 lg:grid-cols-2">
          {roleRows.map((row) => (
            <div
              key={row.key}
              className="flex flex-col gap-y-3 rounded-md bg-ui-bg-base p-3 shadow-borders-base"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.operations.roles.${row.key}`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.operations.roleTypes.${row.typeKey}`)}
                  </Text>
                </div>
                <TranslatedStatus status={row.status} />
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.columns.qualification")}
                  </Text>
                  <Text size="small">
                    {t(
                      `chinaAdmin.operations.qualifications.${row.qualificationKey}`,
                    )}
                  </Text>
                </div>
                <div className="flex flex-col gap-y-1">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.columns.market")}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.operations.markets.${row.marketKey}.name`)}
                  </Text>
                </div>
                <div className="flex flex-col gap-y-1 md:col-span-2">
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t("chinaAdmin.operations.columns.scope")}
                  </Text>
                  <Text size="small">
                    {t(`chinaAdmin.operations.roleScopes.${row.scopeKey}`)}
                  </Text>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {row.moduleKeys.map((moduleKey) => (
                  <Badge key={moduleKey} size="2xsmall">
                    {t(`chinaAdmin.operations.modules.${moduleKey}`)}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
};

const ChinaAdminOperationsConsole = ({
  page,
}: ChinaAdminOperationsConsoleProps) => {
  const { t } = useChinaAdminTranslation();
  const isPrimaryControlsPage =
    page.key === "moduleSwitches" || page.key === "unitPermissions";

  const contentByPage = {
    unitPermissions: <UnitPermissionsPage />,
    moduleSwitches: <ModuleSwitches />,
    marketCapabilities: <MarketCapabilities />,
    roleEnablement: <RoleEnablement />,
  };

  return (
    <ChinaAdminShell
      titleKey={page.labelKey}
      descriptionKey={page.descriptionKey}
      page={page}
      actions={
        <>
          <Button size="small" variant="secondary" disabled>
            {t("chinaAdmin.actions.export")}
          </Button>
          <Button size="small" variant="primary" disabled>
            {t("chinaAdmin.operations.actions.mockConfigure")}
          </Button>
        </>
      }
    >
      <ControlSummary />
      {isPrimaryControlsPage ? (
        <>
          {contentByPage[page.key as keyof typeof contentByPage] ?? (
            <ModuleSwitches />
          )}
          <CapabilityControlBlueprint />
        </>
      ) : (
        <>
          <CapabilityControlBlueprint />
          {contentByPage[page.key as keyof typeof contentByPage] ?? (
            <ModuleSwitches />
          )}
        </>
      )}
      <IntegrationReadiness />
    </ChinaAdminShell>
  );
};

export default ChinaAdminOperationsConsole;
