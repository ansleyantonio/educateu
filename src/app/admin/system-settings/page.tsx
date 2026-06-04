import { PageWithBreadcrumb } from '@/components/Breadcrumb/PageWithBreadcrumb'
import SettingsOptions from './_assets/components/settings-options'

export default function SystemSettings() {
  return (
    <PageWithBreadcrumb
          items={[{ title: "Home" }, { title: "Settings" }]}
        >
          <SettingsOptions />
        </PageWithBreadcrumb>
  )
}
