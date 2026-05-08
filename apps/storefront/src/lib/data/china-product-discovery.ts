"use server"

import { sdk } from "../config"

export type ChinaProductDiscoveryItem = {
  id: string
  title: string
  handle?: string
  sellerId?: string
  sellerHandle?: string
  sellerName?: string
  market?: string
  booth?: string
  priceText?: string
  specText?: string
  stockText?: string
  source: "store_product_table" | "static_fallback"
}

export type ChinaProductDiscoveryResponse = {
  product_discovery: {
    mode: "read_only_product_discovery" | "fallback_product_discovery"
    source: "store_product_table" | "seller_products_api" | "static_fallback" | "storefront_fallback"
    note: string
    filters: {
      query?: string
      market?: string
      sellerHandle?: string
      categoryHandle?: string
    }
    items: ChinaProductDiscoveryItem[]
    sourceTags: {
      responseSource: "store_product_table" | "seller_products_api" | "static_fallback" | "storefront_fallback"
      itemCount: number
      productRowCount: number
      sellerContextCount: number
      fallbackUsed: boolean
      fallbackReason?: "no_product_rows" | "client_fetch_failed"
      filterKeysPresent: Array<"query" | "market" | "sellerHandle" | "categoryHandle">
      displayOnly: true
    }
    readOnly: true
    runtimeEnabled: false
    canWriteBusinessState: false
    blockedRuntime: string[]
  }
}

export type RetrieveChinaProductDiscoveryInput = {
  query?: string
  market?: string
  sellerHandle?: string
  categoryHandle?: string
  limit?: number
}

const getPresentFilterKeys = ({
  query,
  market,
  sellerHandle,
  categoryHandle,
}: RetrieveChinaProductDiscoveryInput) =>
  [
    query ? "query" : undefined,
    market ? "market" : undefined,
    sellerHandle ? "sellerHandle" : undefined,
    categoryHandle ? "categoryHandle" : undefined,
  ].filter(
    (
      key
    ): key is "query" | "market" | "sellerHandle" | "categoryHandle" =>
      Boolean(key)
  )

const fallbackProductDiscovery: ChinaProductDiscoveryResponse["product_discovery"] = {
  mode: "fallback_product_discovery",
  source: "storefront_fallback",
  note: "China product discovery API is unavailable; storefront is using an empty read-only fallback.",
  filters: {},
  items: [],
  sourceTags: {
    responseSource: "storefront_fallback",
    itemCount: 0,
    productRowCount: 0,
    sellerContextCount: 0,
    fallbackUsed: true,
    fallbackReason: "client_fetch_failed",
    filterKeysPresent: [],
    displayOnly: true,
  },
  readOnly: true,
  runtimeEnabled: false,
  canWriteBusinessState: false,
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
  ],
}

export const retrieveChinaProductDiscovery = async ({
  query,
  market,
  sellerHandle,
  categoryHandle,
  limit,
}: RetrieveChinaProductDiscoveryInput = {}) => {
  return sdk.client
    .fetch<ChinaProductDiscoveryResponse>("/store/china/product-discovery", {
      method: "GET",
      query: {
        q: query,
        market,
        seller_handle: sellerHandle,
        category_handle: categoryHandle,
        limit,
      },
      cache: "no-cache",
    })
    .then((response) => response.product_discovery)
    .catch(() => ({
      ...fallbackProductDiscovery,
      filters: {
        query,
        market,
        sellerHandle,
        categoryHandle,
      },
      sourceTags: {
        ...fallbackProductDiscovery.sourceTags,
        filterKeysPresent: getPresentFilterKeys({
          query,
          market,
          sellerHandle,
          categoryHandle,
        }),
      },
    }))
}
