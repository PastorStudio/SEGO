import { getTask } from "@/lib/data";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { EditTaskForm } from "./_components/edit-task-form";

export default async function TaskDetailsPage({ params }: { params: any }) {
  const task = await getTask(params.id);

  if (!task) {
    notFound();
  }

  return (
    <>
      <PageHeader title={`Editar Tarea: ${task.title}`} />
      <div className="max-w-2xl mx-auto">
        <EditTaskForm task={task} />
      </div>
    </>
  );
}
