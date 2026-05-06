import {
  CreateInventoryLevelInput,
  ExecArgs,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { MercurModules, SellerStatus } from "@mercurjs/types";

type ChinaDemoSeller = {
  id: string;
  handle: string;
  status?: string;
};

type SellerModuleServiceLike = {
  createSellers(data: Record<string, unknown>): Promise<ChinaDemoSeller>;
  listSellers(filters?: Record<string, unknown>): Promise<ChinaDemoSeller[]>;
  updateSellers(data: Record<string, unknown>): Promise<ChinaDemoSeller>;
};

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const pg = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const sellerModuleService = container.resolve(
    MercurModules.SELLER
  ) as SellerModuleServiceLike;
  const storeModuleService = container.resolve(Modules.STORE);
  const createLinkIfMissing = async (
    linkDefinition: Record<string, Record<string, string>>,
    label: string
  ) => {
    try {
      await link.create(linkDefinition as never);
    } catch (error: unknown) {
      const isExistingLinkError =
        error instanceof Error &&
        (error.message.includes("already") ||
          error.message.includes("Cannot create multiple links"));

      if (!isExistingLinkError) {
        throw error;
      }

      logger.info(`${label} already exists, skipping.`);
    }
  };

  const countries = ["cn"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "cny",
          is_default: true,
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  logger.info("Seeding region data...");
  const regionModuleService = container.resolve(Modules.REGION);

  // Check if any of the countries are already assigned to a region
  const existingRegions = await regionModuleService.listRegions({}, {
    relations: ["countries"],
  });

  const assignedCountries = new Set<string>();
  for (const r of existingRegions) {
    for (const c of r.countries || []) {
      assignedCountries.add(c.iso_2);
    }
  }

  const unassignedCountries = countries.filter(c => !assignedCountries.has(c));

  let region;
  if (unassignedCountries.length === 0) {
    // All countries already assigned - find the region that has most of our countries
    region = existingRegions.find(r =>
      r.countries?.some(c => countries.includes(c.iso_2))
    ) || existingRegions[0];
    logger.info("Countries already assigned to a region, skipping region creation.");
  } else if (unassignedCountries.length < countries.length) {
    // Some countries assigned, some not - only create with unassigned ones
    logger.info(`Some countries already assigned, creating region with: ${unassignedCountries.join(", ")}`);
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "China Mainland",
            currency_code: "cny",
            countries: unassignedCountries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  } else {
    // No countries assigned - create full region
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "China Mainland",
            currency_code: "cny",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  const taxModuleService = container.resolve(Modules.TAX);
  const existingTaxRegions = await taxModuleService.listTaxRegions();
  const existingCountryCodes = new Set(existingTaxRegions.map((tr) => tr.country_code));
  const countriesToCreate = countries.filter((c) => !existingCountryCodes.has(c));

  if (countriesToCreate.length > 0) {
    await createTaxRegionsWorkflow(container).run({
      input: countriesToCreate.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  } else {
    logger.info("Tax regions already exist, skipping.");
  }
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);
  const existingStockLocations = await stockLocationModule.listStockLocations({
    name: "European Warehouse",
  });

  let stockLocation;
  if (existingStockLocations.length) {
    stockLocation = existingStockLocations[0];
    logger.info("Stock location 'European Warehouse' already exists, skipping.");
  } else {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "European Warehouse",
            address: {
              city: "Copenhagen",
              country_code: "DK",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  // Link stock location to fulfillment provider (idempotent)
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    });
  } catch (error: unknown) {
    // Ignore if link already exists
    if (!(error instanceof Error && error.message.includes("already exists"))) {
      throw error;
    }
    logger.info("Stock location already linked to fulfillment provider, skipping.");
  }

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "European Warehouse delivery",
  });

  let fulfillmentSet;
  if (existingFulfillmentSets.length) {
    fulfillmentSet = existingFulfillmentSets[0];
    logger.info("Fulfillment set 'European Warehouse delivery' already exists, skipping.");
  } else {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "European Warehouse delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Europe",
          geo_zones: [
            {
              country_code: "gb",
              type: "country",
            },
            {
              country_code: "de",
              type: "country",
            },
            {
              country_code: "dk",
              type: "country",
            },
            {
              country_code: "se",
              type: "country",
            },
            {
              country_code: "fr",
              type: "country",
            },
            {
              country_code: "es",
              type: "country",
            },
            {
              country_code: "it",
              type: "country",
            },
          ],
        },
      ],
    });

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_set_id: fulfillmentSet.id,
        },
      });
    } catch (error: unknown) {
      if (!(error instanceof Error && error.message.includes("already exists"))) {
        throw error;
      }
    }

    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Standard Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Standard",
            description: "Ship in 2-3 days.",
            code: "standard",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 10,
            },
            {
              currency_code: "eur",
              amount: 10,
            },
            {
              region_id: region.id,
              amount: 10,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Express Shipping",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Express",
            description: "Ship in 24 hours.",
            code: "express",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 10,
            },
            {
              currency_code: "eur",
              amount: 10,
            },
            {
              region_id: region.id,
              amount: 10,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  }
  logger.info("Seeding China fulfillment data...");
  const chinaFulfillmentSetName = "China Mainland delivery";
  const existingChinaFulfillmentSets =
    await fulfillmentModuleService.listFulfillmentSets({
      name: chinaFulfillmentSetName,
    });

  let chinaFulfillmentSet = existingChinaFulfillmentSets[0];
  if (!chinaFulfillmentSet) {
    chinaFulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: chinaFulfillmentSetName,
      type: "shipping",
      service_zones: [
        {
          name: "China Mainland",
          geo_zones: [
            {
              country_code: "cn",
              type: "country",
            },
          ],
        },
      ],
    });

    await createLinkIfMissing(
      {
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_set_id: chinaFulfillmentSet.id,
        },
      },
      `Stock location ${stockLocation.id} China fulfillment set link`
    );
  }

  const { data: [chinaFulfillmentSetWithZones] } = await query.graph({
    entity: "fulfillment_set",
    fields: [
      "id",
      "service_zones.id",
      "service_zones.name",
      "service_zones.geo_zones.country_code",
    ],
    filters: { id: chinaFulfillmentSet.id },
  });

  let chinaServiceZoneId =
    chinaFulfillmentSetWithZones?.service_zones?.find((serviceZone) =>
      serviceZone.geo_zones?.some((geoZone) => geoZone.country_code === "cn")
    )?.id ?? chinaFulfillmentSetWithZones?.service_zones?.[0]?.id;

  if (!chinaServiceZoneId) {
    const createdChinaServiceZone = await fulfillmentModuleService.createServiceZones({
      name: "China Mainland",
      fulfillment_set_id: chinaFulfillmentSet.id,
      geo_zones: [
        {
          country_code: "cn",
          type: "country",
        },
      ],
    });
    chinaServiceZoneId = createdChinaServiceZone.id;
  }

  const chinaShippingOptionNames = ["本地统一配送", "档口自行配送"];
  const existingChinaShippingOptions =
    await fulfillmentModuleService.listShippingOptions({
      name: chinaShippingOptionNames,
    });

  if (existingChinaShippingOptions.length < chinaShippingOptionNames.length) {
    const existingNames = new Set(
      existingChinaShippingOptions.map((option) => option.name)
    );
    const chinaShippingOptionsToCreate = [
      {
        name: "本地统一配送",
        price_type: "flat" as const,
        provider_id: "manual_manual",
        service_zone_id: chinaServiceZoneId,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "统一配送",
          description: "市场统一配送 mock 选项",
          code: "local-unified-delivery",
        },
        prices: [
          {
            currency_code: "cny",
            amount: 12,
          },
          {
            region_id: region.id,
            amount: 12,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq" as const,
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq" as const,
          },
        ],
      },
      {
        name: "档口自行配送",
        price_type: "flat" as const,
        provider_id: "manual_manual",
        service_zone_id: chinaServiceZoneId,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "自行配送",
          description: "档口自行配送 mock 选项",
          code: "stall-self-delivery",
        },
        prices: [
          {
            currency_code: "cny",
            amount: 0,
          },
          {
            region_id: region.id,
            amount: 0,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: "true",
            operator: "eq" as const,
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq" as const,
          },
        ],
      },
    ].filter((option) => !existingNames.has(option.name));

    await createShippingOptionsWorkflow(container).run({
      input: chinaShippingOptionsToCreate,
    });
  }
  logger.info("Finished seeding China fulfillment data.");
  logger.info("Finished seeding fulfillment data.");

  // Link sales channel to stock location (idempotent - workflow handles duplicates)
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (error: unknown) {
    // Ignore if link already exists
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
    logger.info("Sales channel already linked to stock location, skipping.");
  }
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Webshop",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult
  }

  // Link sales channel to API key (idempotent)
  try {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (error: unknown) {
    // Ignore if link already exists
    if (!(error instanceof Error && error.message.includes("already"))) {
      throw error;
    }
    logger.info("Sales channel already linked to API key, skipping.");
  }
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding China demo seller data...");
  const demoSellerHandle = "a-hai-xian-huo-dang";
  const legacyDemoSellerHandle = "ahai-seafood-stall";
  const chinaDemoSellerMetadata = {
    market_code: "sanmen-seafood",
    market_name: "三门海鲜市场",
    booth_no: "A区 18号",
    stall_no: "A-018",
    merchant_type: "seafood_stall",
    categories: ["梭子蟹", "皮皮虾", "花蛤", "活明虾"],
    fulfillment_methods: ["市场统一配送", "档口自送", "到店自提"],
    credentials: ["市场认证档口", "营业执照", "档口号已展示", "检测报告"],
    headline: "今日鲜活梭子蟹、皮皮虾、花蛤现货",
    announcement:
      "今日 06:30 开市，梭子蟹午市补货。鲜活商品价格随到货波动，以商家确认和结算页为准。",
    live_enabled: true,
  };
  const existingSellers = await sellerModuleService.listSellers({
    handle: demoSellerHandle,
  });
  const legacyExistingSellers = existingSellers.length
    ? []
    : await sellerModuleService.listSellers({
        handle: legacyDemoSellerHandle,
      });
  const emailExistingSellers =
    existingSellers.length || legacyExistingSellers.length
      ? []
      : await sellerModuleService.listSellers({
          email: "ahai-seafood@fuyi.local",
        });
  let demoSeller =
    existingSellers[0] ?? legacyExistingSellers[0] ?? emailExistingSellers[0];

  if (!demoSeller) {
    demoSeller = await sellerModuleService.createSellers({
      name: "阿海鲜活档",
      handle: demoSellerHandle,
      email: "ahai-seafood@fuyi.local",
      phone: "13800000001",
      description: "三门海鲜市场本地档口示例数据",
      currency_code: "cny",
      status: SellerStatus.OPEN,
      approved_at: new Date(),
      metadata: chinaDemoSellerMetadata,
    });
  } else if (
    demoSeller.handle !== demoSellerHandle ||
    demoSeller.status !== SellerStatus.OPEN
  ) {
    demoSeller = await sellerModuleService.updateSellers({
      id: demoSeller.id,
      handle: demoSellerHandle,
      status: SellerStatus.OPEN,
      approved_at: new Date(),
    });
  }
  await pg("seller").where({ id: demoSeller.id }).update({
    name: "阿海鲜活档",
    description: "三门海鲜市场本地档口示例数据",
    metadata: JSON.stringify(chinaDemoSellerMetadata),
    updated_at: new Date(),
  });
  logger.info("Finished seeding China demo seller data.");

  logger.info("Linking China demo seller to fulfillment data.");
  await createLinkIfMissing(
    {
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [MercurModules.SELLER]: {
        seller_id: demoSeller.id,
      },
    },
    `Stock location ${stockLocation.id} seller link`
  );
  await createLinkIfMissing(
    {
      [MercurModules.SELLER]: {
        seller_id: demoSeller.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: chinaFulfillmentSet.id,
      },
    },
    `Fulfillment set ${chinaFulfillmentSet.id} seller link`
  );
  await createLinkIfMissing(
    {
      [Modules.FULFILLMENT]: {
        shipping_profile_id: shippingProfile.id,
      },
      [MercurModules.SELLER]: {
        seller_id: demoSeller.id,
      },
    },
    `Shipping profile ${shippingProfile.id} seller link`
  );

  const { data: demoShippingOptions } = await query.graph({
    entity: "shipping_option",
    fields: ["id", "service_zone_id"],
    filters: {
      name: chinaShippingOptionNames,
    },
  });
  const serviceZoneIds = new Set<string>(
    demoShippingOptions.map((option) => option.service_zone_id)
  );

  for (const serviceZoneId of serviceZoneIds) {
    await createLinkIfMissing(
      {
        [MercurModules.SELLER]: {
          seller_id: demoSeller.id,
        },
        [Modules.FULFILLMENT]: {
          service_zone_id: serviceZoneId,
        },
      },
      `Service zone ${serviceZoneId} seller link`
    );
  }

  for (const shippingOption of demoShippingOptions) {
    await createLinkIfMissing(
      {
        [Modules.FULFILLMENT]: {
          shipping_option_id: shippingOption.id,
        },
        [MercurModules.SELLER]: {
          seller_id: demoSeller.id,
        },
      },
      `Shipping option ${shippingOption.id} seller link`
    );
  }
  logger.info("Finished linking China demo seller fulfillment data.");

  logger.info("Seeding product data...");

  const productCategoryModule = container.resolve(Modules.PRODUCT);
  const chinaCategoryDefinitions = [
    {
      legacyName: "Shirts",
      name: "鲜活蟹类",
      handle: "shirts",
      description: "梭子蟹、青蟹等鲜活蟹类示例类目。",
    },
    {
      legacyName: "Sweatshirts",
      name: "鲜活虾类",
      handle: "sweatshirts",
      description: "皮皮虾、明虾等鲜活虾类示例类目。",
    },
    {
      legacyName: "Pants",
      name: "冰鲜鱼类",
      handle: "pants",
      description: "小黄鱼、带鱼等冰鲜鱼类示例类目。",
    },
    {
      legacyName: "Merch",
      name: "贝类净养",
      handle: "merch",
      description: "花蛤、蛏子等净养贝类示例类目。",
    },
  ];
  const duplicateChinaCategoryHandles = [
    "xian-huo-xie-lei",
    "xian-huo-xia-lei",
    "bing-xian-yu-lei",
    "bei-lei-jing-yang",
  ];
  await pg("product_category")
    .whereNull("deleted_at")
    .whereIn("handle", duplicateChinaCategoryHandles)
    .update({
      is_active: false,
      updated_at: new Date(),
    });

  const existingCategories = await pg("product_category")
    .whereNull("deleted_at")
    .whereIn(
      "handle",
      chinaCategoryDefinitions.map((category) => category.handle)
    )
    .select("id", "handle", "name");

  let categoryResult;
  if (
    chinaCategoryDefinitions.every((category) =>
      existingCategories.find(
        (existingCategory) =>
          existingCategory.handle === category.handle
      )
    )
  ) {
    categoryResult = existingCategories;
    logger.info("Product categories already exist, skipping.");
  } else {
    const categoriesToCreate = chinaCategoryDefinitions.filter(
      (category) =>
        !existingCategories.find(
          (existingCategory) => existingCategory.handle === category.handle
        )
    );
    const { result: newCategories } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: categoriesToCreate.map((category) => ({
          name: category.name,
          handle: category.handle,
          description: category.description,
          is_active: true,
        })),
      },
    });
    categoryResult = [...existingCategories, ...newCategories];
  }

  const chinaCategoryIdByLegacyName = new Map<string, string>();
  for (const category of chinaCategoryDefinitions) {
    const matchingCategory = categoryResult.find(
      (existingCategory: { id: string; handle?: string; name: string }) =>
        existingCategory.handle === category.handle ||
        existingCategory.name === category.legacyName ||
        existingCategory.name === category.name
    );

    if (!matchingCategory) {
      throw new Error(`Missing China demo category ${category.name}`);
    }

    chinaCategoryIdByLegacyName.set(category.legacyName, matchingCategory.id);

    await pg("product_category").where({ id: matchingCategory.id }).update({
      name: category.name,
      handle: category.handle,
      description: category.description,
      is_active: true,
      updated_at: new Date(),
    });
  }

  const getChinaCategoryId = (legacyName: string) => {
    const categoryId = chinaCategoryIdByLegacyName.get(legacyName);

    if (!categoryId) {
      throw new Error(`Missing China demo category id for ${legacyName}`);
    }

    return categoryId;
  };

  const productHandles = ["t-shirt", "sweatshirt", "sweatpants", "shorts"];
  const chinaDemoProductsByHandle: Record<
    string,
    {
      title: string;
      description: string;
      amount: number;
    }
  > = {
    "t-shirt": {
      title: "鲜活梭子蟹",
      description:
        "三门海鲜市场阿海鲜活档示例商品。规格、重量和库存以商家确认以及结算页为准。",
      amount: 68,
    },
    sweatshirt: {
      title: "皮皮虾",
      description:
        "本地鲜活皮皮虾示例商品，适合到店自提或商家确认后同城配送。",
      amount: 48,
    },
    sweatpants: {
      title: "东海小黄鱼",
      description:
        "冰鲜小黄鱼示例商品，冷链履约、称重和库存以后续商家确认为准。",
      amount: 39,
    },
    shorts: {
      title: "花蛤净养装",
      description:
        "净养吐沙花蛤示例商品，适合本地即时采购和档口自提。",
      amount: 12,
    },
  };
  const existingProducts = await productCategoryModule.listProducts({
    handle: productHandles,
  });

  if (existingProducts.length === productHandles.length) {
    logger.info("Products already exist, skipping.");
  } else {
    await createProductsWorkflow(container).run({
      input: {
        additional_data: {
          seller_id: demoSeller.id,
        },
        products: [
          {
            title: "Medusa T-Shirt",
            category_ids: [
              getChinaCategoryId("Shirts"),
            ],
            description:
              "Reimagine the feeling of a classic T-shirt. With our cotton T-shirts, everyday essentials no longer have to be ordinary.",
            handle: "t-shirt",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-black-back.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/tee-white-back.png",
              },
            ],
            options: [
              {
                title: "Size",
                values: ["S", "M", "L", "XL"],
              },
              {
                title: "Color",
                values: ["Black", "White"],
              },
            ],
            variants: [
              {
                title: "S / Black",
                sku: "SHIRT-S-BLACK",
                options: {
                  Size: "S",
                  Color: "Black",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "S / White",
                sku: "SHIRT-S-WHITE",
                options: {
                  Size: "S",
                  Color: "White",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "M / Black",
                sku: "SHIRT-M-BLACK",
                options: {
                  Size: "M",
                  Color: "Black",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "M / White",
                sku: "SHIRT-M-WHITE",
                options: {
                  Size: "M",
                  Color: "White",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "L / Black",
                sku: "SHIRT-L-BLACK",
                options: {
                  Size: "L",
                  Color: "Black",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "L / White",
                sku: "SHIRT-L-WHITE",
                options: {
                  Size: "L",
                  Color: "White",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "XL / Black",
                sku: "SHIRT-XL-BLACK",
                options: {
                  Size: "XL",
                  Color: "Black",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "XL / White",
                sku: "SHIRT-XL-WHITE",
                options: {
                  Size: "XL",
                  Color: "White",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "Medusa Sweatshirt",
            category_ids: [
              getChinaCategoryId("Sweatshirts"),
            ],
            description:
              "Reimagine the feeling of a classic sweatshirt. With our cotton sweatshirt, everyday essentials no longer have to be ordinary.",
            handle: "sweatshirt",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatshirt-vintage-back.png",
              },
            ],
            options: [
              {
                title: "Size",
                values: ["S", "M", "L", "XL"],
              },
            ],
            variants: [
              {
                title: "S",
                sku: "SWEATSHIRT-S",
                options: {
                  Size: "S",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "M",
                sku: "SWEATSHIRT-M",
                options: {
                  Size: "M",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "L",
                sku: "SWEATSHIRT-L",
                options: {
                  Size: "L",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "XL",
                sku: "SWEATSHIRT-XL",
                options: {
                  Size: "XL",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "Medusa Sweatpants",
            category_ids: [
              getChinaCategoryId("Pants"),
            ],
            description:
              "Reimagine the feeling of classic sweatpants. With our cotton sweatpants, everyday essentials no longer have to be ordinary.",
            handle: "sweatpants",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/sweatpants-gray-back.png",
              },
            ],
            options: [
              {
                title: "Size",
                values: ["S", "M", "L", "XL"],
              },
            ],
            variants: [
              {
                title: "S",
                sku: "SWEATPANTS-S",
                options: {
                  Size: "S",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "M",
                sku: "SWEATPANTS-M",
                options: {
                  Size: "M",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "L",
                sku: "SWEATPANTS-L",
                options: {
                  Size: "L",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "XL",
                sku: "SWEATPANTS-XL",
                options: {
                  Size: "XL",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
          {
            title: "Medusa Shorts",
            category_ids: [
              getChinaCategoryId("Merch"),
            ],
            description:
              "Reimagine the feeling of classic shorts. With our cotton shorts, everyday essentials no longer have to be ordinary.",
            handle: "shorts",
            weight: 400,
            status: ProductStatus.PUBLISHED,
            shipping_profile_id: shippingProfile.id,
            images: [
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-front.png",
              },
              {
                url: "https://medusa-public-images.s3.eu-west-1.amazonaws.com/shorts-vintage-back.png",
              },
            ],
            options: [
              {
                title: "Size",
                values: ["S", "M", "L", "XL"],
              },
            ],
            variants: [
              {
                title: "S",
                sku: "SHORTS-S",
                options: {
                  Size: "S",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "M",
                sku: "SHORTS-M",
                options: {
                  Size: "M",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "L",
                sku: "SHORTS-L",
                options: {
                  Size: "L",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
              {
                title: "XL",
                sku: "SHORTS-XL",
                options: {
                  Size: "XL",
                },
                prices: [
                  {
                    amount: 10,
                    currency_code: "eur",
                  },
                  {
                    amount: 15,
                    currency_code: "usd",
                  },
                ],
              },
            ],
            sales_channels: [
              {
                id: defaultSalesChannel[0].id,
              },
            ],
          },
        ],
      },
    });
  }
  logger.info("Finished seeding product data.");

  const { data: seededProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: {
      handle: productHandles,
    },
  });

  const chinaDemoProductUpdates = seededProducts.flatMap((product) => {
    const productHandle =
      typeof product.handle === "string" ? product.handle : "";
    const demoProduct = chinaDemoProductsByHandle[productHandle];

    if (!demoProduct || typeof product.id !== "string") {
      return [];
    }

    return [
      {
        id: product.id,
        title: demoProduct.title,
        description: demoProduct.description,
        images: [
          {
            url: "/images/local-market/seafood-market-hero.png",
          },
        ],
        thumbnail: "/images/local-market/seafood-market-hero.png",
        shipping_profile_id: shippingProfile.id,
        status: ProductStatus.PUBLISHED,
        sales_channels: [
          {
            id: defaultSalesChannel[0].id,
          },
        ],
      },
    ];
  });

  if (chinaDemoProductUpdates.length) {
    await updateProductsWorkflow(container).run({
      input: {
        products: chinaDemoProductUpdates,
        additional_data: {
          seller_id: demoSeller.id,
        },
      },
    });
  }

  logger.info("Linking seeded products to China demo seller.");
  for (const product of seededProducts) {
    await createLinkIfMissing(
      {
        [Modules.PRODUCT]: {
          product_id: product.id,
        },
        [MercurModules.SELLER]: {
          seller_id: demoSeller.id,
        },
      },
      `Product ${product.id} seller link`
    );
  }

  logger.info("Ensuring seeded product variants have CNY prices.");
  const productHandleById = new Map<string, string>(
    seededProducts.flatMap((product) => {
      if (typeof product.id !== "string" || typeof product.handle !== "string") {
        return [];
      }

      return [[product.id, product.handle]];
    })
  );
  const { data: seededVariants } = await query.graph({
    entity: "variant",
    fields: ["id", "product_id"],
    filters: {
      product_id: seededProducts.map((product) => product.id),
    },
  });

  if (seededVariants.length) {
    await updateProductVariantsWorkflow(container).run({
      input: {
        product_variants: seededVariants.map((variant) => ({
          id: variant.id,
          prices: [
            {
              amount:
                chinaDemoProductsByHandle[
                  productHandleById.get(
                    typeof variant.product_id === "string" ? variant.product_id : ""
                  ) ?? ""
                ]?.amount ?? 68,
              currency_code: "cny",
            },
            {
              amount: 10,
              currency_code: "eur",
            },
            {
              amount: 15,
              currency_code: "usd",
            },
          ],
        })),
        additional_data: {
          seller_id: demoSeller.id,
        },
      },
    });
  }

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  logger.info("Linking seeded inventory items to China demo seller.");
  for (const inventoryItem of inventoryItems) {
    await createLinkIfMissing(
      {
        [Modules.INVENTORY]: {
          inventory_item_id: inventoryItem.id,
        },
        [MercurModules.SELLER]: {
          seller_id: demoSeller.id,
        },
      },
      `Inventory item ${inventoryItem.id} seller link`
    );
  }

  const inventoryModule = container.resolve(Modules.INVENTORY);
  const existingLevels = await inventoryModule.listInventoryLevels({
    location_id: stockLocation.id,
  });
  const existingItemIds = new Set(existingLevels.map((l) => l.inventory_item_id));

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    if (!existingItemIds.has(inventoryItem.id)) {
      const inventoryLevel = {
        location_id: stockLocation.
          id,
        stocked_quantity: 1000000,
        inventory_item_id: inventoryItem.id,
      };
      inventoryLevels.push(inventoryLevel);
    }
  }

  if (inventoryLevels.length > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: inventoryLevels,
      },
    });
  } else {
    logger.info("Inventory levels already exist, skipping.");
  }

  logger.info("Finished seeding inventory levels data.");
}
