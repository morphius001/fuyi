"use server"

import { sdk } from "../config"

type ChinaSellerProductsResponse = {
  seller: {
    id: string
    handle: string
    name: string
    status: string
    metadata?: Record<string, unknown>
  }
  product_ids: string[]
}

export const retrieveChinaSeller = async (handle: string) => {
  return sdk.client
    .fetch<ChinaSellerProductsResponse>(
      `/store/china/sellers/${encodeURIComponent(handle)}/products`,
      {
        method: "GET",
        cache: "no-cache",
      }
    )
    .catch(() => null)
}

export const retrieveChinaSellerProductIds = async (handle: string) => {
  return retrieveChinaSeller(handle).then((response) => response?.product_ids ?? [])
}
