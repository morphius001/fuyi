import { Container, Heading, StatusBadge, Switch, Text } from "@medusajs/ui"

import { useChinaAdminTranslation } from "../../i18n/use-china-admin-translation"
import { statusColorByStatus, type OperationStatus } from "./operationsData"

export const TranslatedStatus = ({ status }: { status: OperationStatus }) => {
  const { t } = useChinaAdminTranslation()

  return (
    <StatusBadge color={statusColorByStatus[status]}>
      {t(`chinaAdmin.operations.status.${status}`)}
    </StatusBadge>
  )
}

type MockNoticeProps = {
  titleKey?: string
  messageKey?: string
}

export const MockNotice = ({
  titleKey = "chinaAdmin.operations.mockNotice.title",
  messageKey = "chinaAdmin.operations.mockNotice.message",
}: MockNoticeProps) => {
  const { t } = useChinaAdminTranslation()

  return (
    <Container className="p-0">
      <div className="flex flex-col gap-y-1 px-4 py-3">
        <Heading level="h2">{t(titleKey)}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t(messageKey)}
        </Text>
      </div>
    </Container>
  )
}

export const ReadonlySwitchState = ({ checked, label }: { checked: boolean; label: string }) => {
  const { t } = useChinaAdminTranslation()

  return (
    <div className="flex min-w-max items-center gap-x-2">
      <Switch size="small" checked={checked} disabled aria-label={label} />
      <Text size="xsmall" className="text-ui-fg-muted">
        {t("chinaAdmin.operations.switchPreview.readonly")}
      </Text>
    </div>
  )
}
