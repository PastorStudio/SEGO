
import { getProject } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ProjectForm } from "../../_components/project-form";

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id);

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageHeader title="Editar Proyecto" />
      <ProjectForm project={project} />
    </>
  );
}
