
import { getUser } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { UserForm } from "../../_components/user-form";

export default async function EditUserPage({ params }: { params: any }) {
  const user = await getUser(params.id);

  if (!user) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Editar Usuario" />
      <UserForm user={user} />
    </>
  );
}
