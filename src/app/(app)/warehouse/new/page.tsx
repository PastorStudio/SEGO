

import { getProjects } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { WarehouseRequestForm } from "../_components/warehouse-request-form";

export default async function NewWarehouseRequestPage() {
  const projects = await getProjects();
  return (
    <>
      <PageHeader title="Crear Nueva Solicitud a Almacén" />
      <WarehouseRequestForm projects={projects} />
    </>
  );
}
