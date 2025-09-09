'use server';

import { revalidatePath } from 'next/cache';
import type { Project, User, Invoice, Task, ImmediateTask, Permissions, Client, WarehouseRequest, Notification, Comment, ChatMessage, PrivateChats, Ticket, SearchResult, TimeEntry } from './definitions';
import { initialPermissions } from './definitions';
import { supabaseAdmin as supabase } from './supabase-client';

// --- Helper Functions ---
async function handleError(error: any, context: string) {
    console.error(`Supabase error in ${context}:`, error);
    // In a real app, you might want to log this to a service like Sentry or Logtail
    throw new Error(`Database operation failed: ${context}`);
}

// --- Data Access Functions ---

export async function loginAction(credentials: { email: string, password?: string }) {
    try {
        if (!credentials.password) {
            return { success: false, error: 'Password is required.' };
        }

        // Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });

        if (authError) {
            console.error('Supabase Auth login error:', authError);
            return { success: false, error: authError.message || 'Authentication failed.' };
        }

        // Fetch user from public.users table using the authenticated user's ID
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id) // Use the ID from Supabase Auth
            .limit(1)
            .single();

        if (userError) {
            console.error('Error fetching user from public.users:', userError);
            return { success: false, error: 'Failed to retrieve user profile.' };
        }

        if (!userData) {
            return { success: false, error: 'User profile not found.' };
        }

        // Update user status in public.users table
        await setUserStatus(userData.id, 'online');
        return { success: true, user: userData };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'An unexpected error occurred during login.' };
    }
}


// Getters
export async function getProjects(): Promise<Project[]> { 
    const { data, error } = await supabase.from('projects').select('*').order('dueDate', { ascending: false });
    if (error) await handleError(error, 'getProjects');
    return data || []; 
}
export async function getProject(id: string): Promise<Project | undefined> { 
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getProject'); // PGRST116 = no rows found
    return data || undefined;
}

export async function getUsers(): Promise<User[]> { 
    const { data, error } = await supabase.from('users').select('*').order('name');
    if (error) await handleError(error, 'getUsers');
    return data || []; 
}
export async function getUser(id: string): Promise<User | undefined> { 
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getUser');
    return data || undefined; 
}
export async function getFirstSuperAdmin(): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('role', 'Super-Admin').limit(1).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getFirstSuperAdmin');
    return data || undefined;
}

export async function getClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (error) await handleError(error, 'getClients');
    return data || [];
}
export async function getClient(id: string): Promise<Client | undefined> {
    const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getClient');
    return data || undefined;
}

export async function getInvoices(): Promise<Invoice[]> { 
    const { data, error } = await supabase.from('invoices').select('*').order('issueDate', { ascending: false });
    if (error) await handleError(error, 'getInvoices');
    return (data || []).map(i => ({...i, items: JSON.parse(i.items)})); 
}
export async function getInvoice(id: string): Promise<Invoice | undefined> { 
    const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getInvoice');
    if (data) data.items = JSON.parse(data.items);
    return data || undefined; 
}

export async function getTasks(): Promise<Task[]> { 
    const { data, error } = await supabase.from('tasks').select('*').order('dueDate', { ascending: false });
    if (error) await handleError(error, 'getTasks');
    return data || []; 
}
export async function getTask(id: string): Promise<Task | undefined> { 
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getTask');
    return data || undefined;
}

export async function getTickets(): Promise<Ticket[]> {
    const { data, error } = await supabase.from('tickets').select('*').order('createdAt', { ascending: false });
    if (error) await handleError(error, 'getTickets');
    return (data || []).map(t => ({...t, comments: JSON.parse(t.comments || '[]')}));
}
export async function getTicket(id: string): Promise<Ticket | undefined> {
    const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getTicket');
    if (data) data.comments = JSON.parse(data.comments || '[]');
    return data || undefined;
}

export async function getImmediateTasks(): Promise<ImmediateTask[]> { 
    const { data, error } = await supabase.from('immediateTasks').select('*').order('id', { ascending: false });
    if (error) await handleError(error, 'getImmediateTasks');
    return (data || []).map(t => ({...t, comments: JSON.parse(t.comments || '[]')})); 
}

export async function getPermissions(): Promise<Permissions> { 
    const { data, error } = await supabase.from('permissions').select('*').single();
    if(error || !data) {
        console.error("Could not fetch permissions, falling back to initial.", error);
        return initialPermissions;
    }
    return data.data; 
}

export async function updatePermissions(newPermissions: Permissions): Promise<void> {
    const { error } = await supabase
        .from('permissions')
        .update({ data: newPermissions })
        .eq('id', 1); // Assuming a single row with id 1 for permissions

    if (error) await handleError(error, 'updatePermissions');

    revalidatePath('/settings');
    revalidatePath('/', 'layout');
}


export async function getWarehouseRequests(): Promise<WarehouseRequest[]> {
    const { data, error } = await supabase.from('warehouseRequests').select('*').order('requestDate', { ascending: false });
    if (error) await handleError(error, 'getWarehouseRequests');
    return (data || []).map(r => ({...r, items: JSON.parse(r.items), comments: JSON.parse(r.comments || '[]')}));
}
export async function getWarehouseRequest(id: string): Promise<WarehouseRequest | undefined> {
    const { data, error } = await supabase.from('warehouseRequests').select('*').eq('id', id).single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getWarehouseRequest');
    if (data) {
      data.items = JSON.parse(data.items);
      data.comments = JSON.parse(data.comments || '[]');
    }
    return data || undefined;
}

export async function getNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase.from('notifications').select('*').order('createdAt', { ascending: false }).limit(20);
    if(error) await handleError(error, 'getNotifications');
    return data || [];
}

export async function getGeneralChatMessages(): Promise<ChatMessage[]> {
    const { data, error } = await supabase.from('generalChatMessages').select('*').order('createdAt', { ascending: true });
    if (error) await handleError(error, 'getGeneralChatMessages');
    return data || [];
}

export async function getPrivateChatMessages(userId1: string, userId2: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
        .from('privateChatMessages')
        .select('*')
        .or(`(senderId.eq.${userId1},recipientId.eq.${userId2}),(senderId.eq.${userId2},recipientId.eq.${userId1})`)
        .order('createdAt', { ascending: true });

    if (error) await handleError(error, 'getPrivateChatMessages');
    return data || [];
}

export async function getUnreadMessageCount(currentUserId: string): Promise<Record<string, number>> {
    const { data, error } = await supabase
        .from('privateChatMessages')
        .select('senderId')
        .eq('recipientId', currentUserId)
        .eq('read', false);

    if (error) await handleError(error, 'getUnreadMessageCount');

    const counts: Record<string, number> = {};
    if (data) {
        for (const message of data) {
            counts[message.senderId] = (counts[message.senderId] || 0) + 1;
        }
    }
    return counts;
}

export async function markChatAsRead(recipientId: string, senderId: string): Promise<void> {
    const { error } = await supabase
        .from('privateChatMessages')
        .update({ read: true })
        .eq('recipientId', recipientId)
        .eq('senderId', senderId);

    if (error) await handleError(error, 'markChatAsRead');
    revalidatePath('/chat');
}


export async function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<void> {
    const newNotification = {
        ...notification,
        createdAt: new Date().toISOString(),
        read: false,
    };
    const { error } = await supabase.from('notifications').insert(newNotification);
    if (error) await handleError(error, 'addNotification');
}
export async function markNotificationsAsRead(): Promise<void> {
    // This is a simplification. In a real app, you'd mark specific user's notifications.
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
     if (error) await handleError(error, 'markNotificationsAsRead');
}


// --- Mutations ---

export async function addProject(project: Omit<Project, 'id'>, userName: string): Promise<Project> {
  const newProjectData = { ...project, id: `PROJ-${String(Date.now()).slice(-4)}` };
  const { data, error } = await supabase.from('projects').insert(newProjectData).select().single();
  if (error) await handleError(error, 'addProject');
  
  await addNotification({ message: `${userName} creó el nuevo proyecto: "${data.name}"`, link: `/projects/${data.id}` });
  revalidatePath('/projects');
  revalidatePath('/dashboard');
  return data;
};

export async function updateProject(updatedProject: Project): Promise<void> {
  const { id, ...updateData } = updatedProject;
  const { error } = await supabase.from('projects').update(updateData).eq('id', id);
  if (error) await handleError(error, 'updateProject');

  await addNotification({ message: `El proyecto "${updatedProject.name}" ha sido actualizado.`, link: `/projects/${updatedProject.id}` });
  revalidatePath('/projects');
  revalidatePath(`/projects/${updatedProject.id}`);
};

export async function deleteProject(projectId: string): Promise<void> {
  const projectToDelete = await getProject(projectId);
  const { error } = await supabase.from('projects').delete().eq('id', projectId);
  if (error) await handleError(error, 'deleteProject');
  if (projectToDelete) {
      await addNotification({ message: `El proyecto "${projectToDelete.name}" ha sido eliminado.`, link: `/projects` });
  }
  revalidatePath('/projects');
};

export async function addUser(user: Omit<User, 'id' | 'company' | 'avatar' | 'status' | 'lastSeen' | 'profilePicture'>): Promise<User> {
  const newUser: User = {
    id: `user-${Date.now()}`,
    ...user,
    company: "Sego Eventos Inc.",
    avatar: "",
    status: "offline",
    lastSeen: new Date().toISOString()
  };
  const { data, error } = await supabase.from('users').insert(newUser).select().single();
  if (error) await handleError(error, 'addUser');
  
  await addNotification({ message: `Un nuevo usuario se ha unido: ${data.name} (${data.role})`, link: '/users' });
  revalidatePath('/users');
  return data;
};

export async function updateUser(updatedUser: User): Promise<void> {
  // Supabase can't handle undefined, so we create a clean object
  const updateData = { ...updatedUser };
  if (!updateData.password) {
      delete updateData.password;
  }
  const { error } = await supabase.from('users').update(updateData).eq('id', updatedUser.id);
  if (error) await handleError(error, 'updateUser');

  await addNotification({ message: `El usuario "${updatedUser.name}" ha sido actualizado.`, link: `/users` });
  revalidatePath('/users');
  revalidatePath(`/users/${updatedUser.id}`);
  revalidatePath('/settings');
  revalidatePath('/', 'layout');
};

export async function deleteUser(userId: string): Promise<void> {
  const userToDelete = await getUser(userId);
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) await handleError(error, 'deleteUser');
  if (userToDelete) {
      await addNotification({ message: `El usuario "${userToDelete.name}" ha sido eliminado.`, link: `/users` });
  }
  revalidatePath('/users');
};

export async function setUserStatus(userId: string, status: 'online' | 'offline'): Promise<void> {
    const updateData: { status: 'online' | 'offline', lastSeen?: string } = { status };
    if (status === 'offline') {
        updateData.lastSeen = new Date().toISOString();
    }
    const { error } = await supabase.from('users').update(updateData).eq('id', userId);
    if (error) await handleError(error, 'setUserStatus');
    
    revalidatePath('/users');
    revalidatePath('/chat');
    revalidatePath(`/users/${userId}`);
    revalidatePath('/', 'layout');
}


export async function addClient(client: Omit<Client, 'id'>): Promise<Client> {
    const newClientData = { ...client, id: `client-${Date.now()}` };
    const { data, error } = await supabase.from('clients').insert(newClientData).select().single();
    if (error) await handleError(error, 'addClient');
    
    await addNotification({ message: `Nuevo cliente registrado: ${data.name}`, link: '/clients' });
    revalidatePath('/clients');
    revalidatePath('/dashboard');
    return data;
}

export async function updateClient(updatedClient: Client): Promise<void> {
    const { error } = await supabase.from('clients').update(updatedClient).eq('id', updatedClient.id);
    if (error) await handleError(error, 'updateClient');
    await addNotification({ message: `El cliente "${updatedClient.name}" ha sido actualizado.`, link: `/clients` });
    revalidatePath('/clients');
    revalidatePath(`/clients/${updatedClient.id}`);
}

export async function deleteClient(clientId: string): Promise<void> {
    const clientToDelete = await getClient(clientId);
    const { error } = await supabase.from('clients').delete().eq('id', clientId);
    if(error) await handleError(error, 'deleteClient');
    if(clientToDelete) {
        await addNotification({ message: `El cliente "${clientToDelete.name}" ha sido eliminado.`, link: `/clients` });
    }
    revalidatePath('/clients');
}

export async function addInvoice(invoice: Omit<Invoice, 'id' | 'clientName'>, userName: string): Promise<Invoice> {
  const client = await getClient(invoice.clientId);
  const newInvoiceData = {
    ...invoice,
    id: `INV-${String(Date.now()).slice(-4)}`,
    clientName: client?.name || 'N/A',
    items: JSON.stringify(invoice.items) // Serialize items array
  };

  const { data, error } = await supabase.from('invoices').insert(newInvoiceData).select().single();
  if (error) await handleError(error, 'addInvoice');

  await addNotification({ message: `Se ha creado una nueva factura (${data.id}) para ${data.clientName}`, link: `/invoices/${data.id}` });
  revalidatePath('/invoices');
  return {...data, items: JSON.parse(data.items)};
}

export async function updateInvoice(updatedInvoice: Invoice, userName: string): Promise<void> {
    const updateData = {
        ...updatedInvoice,
        items: JSON.stringify(updatedInvoice.items)
    };
    const { error } = await supabase.from('invoices').update(updateData).eq('id', updatedInvoice.id);
    if (error) await handleError(error, 'updateInvoice');
    
    await addNotification({ message: `La factura "${updatedInvoice.id}" ha sido actualizada.`, link: `/invoices/${updatedInvoice.id}` });
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${updatedInvoice.id}`);
}

export async function deleteInvoice(invoiceId: string): Promise<void> {
    const invoiceToDelete = await getInvoice(invoiceId);
    const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
    if(error) await handleError(error, 'deleteInvoice');
    if(invoiceToDelete) {
        await addNotification({ message: `La factura "${invoiceToDelete.id}" ha sido eliminada.`, link: `/invoices` });
    }
    revalidatePath('/invoices');
}

export async function updateTaskStatus(taskId: string, newStatus: Task['status']): Promise<void> {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (error) await handleError(error, 'updateTaskStatus');

    const task = await getTask(taskId);
    if (task) {
        await addNotification({ message: `El estado de la tarea "${task.title}" cambió a ${newStatus}.`, link: `/projects/${task.projectId}` });
        revalidatePath(`/projects/${task.projectId}`);
        revalidatePath('/dashboard');
    }
}

export async function updateTask(updatedTask: Partial<Task>): Promise<void> {
    if (!updatedTask.id) throw new Error("Task ID is required for updates.");
    const { error } = await supabase.from('tasks').update(updatedTask).eq('id', updatedTask.id);
    if (error) await handleError(error, 'updateTask');

    const task = await getTask(updatedTask.id);
    if (task) {
        await addNotification({ message: `La tarea "${task.title}" ha sido actualizada.`, link: `/projects/${task.projectId}` });
        revalidatePath(`/projects/${task.projectId}`);
        revalidatePath('/tasks');
        revalidatePath(`/tasks/${task.id}`);
    }
}

export async function updateInvoiceStatus(invoiceId: string, newStatus: Invoice['status'], userName: string): Promise<void> {
    const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', invoiceId);
    if (error) await handleError(error, 'updateInvoiceStatus');
    await addNotification({ message: `El estado de la factura "${invoiceId}" cambió a ${newStatus}.`, link: `/invoices/${invoiceId}` });
    revalidatePath('/invoices');
}

export async function addTask(task: Omit<Task, 'id'>, userName: string): Promise<Task> {
    const newTaskData = { ...task, id: `TASK-${String(Date.now()).slice(-4)}` };
    const { data, error } = await supabase.from('tasks').insert(newTaskData).select().single();
    if(error) await handleError(error, 'addTask');
    
    await addNotification({ message: `${userName} agregó la tarea "${data.title}"`, link: `/projects/${data.projectId}` });
    revalidatePath('/tasks');
    return data;
}

export async function addImmediateTask(task: Omit<ImmediateTask, 'id' | 'comments'>, assignerName: string): Promise<ImmediateTask> {
    const newTaskData = { ...task, id: `itask-${Date.now()}`, comments: JSON.stringify([]) };
    const { data, error } = await supabase.from('immediateTasks').insert(newTaskData).select().single();
    if(error) await handleError(error, 'addImmediateTask');

    const assignedUser = await getUser(task.userId);
    await addNotification({ message: `${assignerName} asignó a ${assignedUser?.name}: "${task.title}"`, link: `/immediate-work` });
    revalidatePath('/immediate-work');
    return {...data, comments: []};
}

export async function deleteImmediateTask(taskId: string): Promise<void> {
    const { error } = await supabase.from('immediateTasks').delete().eq('id', taskId);
    if(error) await handleError(error, 'deleteImmediateTask');
    revalidatePath('/immediate-work');
}

export async function updateImmediateTaskStatus(taskId: string, newStatus: 'pending' | 'completed'): Promise<void> {
    const { error } = await supabase.from('immediateTasks').update({ status: newStatus }).eq('id', taskId);
    if(error) await handleError(error, 'updateImmediateTaskStatus');
    revalidatePath('/immediate-work');
}

export async function linkImmediateTaskToProject(taskId: string, projectId: string): Promise<void> {
    const { error } = await supabase.from('immediateTasks').update({ projectId }).eq('id', taskId);
    if(error) await handleError(error, 'linkImmediateTaskToProject');
    revalidatePath('/immediate-work');
}

export async function addWarehouseRequest(request: Omit<WarehouseRequest, 'id' | 'comments'>, userName: string): Promise<WarehouseRequest> {
    const newRequestData = {
        ...request,
        id: `WR-${String(Date.now()).slice(-4)}`,
        items: JSON.stringify(request.items),
        comments: JSON.stringify([])
    };
    const { data, error } = await supabase.from('warehouseRequests').insert(newRequestData).select().single();
    if(error) await handleError(error, 'addWarehouseRequest');

    const project = await getProject(newRequestData.projectId);
    await addNotification({ message: `${userName} creó una solicitud de almacén para ${project?.name || ''}`, link: `/warehouse` });
    revalidatePath('/warehouse');
    return {...data, items: JSON.parse(data.items), comments: []};
}

export async function updateWarehouseRequest(requestId: string, newStatus: WarehouseRequest['status'], userName: string): Promise<void> {
    const { error } = await supabase.from('warehouseRequests').update({ status: newStatus }).eq('id', requestId);
    if(error) await handleError(error, 'updateWarehouseRequest');

    await addNotification({ message: `La solicitud ${requestId} fue actualizada a ${newStatus} por ${userName}`, link: '/warehouse' });
    revalidatePath('/warehouse');
    revalidatePath('/delivery-routes');
}

async function addComment(entityId: string, content: string, userId: string, tableName: string, linkPath: string, entityName: string): Promise<Comment> {
    const { data: entity, error: getError } = await supabase.from(tableName).select('comments').eq('id', entityId).single();
    if (getError || !entity) {
        await handleError(getError, `addComment:get:${tableName}`);
        throw new Error(`Failed to add comment: entity not found for table ${tableName}`); // Throw an error
    }
    
    const comments = JSON.parse(entity.comments || '[]');
    const newComment: Comment = { id: `comment-${Date.now()}`, userId, content, createdAt: new Date().toISOString() };
    comments.push(newComment);
    
    const { error: updateError } = await supabase.from(tableName).update({ comments: JSON.stringify(comments) }).eq('id', entityId);
    if(updateError) await handleError(updateError, `addComment:update:${tableName}`);

    const user = await getUser(userId);
    await addNotification({ message: `${user?.name || 'Alguien'} comentó en ${entityName} ${entityId}`, link: linkPath });
    
    revalidatePath(linkPath);
    return newComment;
}

export async function addCommentToWarehouseRequest(requestId: string, content: string, userId: string): Promise<Comment> {
    return addComment(requestId, content, userId, 'warehouseRequests', '/warehouse', 'la solicitud');
}
export async function addCommentToImmediateTask(taskId: string, content: string, userId: string): Promise<Comment> {
    return addComment(taskId, content, userId, 'immediateTasks', '/immediate-work', 'la tarea');
}
export async function addCommentToTicket(ticketId: string, content: string, userId: string): Promise<Comment> {
    return addComment(ticketId, content, userId, 'tickets', `/tickets/${ticketId}`, 'el ticket');
}

export async function addChatMessage(content: string, senderId: string, recipientId?: string): Promise<ChatMessage> {
    const message = {
        id: `msg-${Date.now()}`,
        content,
        senderId,
        recipientId,
        createdAt: new Date().toISOString(),
        read: false,
    };
    
    const tableName = recipientId ? 'privateChatMessages' : 'generalChatMessages';

    const { data, error } = await supabase.from(tableName).insert(message).select().single();
    if(error) await handleError(error, 'addChatMessage');
    
    revalidatePath('/chat');
    return data;
}


export async function addTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'comments'>): Promise<Ticket> {
    const newTicketData = {
        ...ticketData,
        id: `TKT-${String(Date.now()).slice(-4)}`,
        createdAt: new Date().toISOString(),
        comments: JSON.stringify([])
    };
    const { data, error } = await supabase.from('tickets').insert(newTicketData).select().single();
    if(error) await handleError(error, 'addTicket');

    await addNotification({ message: `Nuevo ticket creado: "${data.title}"`, link: `/tickets/${data.id}` });
    revalidatePath('/tickets');
    return {...data, comments: []};
}


export async function updateTicket(updatedTicket: Ticket): Promise<void> {
    const updateData = {
        ...updatedTicket,
        comments: JSON.stringify(updatedTicket.comments || [])
    };
    const { error } = await supabase.from('tickets').update(updateData).eq('id', updatedTicket.id);
    if(error) await handleError(error, 'updateTicket');
    await addNotification({ message: `El ticket "${updatedTicket.title}" ha sido actualizado.`, link: `/tickets/${updatedTicket.id}` });
    revalidatePath('/tickets');
    revalidatePath(`/tickets/${updatedTicket.id}`);
}

// --- Time Entry Functions ---

export async function clockIn(userId: string): Promise<TimeEntry> {
    const newEntry: Omit<TimeEntry, 'id' | 'created_at'> = {
        user_id: userId,
        clock_in_time: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('time_entries').insert(newEntry).select().single();
    if (error) await handleError(error, 'clockIn');
    revalidatePath('/dashboard'); // Revalidate dashboard to show status
    return data;
}

export async function clockOut(timeEntryId: string, userId: string): Promise<TimeEntry> {
    const now = new Date();
    const { data: existingEntry, error: getError } = await supabase.from('time_entries').select('*').eq('id', timeEntryId).single();
    if (getError || !existingEntry) await handleError(getError, 'clockOut:get');

    const clockInTime = new Date(existingEntry.clock_in_time);
    const durationMinutes = Math.round((now.getTime() - clockInTime.getTime()) / (1000 * 60));

    const { data, error } = await supabase.from('time_entries').update({
        clock_out_time: now.toISOString(),
        duration_minutes: durationMinutes,
    }).eq('id', timeEntryId).select().single();
    if (error) await handleError(error, 'clockOut:update');
    revalidatePath('/dashboard'); // Revalidate dashboard to show status
    return data;
}

export async function getPendingClockIn(userId: string): Promise<TimeEntry | undefined> {
    const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId)
        .is('clock_out_time', null)
        .order('clock_in_time', { ascending: false })
        .limit(1)
        .single();
    if (error && error.code !== 'PGRST116') await handleError(error, 'getPendingClockIn');
    return data || undefined;
}

export async function getWorkSessions(userId: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    let query = supabase.from('time_entries').select('*').eq('user_id', userId).order('clock_in_time', { ascending: false });

    if (startDate) {
        query = query.gte('clock_in_time', startDate.toISOString());
    }
    if (endDate) {
        query = query.lte('clock_in_time', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) await handleError(error, 'getWorkSessions');
    return data || [];
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
  const normalizedQuery = `%${query}%`;
  const results: SearchResult[] = [];

  const [
    { data: projects },
    { data: clients },
    { data: users },
    { data: invoices },
    { data: tasks },
    { data: tickets },
  ] = await Promise.all([
    supabase.from('projects').select('id, name, client').ilike('name', normalizedQuery).limit(5),
    supabase.from('clients').select('id, name, email').ilike('name', normalizedQuery).limit(5),
    supabase.from('users').select('id, name, email').ilike('name', normalizedQuery).limit(5),
    supabase.from('invoices').select('id, clientName').ilike('clientName', normalizedQuery).limit(5),
    supabase.from('tasks').select('id, title').ilike('title', normalizedQuery).limit(5),
    supabase.from('tickets').select('id, title').ilike('title', normalizedQuery).limit(5),
  ]);

  if (projects) results.push(...projects.map(p => ({ id: p.id, type: 'projects', title: p.name, description: p.client, url: `/projects/${p.id}` } as SearchResult)));
  if (clients) results.push(...clients.map(c => ({ id: c.id, type: 'clients', title: c.name, description: c.email, url: `/clients` } as SearchResult)));
  if (users) results.push(...users.map(u => ({ id: u.id, type: 'users', title: u.name, description: u.email, url: `/users/${u.id}` } as SearchResult)));
  if (invoices) results.push(...invoices.map(i => ({ id: i.id, type: 'invoices', title: `Factura ${i.id}`, description: i.clientName, url: `/invoices/${i.id}` } as SearchResult)));
  if (tasks) results.push(...tasks.map(t => ({ id: t.id, type: 'tasks', title: t.title, description: `Tarea ${t.id}`, url: `/tasks` } as SearchResult)));
  if (tickets) results.push(...tickets.map(t => ({ id: t.id, type: 'tickets', title: t.title, description: `Ticket ${t.id}`, url: `/tickets/${t.id}` } as SearchResult)));

  return results;
}

export async function getProjectSummaryData(projectNameOrId: string): Promise<any> {
    let project: Project | undefined;

    // Try to find by ID first
    project = await getProject(projectNameOrId);

    // If not found by ID, try to find by name (case-insensitive partial match)
    if (!project) {
        const { data: projectsFound, error } = await supabase.from('projects')
            .select('id, name') // Only select ID and name for efficiency
            .ilike('name', `%${projectNameOrId}%`);
        
        if (error) await handleError(error, 'getProjectSummaryData:getProjectByName');

        if (projectsFound && projectsFound.length === 1) {
            // Exactly one match found by name
            project = await getProject(projectsFound[0].id); // Fetch full project details
        } else if (projectsFound && projectsFound.length > 1) {
            // Multiple matches found
            return { ambiguous: true, matches: projectsFound.map(p => p.name) };
        }
        // If 0 matches, project remains undefined, and it will return null later
    }

    if (!project) {
        return null; // Project not found
    }

    const projectId = project.id;

    // Fetch related tasks and warehouse requests
    const { data: tasks, error: tasksError } = await supabase.from('tasks')
        .select('*')
        .eq('projectId', projectId);
    if (tasksError) await handleError(tasksError, 'getProjectSummaryData:getTasks');

    const { data: warehouseRequests, error: wrError } = await supabase.from('warehouseRequests')
        .select('*')
        .eq('projectId', projectId);
    if (wrError) await handleError(wrError, 'getProjectSummaryData:getWarehouseRequests');

    return {
        project,
        tasks: tasks || [],
        warehouseRequests: warehouseRequests || []
    };
}