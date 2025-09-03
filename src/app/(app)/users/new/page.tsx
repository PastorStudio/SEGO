import { PageHeader } from "@/components/page-header"
import { UserForm } from "../_components/user-form"

export default function NewUserPage() {
  return (
    <>
      <PageHeader title="Crear Nuevo Usuario" />
      <UserForm />
    </>
  )
}
