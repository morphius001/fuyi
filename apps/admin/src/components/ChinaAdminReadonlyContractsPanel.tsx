import { Badge, Button, Container, Heading, StatusBadge, Table, Text } from "@medusajs/ui"

import { useChinaAdminTranslation } from "../i18n/use-china-admin-translation"
import type { ChinaAdminPageMeta } from "../lib/china-admin-menu"
import {
  readonlyContractGroups,
  readonlyContractSummaryCards,
  type ChinaReadonlyContractStatus,
} from "../lib/china-admin-readonly-contracts"
import ChinaAdminShell from "./ChinaAdminShell"

type ChinaAdminReadonlyContractsPanelProps = {
  page: ChinaAdminPageMeta
}

const statusColorByReadonlyContractStatus: Record<
  ChinaReadonlyContractStatus,
  "green" | "grey" | "blue" | "orange" | "red"
> = {
  readOnly: "blue",
  displayOnly: "green",
  designOnly: "orange",
  blocked: "red",
}

const ChinaAdminReadonlyContractsPanel = ({
  page,
}: ChinaAdminReadonlyContractsPanelProps) => {
  const { t } = useChinaAdminTranslation()

  return (
    <ChinaAdminShell
      titleKey={page.labelKey}
      descriptionKey={page.descriptionKey}
      page={page}
      actions={
        <>
          <Button size="small" variant="secondary" disabled>
            {t("chinaAdmin.readonlyContracts.actions.exportDisabled")}
          </Button>
          <Button size="small" variant="primary" disabled>
            {t("chinaAdmin.readonlyContracts.actions.readonly")}
          </Button>
        </>
      }
    >
      <Container className="p-0">
        <div className="flex flex-col gap-y-1 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Heading level="h2">{t("chinaAdmin.readonlyContracts.boundary.title")}</Heading>
            <Badge size="2xsmall">{t("chinaAdmin.readonlyContracts.boundary.badge")}</Badge>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.readonlyContracts.boundary.description")}
          </Text>
        </div>
      </Container>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {readonlyContractSummaryCards.map((card) => (
          <Container key={card.key} className="p-0">
            <div className="flex h-full flex-col gap-y-3 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-y-1">
                  <Text size="small" weight="plus">
                    {t(`chinaAdmin.readonlyContracts.summary.${card.key}.title`)}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {t(`chinaAdmin.readonlyContracts.summary.${card.key}.description`)}
                  </Text>
                </div>
                <StatusBadge color={statusColorByReadonlyContractStatus[card.status]}>
                  {t(`chinaAdmin.readonlyContracts.status.${card.status}`)}
                </StatusBadge>
              </div>
              <Heading level="h2">{card.value}</Heading>
            </div>
          </Container>
        ))}
      </div>

      <div className="grid gap-3">
        {readonlyContractGroups.map((group) => (
          <Container key={group.key} className="divide-y p-0">
            <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 flex-col gap-y-1">
                <Heading level="h2">
                  {t(`chinaAdmin.readonlyContracts.groups.${group.key}.title`)}
                </Heading>
                <Text size="small" className="text-ui-fg-subtle">
                  {t(`chinaAdmin.readonlyContracts.groups.${group.key}.description`)}
                </Text>
              </div>
              <Badge size="2xsmall">
                {t("chinaAdmin.readonlyContracts.contractCount", {
                  count: group.contracts.length,
                })}
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                      {t("chinaAdmin.readonlyContracts.columns.contract")}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t("chinaAdmin.readonlyContracts.columns.surfaces")}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t("chinaAdmin.readonlyContracts.columns.runtime")}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t("chinaAdmin.readonlyContracts.columns.status")}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t("chinaAdmin.readonlyContracts.columns.blocked")}
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      {t("chinaAdmin.readonlyContracts.columns.next")}
                    </Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {group.contracts.map((contract) => (
                    <Table.Row key={contract.key}>
                      <Table.Cell>
                        <div className="flex min-w-[220px] flex-col gap-y-0.5">
                          <Text size="small" weight="plus">
                            {t(`chinaAdmin.readonlyContracts.contracts.${contract.key}.title`)}
                          </Text>
                          <Text size="xsmall" className="text-ui-fg-muted">
                            {t(
                              `chinaAdmin.readonlyContracts.contracts.${contract.key}.description`,
                            )}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {t(`chinaAdmin.readonlyContracts.surfaces.${contract.surfacesKey}`)}
                      </Table.Cell>
                      <Table.Cell>
                        {t(`chinaAdmin.readonlyContracts.runtime.${contract.runtimeKey}`)}
                      </Table.Cell>
                      <Table.Cell>
                        <StatusBadge color={statusColorByReadonlyContractStatus[contract.status]}>
                          {t(`chinaAdmin.readonlyContracts.status.${contract.status}`)}
                        </StatusBadge>
                      </Table.Cell>
                      <Table.Cell className="max-w-[260px]">
                        <Text size="small" className="line-clamp-2">
                          {t(`chinaAdmin.readonlyContracts.blocked.${contract.blockedKey}`)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell className="max-w-[240px]">
                        <Text size="small" className="line-clamp-2">
                          {t(`chinaAdmin.readonlyContracts.next.${contract.nextKey}`)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Container>
        ))}
      </div>
    </ChinaAdminShell>
  )
}

export default ChinaAdminReadonlyContractsPanel
