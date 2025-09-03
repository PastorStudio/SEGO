

import { getUsers } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { UserList } from "../users/_components/user-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default async function HumanResourcesPage() {
  const users = await getUsers();

  return (
    <>
      <PageHeader
        title="Recursos Humanos"
        description="Gestión de empleados, datos personales, roles y estado laboral."
      >
         <Button asChild>
          <Link href="/users/new"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Empleado</Link>
        </Button>
      </PageHeader>
      
      {/* 
        Future HR components can be added here, e.g.:
        - Payroll Management
        - Attendance Tracking
        - Performance Reviews
      */}
      
      <UserList users={users} />
    </>
  )
}
