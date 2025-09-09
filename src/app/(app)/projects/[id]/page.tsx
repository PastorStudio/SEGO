
import { getProject, getTasks, getWarehouseRequests, getUsers } from "@/lib/data"
import { notFound } from "next/navigation"
import { ProjectDetailsClient } from "./_components/project-details-client";

type PageParams = {
  params: {
    id: string;
  };
};

// @ts-ignore
export default async function ProjectDetailsPage({ params }: PageParams) {
  const { id } = params;
  const projectData = await getProject(id)
  if (!projectData) notFound()

  // Initial data is fetched on the server for fast first load.
  // The client component will then poll for updates.
  const allTasksData = await getTasks();
  const allRequestsData = await getWarehouseRequests();
  const allUsersData = await getUsers();

  const projectTasks = allTasksData.filter(task => task.projectId === projectData.id);
  const projectWarehouseRequests = allRequestsData.filter(req => req.projectId === projectData.id);
  

  return (
    <ProjectDetailsClient
        initialProject={projectData}
        initialTasks={projectTasks}
        initialWarehouseRequests={projectWarehouseRequests}
        allUsers={allUsersData}
    />
  )
}
