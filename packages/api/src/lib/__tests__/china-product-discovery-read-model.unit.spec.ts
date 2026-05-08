import { buildChinaProductDiscoveryReadModel } from "../china-product-discovery-read-model";

describe("China product discovery read model", () => {
  it("normalizes store products into display-only product discovery items", () => {
    const view = buildChinaProductDiscoveryReadModel({
      productRows: [
        {
          id: "prod_crab",
          title: "鲜活梭子蟹",
          handle: "xian-huo-suo-zi-xie",
          seller_id: "sel_1",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "A区18号",
            price_text: "¥68/斤",
            spec_text: "公母混装 500g/只起",
            stock_text: "今日到货",
          },
        },
      ],
      sellerContexts: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          market: "三门海鲜市场",
          booth: "A区18号",
        },
      ],
    });

    expect(view).toMatchObject({
      mode: "read_only_product_discovery",
      source: "store_product_table",
      readOnly: true,
      runtimeEnabled: false,
      canWriteBusinessState: false,
      items: [
        {
          id: "prod_crab",
          title: "鲜活梭子蟹",
          sellerHandle: "a-hai-xian-huo-dang",
          sellerName: "阿海鲜活档",
          market: "三门海鲜市场",
          booth: "A区18号",
          priceText: "¥68/斤",
          stockText: "今日到货",
          source: "store_product_table",
        },
      ],
    });
    expect(view.note).toContain("Display-only");
    expect(view.blockedRuntime).toContain("checkout_shipping_options");
    expect(view.blockedRuntime).toContain("payment");
  });

  it("applies query, market, seller, category, and seller product id filters without mutating runtime state", () => {
    const view = buildChinaProductDiscoveryReadModel({
      filters: {
        query: "梭子蟹",
        market: "三门海鲜市场",
        sellerHandle: "a-hai-xian-huo-dang",
        categoryHandle: "fresh-crab",
      },
      sellerProductIds: ["prod_crab"],
      sellerContexts: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          market: "三门海鲜市场",
          booth: "A区18号",
        },
      ],
      productRows: [
        {
          id: "prod_crab",
          title: "鲜活梭子蟹",
          seller_id: "sel_1",
          category_handle: "fresh-crab",
        },
        {
          id: "prod_shrimp",
          title: "皮皮虾",
          seller_id: "sel_1",
          category_handle: "fresh-shrimp",
        },
      ],
    });

    expect(view).toMatchObject({
      source: "seller_products_api",
      filters: {
        query: "梭子蟹",
        market: "三门海鲜市场",
        sellerHandle: "a-hai-xian-huo-dang",
        categoryHandle: "fresh-crab",
      },
      items: [
        {
          id: "prod_crab",
        },
      ],
    });
    expect(view.items).toHaveLength(1);
    expect(view.blockedRuntime).toEqual(
      expect.arrayContaining([
        "inventory_reservation",
        "cart_mutation",
        "order_mutation",
        "fulfillment",
      ])
    );
  });

  it("filters b-side products and falls back only when no product rows are available", () => {
    const bSideOnly = buildChinaProductDiscoveryReadModel({
      productRows: [
        {
          id: "prod_packaging",
          title: "泡沫箱物料",
          sellerName: "物料供应商",
        },
        {
          id: "prod_supplier_hidden",
          title: "本地供给套餐",
          metadata: {
            seller_role: "materials_supplier",
          },
        },
      ],
    });
    const fallback = buildChinaProductDiscoveryReadModel();

    expect(bSideOnly.items).toEqual([]);
    expect(bSideOnly.source).toBe("store_product_table");
    expect(fallback).toMatchObject({
      source: "static_fallback",
      items: [
        {
          id: "fallback_product",
          source: "static_fallback",
        },
      ],
    });
  });
});
