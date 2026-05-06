import { MedusaError } from "@medusajs/framework/utils";

import {
  buildVendorMarketContextFromRepositoryRows,
  buildVendorMarketContextFromSellerRows,
  resolveVendorMarketContextSellerId,
} from "../helpers";

describe("vendor market context route helpers", () => {
  it("resolves seller id from seller_context only", () => {
    expect(
      resolveVendorMarketContextSellerId({
        seller_context: {
          seller_id: "sel_1",
        },
      }),
    ).toBe("sel_1");
  });

  it("rejects requests without vendor seller context", () => {
    expect(() => resolveVendorMarketContextSellerId({})).toThrow(MedusaError);
  });

  it("builds context only for the authenticated seller row", () => {
    const context = buildVendorMarketContextFromSellerRows({
      sellerId: "sel_1",
      sellers: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "A区18号",
            category_summary: "鲜活蟹类",
          },
        },
        {
          id: "sel_2",
          handle: "other",
          name: "其它商户",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "C区01号",
          },
        },
      ],
    });

    expect(context).toMatchObject({
      sellerId: "sel_1",
      sellerHandle: "a-hai-xian-huo-dang",
      runtimeEnabled: false,
      memberships: [
        {
          boothNo: "A区18号",
        },
      ],
    });
    expect(context.memberships).toHaveLength(1);
  });

  it("returns empty context for seller-owned market filters without membership", () => {
    const context = buildVendorMarketContextFromSellerRows({
      sellerId: "sel_1",
      marketId: "market_missing",
      sellers: [
        {
          id: "sel_1",
          handle: "a-hai-xian-huo-dang",
          name: "阿海鲜活档",
          metadata: {
            market_name: "三门海鲜市场",
            booth_no: "A区18号",
          },
        },
      ],
    });

    expect(context).toMatchObject({
      mode: "vendor_market_context_empty",
      sellerId: "sel_1",
      runtimeEnabled: false,
      memberships: [],
      deliveryProfiles: [],
    });
  });

  it("prefers repository rows when they contain current seller membership", async () => {
    const result = await buildVendorMarketContextFromRepositoryRows({
      sellerId: "sel_1",
      seller: {
        id: "sel_1",
        handle: "a-hai-xian-huo-dang",
        name: "阿海鲜活档",
      },
      rows: {
        markets: [
          {
            id: "market_sanmen",
            name: "三门海鲜市场",
            slug: "sanmen-seafood-market",
            city: "台州",
            status: "open",
          },
        ],
        memberships: [
          {
            id: "membership_1",
            market_id: "market_sanmen",
            seller_id: "sel_1",
            seller_handle: "a-hai-xian-huo-dang",
            seller_name: "阿海鲜活档",
            booth_no: "A区18号",
            stall_name: "阿海一号档",
            is_primary: true,
            status: "open",
          },
        ],
        roles: [
          {
            id: "role_1",
            seller_id: "sel_1",
            market_id: "market_sanmen",
            role_key: "seafood_stall",
            status: "active",
          },
        ],
        deliveryProfiles: [
          {
            id: "delivery_1",
            market_id: "market_sanmen",
            delivery_type: "market_unified_delivery",
            enabled: true,
            display_name: "市场统一配送",
            merchant_selectable: true,
          },
        ],
      },
    });

    expect(result).toMatchObject({
      dataSource: "repository",
      marketContext: {
        sellerId: "sel_1",
        runtimeEnabled: false,
        primaryMembership: {
          stallName: "阿海一号档",
          merchantTypeKeys: ["seafood_stall"],
        },
        deliveryProfiles: [
          {
            runtimeEnabled: false,
            checkoutImpact: "none",
          },
        ],
      },
    });
  });

  it("falls back to seller metadata when repository rows are unavailable for the seller", async () => {
    const result = await buildVendorMarketContextFromRepositoryRows({
      sellerId: "sel_1",
      seller: {
        id: "sel_1",
        handle: "a-hai-xian-huo-dang",
        name: "阿海鲜活档",
        metadata: {
          market_name: "三门海鲜市场",
          booth_no: "A区18号",
        },
      },
      rows: {
        markets: [],
        memberships: [],
      },
    });

    expect(result).toMatchObject({
      dataSource: "static_fallback",
      marketContext: {
        sellerId: "sel_1",
        memberships: [
          {
            boothNo: "A区18号",
          },
        ],
        runtimeEnabled: false,
      },
    });
  });
});
