
import { getProjects, getTasks, getClients, getWarehouseRequests, getImmediateTasks, getUsers, getInvoices, getTickets } from "@/lib/data";
import { DashboardClient } from "./_components/dashboard-client";

export default async function DashboardPage() {
  const [
    projectsData,
    tasksData,
    clientsData,
    requestsData,
    immediateTasksData,
    usersData,
    invoicesData,
    ticketsData,
  ] = await Promise.all([
    getProjects(),
    getTasks(),
    getClients(),
    getWarehouseRequests(),
    getImmediateTasks(),
    getUsers(),
    getInvoices(),
    getTickets(),
  ]);


  return (
    <DashboardClient
      projects={projectsData}
      tasks={tasksData}
      clients={clientsData}
      warehouseRequests={requestsData}
      immediateTasks={immediateTasksData}
      users={usersData}
      invoices={invoicesData}
      tickets={ticketsData}
    />
  );
}

    
