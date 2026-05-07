import { MedusaError } from "@medusajs/framework/utils";

import {
  buildVendorMarketContextFromRepositoryRows,
  buildVendorMarketContextFromSellerRows,
  resolveVendorMarketContextSellerId,
} from "../helpers";
import {
  buildMarketMembershipRepositoryRowsFixture,
  marketMembershipFixtureSellerHandle,
  marketMembershipFixtureSellerId,
} from "../../../../../modules/china-market-read-model/__tests__/market-membership-test-fixture";

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
      sellerId: marketMembershipFixtureSellerId,
      seller: {
        id: marketMembershipFixtureSellerId,
        handle: marketMembershipFixtureSellerHandle,
        name: "测试鲜活档",
      },
      rows: buildMarketMembershipRepositoryRowsFixture(),
    });

    expect(result).toMatchObject({
      dataSource: "repository",
      marketContext: {
        sellerId: marketMembershipFixtureSellerId,
        runtimeEnabled: false,
        primaryMembership: {
          stallName: "测试鲜活一号档",
          merchantTypeKeys: ["seafood_stall", "materials_supplier"],
        },
        deliveryProfiles: expect.arrayContaining([
          expect.objectContaining({
            deliveryType: "market_unified_delivery",
            merchantSelectable: true,
            runtimeEnabled: false,
            checkoutImpact: "none",
          }),
        ]),
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
