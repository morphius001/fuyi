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

const fallbackProductDiscovery: ChinaProductDiscoveryResponse["product_discovery"] = {
  mode: "fallback_product_discovery",
  source: "storefront_fallback",
  note: "China product discovery API is unavailable; storefront is using an empty read-only fallback.",
  filters: {},
  items: [],
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
    }))
}
