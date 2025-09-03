// src/app/(app)/projects/[id]/page.tsx
import { notFound } from 'next/navigation';
import ProjectDetailsClient from './_components/project-details-client';
import type { Project, Task, WarehouseRequest, User } from '@/lib/definitions';
import { getProject, getTasks, getWarehouseRequests, getUsers } from '@/lib/data';

export default async function Page({
  params,
}: {
  // Parche: tu build actual espera params como Promise
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;

  const [project, allTasks, allRequests, allUsers] = await Promise.all([
    getProject(id),
    getTasks(),
    getWarehouseRequests(),
    getUsers(),
  ]);

  if (!project) {
    notFound
