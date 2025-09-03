

import { getInvoices, getProjects, getClients, getTasks, getUsers, getTickets } from "@/lib/data";
import { AnalyticsClient } from "./_components/analytics-client";


export default async function AnalyticsPage() {
    const [
        invoicesData,
        projectsData,
        clientsData,
        tasksData,
        usersData,
        ticketsData,
    ] = await Promise.all([
        getInvoices(),
        getProjects(),
        getClients(),
        getTasks(),
        getUsers(),
        getTickets(),
    ]);

    return (
        <AnalyticsClient 
            invoices={invoicesData}
            projects={projectsData}
            clients={clientsData}
            tasks={tasksData}
            users={usersData}
            tickets={ticketsData}
        />
    );
}
