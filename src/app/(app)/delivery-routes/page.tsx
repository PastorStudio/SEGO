

import { getWarehouseRequests, getProjects, getUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { DeliveryRoutesClient } from "./_components/delivery-routes-client";
import { type WarehouseRequest, type Project, type User } from "@/lib/definitions";

type GroupedRequests = {
  [date: string]: {
    requests: WarehouseRequest[];
    projectDetails: { [projectId: string]: { name: string; clientName: string } };
  };
};

export default async function DeliveryRoutesPage() {
  const allRequests = await getWarehouseRequests();
  const allProjects = await getProjects();
  const allUsers = await getUsers();

  const onRouteRequests = allRequests.filter(req => req.status === 'In Progress');

  const projectMap = allProjects.reduce((acc, proj) => {
    acc[proj.id] = proj;
    return acc;
  }, {} as { [id: string]: Project });

  const grouped = onRouteRequests.reduce<GroupedRequests>((acc, req) => {
    const date = req.requiredByDate.split('T')[0]; // Group by day
    if (!acc[date]) {
      acc[date] = { requests: [], projectDetails: {} };
    }
    acc[date].requests.push(req);
    const project = projectMap[req.projectId];
    if (project) {
      acc[date].projectDetails[req.projectId] = {
        name: project.name,
        clientName: project.client
      };
    }
    return acc;
  }, {});

  // Sort dates
  const sortedGroupedRequests = Object.keys(grouped).sort().reduce(
    (obj, key) => {
      obj[key] = grouped[key];
      return obj;
    },
    {} as GroupedRequests
  );

  return (
    <>
       <PageHeader
        title="Rutas de Reparto"
        description="Pedidos que han salido del almacén y están en ruta para ser entregados."
      />
      <DeliveryRoutesClient groupedRequests={sortedGroupedRequests} users={allUsers} />
    </>
  );
}
