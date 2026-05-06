import {
  findChinaAdminGroupByKey,
  type ChinaAdminMenuGroup,
} from "./china-admin-menu"

export type ChinaAdminSidebarSection = {
  key: string
  groups: ChinaAdminMenuGroup[]
}

const sidebarSectionGroupKeys = [
  {
    key: "platformOps",
    groups: ["operations", "marketing", "messages"],
  },
  {
    key: "merchantGoods",
    groups: ["merchants", "products"],
  },
  {
    key: "tradeFulfillment",
    groups: ["orders", "afterSales", "pickupCards"],
  },
  {
    key: "financeRisk",
    groups: ["payments", "settlements", "risk"],
  },
  {
    key: "system",
    groups: ["system"],
  },
] as const

export const CHINA_ADMIN_SIDEBAR_SECTIONS: ChinaAdminSidebarSection[] =
  sidebarSectionGroupKeys.map((section) => ({
    key: section.key,
    groups: section.groups
      .map((key) => findChinaAdminGroupByKey(key))
      .filter((group): group is ChinaAdminMenuGroup => Boolean(group)),
  }))
