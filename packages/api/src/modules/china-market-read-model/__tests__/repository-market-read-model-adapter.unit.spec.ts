import { ChinaMarketReadModelService } from "../market-read-model-service";
import {
  buildChinaMarketReadModelSeedFromRepository,
  mapChinaMarketRepositoryRowsToSeed,
} from "../repository-market-read-model-adapter";
import { buildChinaVendorMarketContext } from "../vendor-market-context-builder";
import {
  buildInvalidMarketMembershipRepositoryRowsFixture,
  buildMarketMembershipRepositoryRowsFixture,
  marketMembershipFixtureSellerId,
} from "./market-membership-test-fixture";

describe("repository market read model adapter", () => {
  it("maps china market membership tables into the existing read model seed", async () => {
    const seed = await buildChinaMarketReadModelSeedFromRepository({
      listChinaMarketReadRows: async () =>
        buildMarketMembershipRepositoryRowsFixture(),
    });

    const readModel = new ChinaMarketReadModelService(seed);
    const context = buildChinaVendorMarketContext({
      readModel,
      sellerId: marketMembershipFixtureSellerId,
    });

    expect(seed.markets?.[0]).toMatchObject({
      city: "台州",
      metadata: {
        serviceRange: "三门城区测试配送圈",
      },
    });
    expect(seed.memberships?.[0]).toMatchObject({
      boothNo: "A区18号",
      stallName: "测试鲜活一号档",
      metadata: {
        merchantTypeKeys: ["seafood_stall"],
      },
    });
    expect(context).toMatchObject({
      runtimeEnabled: false,
      primaryMembership: {
        stallName: "测试鲜活一号档",
        merchantTypeKeys: ["seafood_stall", "materials_supplier"],
        serviceRange: "三门城区测试配送圈",
      },
      announcements: [
        {
          title: "测试错峰入场",
          severity: "warning",
        },
      ],
      deliveryProfiles: [
        {
          deliveryType: "market_pickup",
          merchantSelectable: false,
          runtimeEnabled: false,
          checkoutImpact: "none",
        },
        {
          deliveryType: "market_unified_delivery",
          merchantSelectable: true,
          runtimeEnabled: false,
          checkoutImpact: "none",
        },
      ],
    });
  });

  it("drops deleted, unknown, and incomplete rows before they reach route builders", () => {
    const seed = mapChinaMarketRepositoryRowsToSeed(
      buildInvalidMarketMembershipRepositoryRowsFixture(),
    );

    expect(seed).toMatchObject({
      markets: [],
      memberships: [],
      roles: [],
      announcements: [],
      businessHours: [],
      deliveryProfiles: [],
    });
  });
});
