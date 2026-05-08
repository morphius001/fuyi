export type ChinaProductDiscoverySource =
  | "store_product_table"
  | "seller_products_api"
  | "static_fallback";

export type ChinaProductDiscoveryFilters = {
  query?: string;
  market?: string;
  sellerHandle?: string;
  categoryHandle?: string;
};

export type ChinaProductDiscoveryItem = {
  id: string;
  title: string;
  handle?: string;
  sellerId?: string;
  sellerHandle?: string;
  sellerName?: string;
  market?: string;
  booth?: string;
  priceText?: string;
  specText?: string;
  stockText?: string;
  source: "store_product_table" | "static_fallback";
};

export type ChinaProductDiscoveryReadModel = {
  mode: "read_only_product_discovery";
  source: ChinaProductDiscoverySource;
  note: string;
  filters: ChinaProductDiscoveryFilters;
  items: ChinaProductDiscoveryItem[];
  readOnly: true;
  runtimeEnabled: false;
  canWriteBusinessState: false;
  blockedRuntime: Array<
    | "inventory_reservation"
    | "cart_mutation"
    | "checkout_shipping_options"
    | "order_mutation"
    | "payment"
    | "refund"
    | "settlement"
    | "commission"
    | "permission"
    | "fulfillment"
    | "logistics"
    | "search_ranking_provider"
    | "ads_bidding"
    | "recommendation_engine"
  >;
};

export type ChinaProductDiscoveryProductRow = {
  id: string;
  title?: string | null;
  handle?: string | null;
  seller_id?: string | null;
  sellerId?: string | null;
  seller_handle?: string | null;
  sellerHandle?: string | null;
  seller_name?: string | null;
  sellerName?: string | null;
  market?: string | null;
  market_name?: string | null;
  booth?: string | null;
  booth_no?: string | null;
  category_handle?: string | null;
  categoryHandle?: string | null;
  price_text?: string | null;
  priceText?: string | null;
  spec_text?: string | null;
  specText?: string | null;
  stock_text?: string | null;
  stockText?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ChinaProductDiscoverySellerContext = {
  id: string;
  handle?: string;
  name?: string;
  market?: string;
  booth?: string;
};

export type BuildChinaProductDiscoveryReadModelInput = {
  productRows?: ChinaProductDiscoveryProductRow[];
  sellerContexts?: ChinaProductDiscoverySellerContext[];
  sellerProductIds?: string[];
  filters?: ChinaProductDiscoveryFilters;
  fallbackItems?: ChinaProductDiscoveryItem[];
  limit?: number;
};

const runtimeNote =
  "Display-only product discovery. It does not reserve inventory, mutate cart, checkout, order, payment, fulfillment, settlement, commission, refund, or permission state.";

const bSideKeywords = [
  "物料",
  "包装",
  "泡沫箱",
  "冰袋",
  "冰块",
  "配送供应商",
  "上游",
  "种苗",
  "外地批发",
  "materials_supplier",
  "delivery_supplier",
  "upstream_supply",
  "seedling_supplier",
  "regional_wholesaler",
];

const fallbackItems: ChinaProductDiscoveryItem[] = [
  {
    id: "fallback_product",
    title: "鲜活梭子蟹",
    handle: "xian-huo-suo-zi-xie",
    sellerId: "fallback_seller",
    sellerHandle: "a-hai-xian-huo-dang",
    sellerName: "阿海鲜活档",
    market: "三门海鲜市场",
    booth: "A区18号",
    priceText: "¥68/斤",
    specText: "公母混装 500g/只起",
    stockText: "展示数据待后台更新",
    source: "static_fallback",
  },
];

const readString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const normalizeText = (value: string | undefined) =>
  value?.trim().toLocaleLowerCase("zh-CN");

const includesBSideKeyword = (values: Array<string | undefined>) =>
  values.some((value) =>
    bSideKeywords.some((keyword) => value?.includes(keyword))
  );

const buildSellerLookup = (sellers: ChinaProductDiscoverySellerContext[]) =>
  new Map(sellers.map((seller) => [seller.id, seller]));

const normalizeItem = (
  row: ChinaProductDiscoveryProductRow,
  sellerLookup: Map<string, ChinaProductDiscoverySellerContext>
): ChinaProductDiscoveryItem | undefined => {
  const title = readString(row.title) ?? readString(row.metadata?.title);

  if (!row.id || !title) {
    return undefined;
  }

  const sellerId =
    readString(row.sellerId) ?? readString(row.seller_id) ?? undefined;
  const seller = sellerId ? sellerLookup.get(sellerId) : undefined;

  return {
    id: row.id,
    title,
    handle: readString(row.handle) ?? readString(row.metadata?.handle),
    sellerId,
    sellerHandle:
      readString(row.sellerHandle) ??
      readString(row.seller_handle) ??
      seller?.handle,
    sellerName:
      readString(row.sellerName) ??
      readString(row.seller_name) ??
      seller?.name,
    market:
      readString(row.market) ??
      readString(row.market_name) ??
      readString(row.metadata?.market_name) ??
      seller?.market,
    booth:
      readString(row.booth) ??
      readString(row.booth_no) ??
      readString(row.metadata?.booth_no) ??
      seller?.booth,
    priceText:
      readString(row.priceText) ??
      readString(row.price_text) ??
      readString(row.metadata?.price_text),
    specText:
      readString(row.specText) ??
      readString(row.spec_text) ??
      readString(row.metadata?.spec_text),
    stockText:
      readString(row.stockText) ??
      readString(row.stock_text) ??
      readString(row.metadata?.stock_text),
    source: "store_product_table",
  };
};

const isConsumerVisible = (
  item: ChinaProductDiscoveryItem,
  row: ChinaProductDiscoveryProductRow
) =>
  !includesBSideKeyword([
    item.title,
    item.sellerName,
    item.market,
    item.booth,
    item.specText,
    readString(row.categoryHandle),
    readString(row.category_handle),
    readString(row.metadata?.category_handle),
    readString(row.metadata?.seller_role),
    readString(row.metadata?.seller_market_role),
    readString(row.metadata?.business_type),
  ]);

const matchesFilters = (
  item: ChinaProductDiscoveryItem,
  filters: ChinaProductDiscoveryFilters,
  row: ChinaProductDiscoveryProductRow,
  sellerProductIds: Set<string>
) => {
  const query = normalizeText(filters.query);

  if (query) {
    const searchText = normalizeText(
      [
        item.title,
        item.sellerName,
        item.market,
        item.booth,
        item.specText,
        item.stockText,
      ]
        .filter(Boolean)
        .join(" ")
    );

    if (!searchText?.includes(query)) {
      return false;
    }
  }

  if (filters.market && item.market !== filters.market) {
    return false;
  }

  if (filters.sellerHandle && item.sellerHandle !== filters.sellerHandle) {
    return false;
  }

  if (sellerProductIds.size > 0 && !sellerProductIds.has(item.id)) {
    return false;
  }

  if (filters.categoryHandle) {
    const categoryHandle =
      readString(row.categoryHandle) ??
      readString(row.category_handle) ??
      readString(row.metadata?.category_handle);

    if (categoryHandle !== filters.categoryHandle) {
      return false;
    }
  }

  return true;
};

const buildBlockedRuntime =
  (): ChinaProductDiscoveryReadModel["blockedRuntime"] => [
    "inventory_reservation",
    "cart_mutation",
    "checkout_shipping_options",
    "order_mutation",
    "payment",
    "refund",
    "settlement",
    "commission",
    "permission",
    "fulfillment",
    "logistics",
    "search_ranking_provider",
    "ads_bidding",
    "recommendation_engine",
  ];

export const buildChinaProductDiscoveryReadModel = ({
  productRows = [],
  sellerContexts = [],
  sellerProductIds = [],
  filters = {},
  fallbackItems: fallbackInput = fallbackItems,
  limit = 12,
}: BuildChinaProductDiscoveryReadModelInput = {}): ChinaProductDiscoveryReadModel => {
  const sellerLookup = buildSellerLookup(sellerContexts);
  const sellerProductIdSet = new Set(sellerProductIds);
  const normalizedRows = productRows
    .map((row) => ({
      row,
      item: normalizeItem(row, sellerLookup),
    }))
    .filter(
      (entry): entry is {
        row: ChinaProductDiscoveryProductRow;
        item: ChinaProductDiscoveryItem;
      } => Boolean(entry.item)
    );
  const items = normalizedRows
    .filter(({ item, row }) => isConsumerVisible(item, row))
    .filter(({ item, row }) =>
      matchesFilters(item, filters, row, sellerProductIdSet)
    )
    .slice(0, Math.max(0, limit))
    .map(({ item }) => item);
  const shouldUseFallback = items.length === 0 && productRows.length === 0;

  return {
    mode: "read_only_product_discovery",
    source: shouldUseFallback
      ? "static_fallback"
      : sellerProductIdSet.size > 0
        ? "seller_products_api"
        : "store_product_table",
    note: runtimeNote,
    filters,
    items: shouldUseFallback ? fallbackInput.slice(0, Math.max(0, limit)) : items,
    readOnly: true,
    runtimeEnabled: false,
    canWriteBusinessState: false,
    blockedRuntime: buildBlockedRuntime(),
  };
};
