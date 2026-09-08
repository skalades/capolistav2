import { getUsers } from "@/app/actions/users"
import { PenggunaClient } from "./components/PenggunaClient"

export default async function PenggunaPage() {
  const users = await getUsers()
  
  // If backend is down or not authenticated, users might be undefined or have error
  const safeUsers = Array.isArray(users) ? users : []

  return <PenggunaClient users={safeUsers} />
}
