import { NavLink, useLocation } from "react-router-dom"
import { Badge, Divider, Text, clx } from "@medusajs/ui"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import { CHINA_ADMIN_HOME } from "../lib/china-admin-menu"
import { CHINA_ADMIN_SIDEBAR_SECTIONS } from "../lib/china-admin-sidebar-sections"

const linkClassName = (active: boolean) =>
  clx(
    "flex min-h-7 items-center gap-x-2 rounded-md px-2 py-1 text-ui-fg-subtle outline-none transition-fg",
    "hover:bg-ui-bg-subtle-hover hover:text-ui-fg-base focus-visible:shadow-borders-focus",
    {
      "bg-ui-bg-base text-ui-fg-base shadow-elevation-card-rest": active,
    },
  )

const ChinaAdminSidebar = () => {
  const { t } = useChinaAdminTranslation()
  const { pathname } = useLocation()
  const HomeIcon = CHINA_ADMIN_HOME.icon

  return (
    <aside className="flex flex-1 flex-col overflow-y-auto" data-testid="china-admin-sidebar">
      <div className="sticky top-0 z-10 bg-ui-bg-subtle px-3 pb-3 pt-3">
        <div className="rounded-md bg-ui-bg-base px-3 py-2 shadow-borders-base">
          <Text size="small" weight="plus" leading="compact">
            {t("chinaAdmin.app.title")}
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {t("chinaAdmin.app.subtitle")}
          </Text>
        </div>
      </div>

      <div className="px-3">
        <Divider variant="dashed" />
      </div>

      <nav className="flex flex-col gap-y-3 px-3 py-3" aria-label={t("chinaAdmin.nav.ariaLabel")}>
        <NavLink to={CHINA_ADMIN_HOME.path} end className={({ isActive }) => linkClassName(isActive)}>
          <HomeIcon className="text-ui-fg-subtle" />
          <Text size="small" weight="plus" leading="compact">
            {t(CHINA_ADMIN_HOME.labelKey)}
          </Text>
        </NavLink>

        {CHINA_ADMIN_SIDEBAR_SECTIONS.map((section) => (
          <section key={section.key} className="flex flex-col gap-y-1">
            <div className="px-2 py-1">
              <Text size="xsmall" weight="plus" className="text-ui-fg-muted" leading="compact">
                {t(`chinaAdmin.nav.sections.${section.key}`)}
              </Text>
            </div>

            {section.groups.map((group) => {
              const Icon = group.icon
              const isActive = group.items.some((item) => pathname.startsWith(item.path))
              const groupHomePath = group.items[0]?.path ?? CHINA_ADMIN_HOME.path

              return (
                <div key={group.key} className="flex flex-col gap-y-0.5">
                  <NavLink to={groupHomePath} className={() => linkClassName(isActive)}>
                    <Icon className="text-ui-fg-subtle" />
                    <Text size="small" weight="plus" leading="compact">
                      {t(group.labelKey)}
                    </Text>
                    <span className="ml-auto">
                      <Badge size="2xsmall">{group.items.length}</Badge>
                    </span>
                  </NavLink>

                  {isActive ? (
                    <div className="flex flex-col gap-y-0.5">
                      {group.items.map((item) => (
                        <NavLink
                          key={item.key}
                          to={item.path}
                          className={({ isActive: itemActive }) =>
                            clx(linkClassName(itemActive), "pl-8")
                          }
                        >
                          <Text size="small" leading="compact">
                            {t(item.labelKey)}
                          </Text>
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </section>
        ))}
      </nav>
    </aside>
  )
}

export default ChinaAdminSidebar
