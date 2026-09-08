import { getSettings } from "@/app/actions/settings"
import { PengaturanClient } from "./components/PengaturanClient"

export default async function PengaturanPage() {
  const settings = await getSettings()
  
  return <PengaturanClient initialSettings={settings || {}} />
}
