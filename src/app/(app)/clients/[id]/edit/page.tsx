1 import { getClient } from "@/lib/data";
    2 import { notFound } from "next/navigation";
    3 import { PageHeader } from "@/components/page-header";
    4 import { ClientForm } from "../../_components/client-form";
    5 
    6 interface EditClientPageProps {
    7   params: {
    8     id: string;
    9   };
   10 }
   11 
   12 export default async function EditClientPage({ params }: EditClientPageProps) {
   13   const client = await getClient(params.id);
   14 
   15   if (!client) {
   16     notFound();
   17   }
   18 
   19   return (
   20     <>
   21       <PageHeader title="Editar Cliente" />
   22       <ClientForm client={client} />
   23     </>
   24   );
   25 }
