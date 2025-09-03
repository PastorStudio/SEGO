
import { PageHeader } from "@/components/page-header"
import { getTasks, getProjects } from "@/lib/data"
import { TaskList } from "./_components/task-list";
import { CreateTaskModal } from "./_components/create-task-modal";

export default async function TasksPage() {
    const tasks = await getTasks();
    const projects = await getProjects();

    return (
        <>
            <PageHeader title="Tareas">
               <CreateTaskModal projects={projects} />
            </PageHeader>
            <TaskList tasks={tasks} projects={projects} />
        </>
    )
}
