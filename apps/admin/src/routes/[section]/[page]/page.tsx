import { useParams } from "react-router-dom"
import { Container, Heading, Text } from "@medusajs/ui"

import ChinaAdminPageShell from "../../../components/ChinaAdminPageShell"
import ChinaAdminOperationsConsole from "../../../components/ChinaAdminOperationsConsole"
import ChinaAdminProductSpecTemplates from "../../../components/ChinaAdminProductSpecTemplates"
import ChinaAdminReadonlyContractsPanel from "../../../components/ChinaAdminReadonlyContractsPanel"
import PickupCardDashboard from "../../../components/PickupCardDashboard"
import { useChinaAdminTranslation } from "../../../i18n/use-china-admin-translation"
import { findChinaAdminPage } from "../../../lib/china-admin-menu"

const ChinaAdminDynamicPage = () => {
  const { t } = useChinaAdminTranslation()
  const { section, page } = useParams()
  const pageMeta = findChinaAdminPage(section, page)

  if (!pageMeta) {
    return (
      <Container className="p-0">
        <div className="flex flex-col gap-y-1 px-6 py-4">
          <Heading level="h1">{t("chinaAdmin.notFound.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("chinaAdmin.notFound.message")}
          </Text>
        </div>
      </Container>
    )
  }

  if (pageMeta.key === "pickupCardDashboard") {
    return <PickupCardDashboard page={pageMeta} />
  }

  if (pageMeta.key === "capabilityContracts") {
    return <ChinaAdminReadonlyContractsPanel page={pageMeta} />
  }

  if (pageMeta.tableKind === "operations") {
    return <ChinaAdminOperationsConsole page={pageMeta} />
  }

  if (pageMeta.key === "productSpecTemplates") {
    return <ChinaAdminProductSpecTemplates page={pageMeta} />
  }

  return <ChinaAdminPageShell page={pageMeta} />
}

export default ChinaAdminDynamicPage
