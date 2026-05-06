import type { ReactNode } from "react"
import { BellAlert, ChatBubbleLeftRight, MagnifyingGlass, User } from "@medusajs/icons"
import { Badge, Button, Container, Heading, Text } from "@medusajs/ui"
import { useLocation } from "react-router-dom"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import type { ChinaAdminPageMeta } from "../lib/china-admin-menu"
import { CHINA_ADMIN_MENU } from "../lib/china-admin-menu"

type ChinaAdminShellProps = {
  titleKey: string
  descriptionKey: string
  page?: ChinaAdminPageMeta
  actions?: ReactNode
  children: ReactNode
}

const findGroupLabelKey = (page?: ChinaAdminPageMeta) => {
  if (!page) {
    return undefined
  }

  return CHINA_ADMIN_MENU.find((group) =>
    group.items.some((item) => item.path === page.path),
  )?.labelKey
}

const ChinaAdminShell = ({
  titleKey,
  descriptionKey,
  page,
  actions,
  children,
}: ChinaAdminShellProps) => {
  const { t } = useChinaAdminTranslation()
  const { pathname } = useLocation()
  const groupLabelKey = findGroupLabelKey(page)

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="p-0">
        <div className="china-admin-shell-header gap-3 px-4 py-3">
          <div className="flex flex-col gap-y-1">
            <Text size="xsmall" className="text-ui-fg-muted">
              {t("chinaAdmin.shell.platformName")}
            </Text>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <Heading level="h1">{t(titleKey)}</Heading>
              <Badge size="2xsmall">{t("chinaAdmin.shell.phaseBadge")}</Badge>
            </div>
            <Text size="small" className="text-ui-fg-subtle">
              {t(descriptionKey)}
            </Text>
          </div>

          <div className="china-admin-shell-tools flex flex-wrap items-center gap-2">
            <button
              className="flex h-8 min-w-[260px] items-center gap-x-2 rounded-md bg-ui-bg-subtle px-3 text-ui-fg-subtle shadow-borders-base"
              disabled
              title={t("chinaAdmin.actions.readonlyAction")}
              type="button"
            >
              <MagnifyingGlass />
              <Text size="small">{t("chinaAdmin.shell.searchPlaceholder")}</Text>
            </button>
            <Button size="small" variant="secondary" disabled title={t("chinaAdmin.actions.readonlyAction")}>
              <BellAlert />
              {t("chinaAdmin.shell.todo")}
            </Button>
            <Button size="small" variant="secondary" disabled title={t("chinaAdmin.actions.readonlyAction")}>
              <ChatBubbleLeftRight />
              {t("chinaAdmin.shell.messages")}
            </Button>
            <Button size="small" variant="secondary" disabled title={t("chinaAdmin.actions.readonlyAction")}>
              <User />
              {t("chinaAdmin.shell.admin")}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Text size="small" className="text-ui-fg-muted">
              {t("chinaAdmin.shell.location")}
            </Text>
            <Text size="small" weight="plus">
              {t("chinaAdmin.nav.home")}
            </Text>
            {groupLabelKey ? (
              <>
                <Text size="small" className="text-ui-fg-muted">
                  /
                </Text>
                <Text size="small" weight="plus">
                  {t(groupLabelKey)}
                </Text>
              </>
            ) : null}
            {page ? (
              <>
                <Text size="small" className="text-ui-fg-muted">
                  /
                </Text>
                <Text size="small" weight="plus">
                  {t(page.labelKey)}
                </Text>
              </>
            ) : null}
            <Text size="xsmall" className="text-ui-fg-muted">
              {pathname}
            </Text>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {actions ?? (
              <>
                <Button size="small" variant="secondary" disabled title={t("chinaAdmin.actions.readonlyAction")}>
                  {t("chinaAdmin.actions.export")}
                </Button>
                <Button size="small" variant="primary" disabled title={t("chinaAdmin.actions.readonlyAction")}>
                  {t("chinaAdmin.actions.createPlaceholder")}
                </Button>
              </>
            )}
          </div>
        </div>
      </Container>

      {children}
    </div>
  )
}

export default ChinaAdminShell
