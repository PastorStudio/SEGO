

export type Project = {
  id: string;
  name: string;
  client: string;
  status: 'On Track' | 'Off Track' | 'Completed' | 'On Hold';
  dueDate: string;
  dueTime: string;
  team: string[];
  eventType: 'Corporativo' | 'No Corporativo';
  linkedTickets?: string[];
};

export const roles = ["Super-Admin", "Admin", "Agent", "Viewer"] as const;
export type Role = typeof roles[number];

export const pages = ["Dashboard", "Analytics", "Recursos Humanos", "Administración y Supervisión", "Trabajo inmediato", "Tickets", "Projects", "Tasks", "Invoices", "Clients", "Users & Companies", "Services", "Warehouse", "Montaje", "Reparto", "Cuentas por Cobrar", "Nuestras Fiestas", "Settings", "Chat"] as const;
export type Page = typeof pages[number];

export type Permissions = Record<Role, Record<Page, boolean>>;

export const initialPermissions: Permissions = {
  "Super-Admin": {
    "Dashboard": true, "Analytics": true, "Recursos Humanos": true, "Administración y Supervisión": true, "Trabajo inmediato": true, "Projects": true, "Tasks": true,
    "Invoices": true, "Clients": true, "Users & Companies": true, "Services": true,
    "Warehouse": true, "Montaje": true, "Reparto": true, "Cuentas por Cobrar": true, "Settings": true,
    "Chat": true, "Tickets": true, "Nuestras Fiestas": true,
  },
  "Admin": {
    "Dashboard": true, "Analytics": true, "Recursos Humanos": true, "Administración y Supervisión": true, "Trabajo inmediato": true, "Projects": true, "Tasks": true,
    "Invoices": true, "Clients": true, "Users & Companies": true, "Services": true,
    "Warehouse": true, "Montaje": true, "Reparto": true, "Cuentas por Cobrar": true, "Settings": true,
     "Chat": true, "Tickets": true, "Nuestras Fiestas": true,
  },
  "Agent": {
    "Dashboard": true, "Analytics": false, "Recursos Humanos": false, "Administración y Supervisión": false, "Trabajo inmediato": true, "Projects": true, "Tasks": true,
    "Invoices": true, "Clients": true, "Users & Companies": false, "Services": true,
    "Warehouse": true, "Montaje": true, "Reparto": true, "Cuentas por Cobrar": false, "Settings": false,
     "Chat": true, "Tickets": true, "Nuestras Fiestas": true,
  },
  "Viewer": {
    "Dashboard": false, "Analytics": false, "Recursos Humanos": false, "Administración y Supervisión": false, "Trabajo inmediato": true, "Projects": false, "Tasks": true,
    "Invoices": false, "Clients": false, "Users & Companies": false, "Services": false,
    "Warehouse": true, "Montaje": true, "Cuentas por Cobrar": false, "Settings": false, "Reparto": true,
     "Chat": true, "Tickets": true, "Nuestras Fiestas": true,
  },
};


export type User = {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate?: string;
    password?: string;
    role: Role;
    company: string;
    avatar: string;
    profilePicture?: string;
    status: 'online' | 'offline';
    lastSeen: string;
    position?: string; // Cargo del empleado
    hireDate?: string; // Fecha de contratación
    workStatus?: 'Activo' | 'En Pausa' | 'De Baja'; // Estado laboral
}

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
};

export type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
  serviceId?: string;
};

export type Invoice = {
  id: string;
  clientId: string;
  projectId: string; // <-- Added this field
  clientName: string;
  salespersonId: string;
  ncf?: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
  firstPayment?: number;
  subsequentPayments?: number;
  commissionPaid?: boolean;
};

export type Task = {
    id: string;
    title: string;
    projectId: string;
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate: string;
    // This field is just for sorting purposes in the dashboard, not stored in db.json
    sortDate?: string; 
};

export type ImmediateTask = {
  id: string;
  title: string;
  userId: string;
  status: 'pending' | 'completed';
  projectId?: string;
  notes?: string;
  comments?: Comment[];
}

export type WarehouseRequestItem = {
  id: string;
  name: string;
  quantity: number;
};

export type Comment = {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  requesterType: 'user' | 'client';
  assigneeId?: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  closedAt?: string;
  comments?: Comment[];
};


export type WarehouseRequest = {
  id: string;
  projectId: string;
  requesterId: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  requestDate: string;
  requiredByDate: string;
  items: WarehouseRequestItem[];
  notes?: string;
  comments?: Comment[];
  // This field is just for sorting purposes in the dashboard, not stored in db.json
  sortDate?: string; 
};

export type Notification = {
  id: string;
  message: string;
  link: string;
  createdAt: string;
  read: boolean;
  userId?: string; // Optional: To target a specific user
};

export type ChatMessage = {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
  recipientId?: string;
}

export type PrivateChats = {
  [key: string]: ChatMessage[];
}

export type SearchResult = {
    id: string;
    type: 'projects' | 'clients' | 'users' | 'invoices' | 'tasks' | 'tickets';
    title: string;
    description: string;
    url: string;
}
