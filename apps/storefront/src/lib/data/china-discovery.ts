"use server"

import { sdk } from "../config"

export type ChinaDiscoverySeller = {
  id: string
  handle: string
  name: string
  market: string
  booth: string
  tags: string[]
  summary: string
  source: string
}

export type ChinaDiscoveryMarket = {
  name: string
  city: string
  hours: string
  notice: string
  delivery: string
  source: string
}

export type ChinaDiscoveryCategory = {
  id: string
  handle: string
  name: string
  description: string
  count: string
  source: string
}

type ChinaDiscoveryResponse = {
  discovery: {
    mode: string
    source: string
    note: string
    sellers: ChinaDiscoverySeller[]
    markets: ChinaDiscoveryMarket[]
    categories: ChinaDiscoveryCategory[]
  }
}

export const retrieveChinaDiscovery = async () => {
  return sdk.client
    .fetch<ChinaDiscoveryResponse>("/store/china/discovery", {
      method: "GET",
      cache: "no-cache",
    })
    .then((response) => response.discovery)
    .catch(() => ({
      mode: "fallback_static_discovery",
      source: "storefront_fallback",
      note: "China discovery API is unavailable; storefront is showing local fallback labels.",
      sellers: [],
      markets: [],
      categories: [],
    }))
}
