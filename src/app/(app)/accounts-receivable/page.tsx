
import { getInvoices, getUsers, getProjects } from "@/lib/data"
import { AccountsReceivableClient } from "./_components/accounts-receivable-client";

export default async function AccountsReceivablePage() {
    const invoicesData = await getInvoices();
    const usersData = await getUsers();
    const projectsData = await getProjects();
    
    return (
        <AccountsReceivableClient 
            invoices={invoicesData}
            users={usersData}
            projects={projectsData}
        />
    )
}
