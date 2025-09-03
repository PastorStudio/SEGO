
import Link from "next/link";
import { getWarehouseRequests, getProjects, getUsers } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { WarehouseRequestList } from "./_components/warehouse-request-list";

export default async function WarehousePage() {
    const requestsData = await getWarehouseRequests();
    const projectsData = await getProjects();
    const usersData = await getUsers();

  return (
    <>
      <PageHeader title="Portal de Almacén">
        <Button asChild>
          <Link href="/warehouse/new"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Solicitud</Link>
        </Button>
      </PageHeader>
      <WarehouseRequestList 
        initialRequests={requestsData}
        initialProjects={projectsData}
        initialUsers={usersData}
      />
    </>
  );
}
