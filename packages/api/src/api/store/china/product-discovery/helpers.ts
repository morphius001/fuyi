import type {
  BuildChinaProductDiscoveryReadModelInput,
  ChinaProductDiscoveryFilters,
  ChinaProductDiscoveryProductRow,
  ChinaProductDiscoverySellerContext,
} from "../../../../lib/china-product-discovery-read-model";

type ProductDiscoveryQuery = {
  whereNull: (key: string) => ProductDiscoveryQuery;
  where: (key: string | Record<string, unknown>, value?: unknown) => ProductDiscoveryQuery;
  whereIn: (key: string, values: unknown[]) => ProductDiscoveryQuery;
  andWhere: (callback: (builder: ProductDiscoveryQuery) => unknown) => ProductDiscoveryQuery;
  orWhere: (key: string, operator: string, value: unknown) => ProductDiscoveryQuery;
  orderBy: (key: string, direction?: string) => ProductDiscoveryQuery;
  limit: (value: number) => ProductDiscoveryQuery;
  select: (...keys: string[]) => Promise<Array<Record<string, unknown>>>;
};

export type ProductDiscoveryPg = (tableName: string) => ProductDiscoveryQuery;

export const parseProductDiscoveryFilters = (query: Record<string, unknown>) => {
  const readQueryString = (key: string) => {
    const value = query[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      const first = value.find(
        (item): item is string => typeof item === "string" && !!item.trim()
      );

      return first?.trim();
    }

    return undefined;
  };

  const limitValue = Number(readQueryString("limit"));
  const limit =
    Number.isFinite(limitValue) && limitValue > 0
      ? Math.min(Math.floor(limitValue), 24)
      : 12;

  return {
    filters: {
      query: readQueryString("q"),
      market: readQueryString("market"),
      sellerHandle: readQueryString("seller_handle"),
      categoryHandle: readQueryString("category_handle"),
    } satisfies ChinaProductDiscoveryFilters,
    limit,
  };
};

const readMetadataString = (
  metadata: unknown,
  keys: string[]
): string | undefined => {
  if (!metadata || typeof metadata !== "object") {
    return undefined;
  }

  const record = metadata as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const buildSellerContext = (
  row: Record<string, unknown>
): ChinaProductDiscoverySellerContext | undefined => {
  if (typeof row.id !== "string") {
    return undefined;
  }

  return {
    id: row.id,
    handle: typeof row.handle === "string" ? row.handle : undefined,
    name: typeof row.name === "string" ? row.name : undefined,
    market: readMetadataString(row.metadata, ["market_name", "market"]),
    booth: readMetadataString(row.metadata, ["booth_no", "booth", "stall_no"]),
  };
};

const buildProductRow = ({
  product,
  seller,
}: {
  product: Record<string, unknown>;
  seller?: ChinaProductDiscoverySellerContext;
}): ChinaProductDiscoveryProductRow | undefined => {
  if (typeof product.id !== "string") {
    return undefined;
  }

  return {
    id: product.id,
    title: typeof product.title === "string" ? product.title : undefined,
    handle: typeof product.handle === "string" ? product.handle : undefined,
    seller_id: seller?.id,
    seller_handle: seller?.handle,
    seller_name: seller?.name,
    market: seller?.market,
    booth: seller?.booth,
    metadata:
      product.metadata && typeof product.metadata === "object"
        ? (product.metadata as Record<string, unknown>)
        : undefined,
  };
};

export const readChinaProductDiscoveryRows = async ({
  pg,
  filters,
  limit,
  now = new Date(),
}: {
  pg: ProductDiscoveryPg;
  filters: ChinaProductDiscoveryFilters;
  limit: number;
  now?: Date;
}): Promise<BuildChinaProductDiscoveryReadModelInput> => {
  const sellerRows = await pg("seller")
    .whereNull("deleted_at")
    .where("status", "open")
    .andWhere((builder) => {
      builder.whereNull("closed_from").orWhere("closed_from", ">", now);
    })
    .andWhere((builder) => {
      builder.whereNull("closed_to").orWhere("closed_to", "<", now);
    })
    .orderBy("created_at", "asc")
    .limit(24)
    .select("id", "handle", "name", "metadata");
  const sellerContexts = sellerRows
    .map(buildSellerContext)
    .filter((seller): seller is ChinaProductDiscoverySellerContext =>
      Boolean(seller)
    )
    .filter((seller) =>
      filters.sellerHandle ? seller.handle === filters.sellerHandle : true
    );

  if (!sellerContexts.length) {
    return {
      productRows: [],
      sellerContexts: [],
      sellerProductIds: [],
      filters,
      limit,
    };
  }

  const sellerIds = sellerContexts.map((seller) => seller.id);
  const links = await pg("product_product_seller_seller")
    .whereNull("deleted_at")
    .whereIn("seller_id", sellerIds)
    .select("product_id", "seller_id");
  const productIds = Array.from(
    new Set(
      links
        .map((link) =>
          typeof link.product_id === "string" ? link.product_id : undefined
        )
        .filter((productId): productId is string => Boolean(productId))
    )
  );

  if (!productIds.length) {
    return {
      productRows: [],
      sellerContexts,
      sellerProductIds: [],
      filters,
      limit,
    };
  }

  const products = await pg("product")
    .whereNull("deleted_at")
    .where("status", "published")
    .whereIn("id", productIds)
    .orderBy("created_at", "desc")
    .limit(limit)
    .select("id", "title", "handle", "metadata");
  const sellerById = new Map(sellerContexts.map((seller) => [seller.id, seller]));
  const sellerIdByProductId = new Map(
    links
      .filter(
        (link) =>
          typeof link.product_id === "string" &&
          typeof link.seller_id === "string"
      )
      .map((link) => [link.product_id as string, link.seller_id as string])
  );
  const productRows = products
    .map((product) =>
      buildProductRow({
        product,
        seller: sellerById.get(sellerIdByProductId.get(product.id as string) ?? ""),
      })
    )
    .filter((product): product is ChinaProductDiscoveryProductRow =>
      Boolean(product)
    );

  return {
    productRows,
    sellerContexts,
    sellerProductIds: filters.sellerHandle ? productIds : [],
    filters,
    limit,
  };
};
