
import { getUsers } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { OurPartiesClient } from "./_components/our-parties-client"

export default async function OurPartiesPage() {
  const users = await getUsers();

  return (
    <>
      <PageHeader
        title="Nuestras Fiestas"
        description="Celebremos juntos los cumpleaños de nuestro increíble equipo."
      />
      <OurPartiesClient users={users} />
    </>
  )
}
