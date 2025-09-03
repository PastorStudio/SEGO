
import Link from "next/link"
import { getUsers } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { UserList } from "./_components/user-list"

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <>
      <PageHeader title="Usuarios & Compañías">
        <Button asChild>
          <Link href="/users/new"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Usuario</Link>
        </Button>
      </PageHeader>
      <UserList users={users} />
    </>
  )
}
