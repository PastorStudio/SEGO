
import { getProjects } from "@/lib/data"
import { PageHeader } from "@/components/page-header"
import { ProjectList } from "./_components/project-list"
import { CreateProjectModal } from "./_components/create-project-modal";

export default async function ProjectsPage() {
  const projects = await getProjects();
  
  return (
    <>
      <PageHeader title="Proyectos">
        <CreateProjectModal />
      </PageHeader>
      <ProjectList projects={projects} />
    </>
  )
}
