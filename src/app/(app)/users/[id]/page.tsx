
import { getUser, getProjects, getImmediateTasks } from "@/lib/data"
import { notFound } from "next/navigation"
import { UserProfileClient } from "./_components/user-profile-client"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  const userData = await getUser(params.id)
  if (!userData) {
    notFound();
  }

  // Fetch related data for the user's activity feed
  const allProjects = await getProjects();
  const allImmediateTasks = await getImmediateTasks();

  const userProjects = allProjects.filter(p => p.team.includes(userData.id));
  const userTasks = allImmediateTasks.filter(t => t.userId === userData.id);

  return <UserProfileClient user={userData} projects={userProjects} tasks={userTasks} />
}
