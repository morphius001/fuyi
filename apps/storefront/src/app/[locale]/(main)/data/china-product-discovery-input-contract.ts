export type ChinaProductDiscoverySurface =
  | "home_fresh_products"
  | "search_product_results"
  | "shop_real_products"
  | "shop_reference_products"

export type ChinaProductDiscoverySource =
  | "store_products"
  | "seller_products_api"
  | "adapter_static_read_model"
  | "static_fallback"

export type ChinaProductDiscoveryInputContract = {
  version: "storefront-product-discovery-input-contract-v1"
  readOnly: true
  runtimeEnabled: false
  surfaces: Array<{
    key: ChinaProductDiscoverySurface
    sourceOrder: ChinaProductDiscoverySource[]
    rendersWith:
      | "ProductCard"
      | "adapter_product_card_fields"
      | "adapter_reference_card_fields"
    reservesInventory: false
    mutatesCart: false
    affectsCheckout: false
  }>
  fields: Array<
    | "id"
    | "title"
    | "handle"
    | "sellerId"
    | "sellerName"
    | "market"
    | "booth"
    | "priceText"
    | "specText"
    | "stockText"
    | "source"
  >
  displayRules: Array<{
    key:
      | "consumer_visible_products_only"
      | "real_product_cards_keep_store_api_path"
      | "reference_products_are_display_only"
      | "price_stock_are_not_transaction_facts"
    reason: string
  }>
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
  >
}

export const getChinaProductDiscoveryInputContract =
  (): ChinaProductDiscoveryInputContract => ({
    version: "storefront-product-discovery-input-contract-v1",
    readOnly: true,
    runtimeEnabled: false,
    surfaces: [
      {
        key: "home_fresh_products",
        sourceOrder: ["store_products", "adapter_static_read_model", "static_fallback"],
        rendersWith: "adapter_product_card_fields",
        reservesInventory: false,
        mutatesCart: false,
        affectsCheckout: false,
      },
      {
        key: "search_product_results",
        sourceOrder: ["store_products", "static_fallback"],
        rendersWith: "ProductCard",
        reservesInventory: false,
        mutatesCart: false,
        affectsCheckout: false,
      },
      {
        key: "shop_real_products",
        sourceOrder: ["seller_products_api", "store_products"],
        rendersWith: "ProductCard",
        reservesInventory: false,
        mutatesCart: false,
        affectsCheckout: false,
      },
      {
        key: "shop_reference_products",
        sourceOrder: ["adapter_static_read_model", "static_fallback"],
        rendersWith: "adapter_reference_card_fields",
        reservesInventory: false,
        mutatesCart: false,
        affectsCheckout: false,
      },
    ],
    fields: [
      "id",
      "title",
      "handle",
      "sellerId",
      "sellerName",
      "market",
      "booth",
      "priceText",
      "specText",
      "stockText",
      "source",
    ],
    displayRules: [
      {
        key: "consumer_visible_products_only",
        reason: "消费者页面商品发现默认只展示 C 端可见商品，不把物料、配送或上游供给作为主路径。",
      },
      {
        key: "real_product_cards_keep_store_api_path",
        reason: "真实商品卡继续走 Store API 和 ProductCard，不由 adapter 改写交易事实。",
      },
      {
        key: "reference_products_are_display_only",
        reason: "adapter reference 商品只做店铺或首页展示样例，不创建库存占用、购物车或订单。",
      },
      {
        key: "price_stock_are_not_transaction_facts",
        reason: "priceText 和 stockText 是展示字段，真实价格、库存和配送以商品详情、购物车和结算链路为准。",
      },
    ],
    blockedRuntime: [
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
    ],
  })
