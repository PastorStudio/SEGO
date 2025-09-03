
-- Drop tables if they exist to start fresh
DROP TABLE IF EXISTS "privateChatMessages";
DROP TABLE IF EXISTS "generalChatMessages";
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS "warehouseRequests";
DROP TABLE IF EXISTS "immediateTasks";
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT,
    role TEXT,
    company TEXT,
    avatar TEXT,
    status TEXT,
    "lastSeen" TIMESTAMPTZ,
    "birthDate" DATE,
    "profilePicture" TEXT,
    "position" TEXT,
    "hireDate" DATE,
    "workStatus" TEXT
);

-- Create other tables
CREATE TABLE projects ( id TEXT PRIMARY KEY, name TEXT, client TEXT, status TEXT, "dueDate" TEXT, "dueTime" TEXT, team TEXT[], "eventType" TEXT, "linkedTickets" TEXT[] );
CREATE TABLE clients ( id TEXT PRIMARY KEY, name TEXT, email TEXT, phone TEXT, company TEXT );
CREATE TABLE invoices ( id TEXT PRIMARY KEY, "clientId" TEXT, "projectId" TEXT, "clientName" TEXT, "salespersonId" TEXT, ncf TEXT, amount REAL, status TEXT, "issueDate" TEXT, "dueDate" TEXT, items JSONB, notes TEXT, "firstPayment" REAL, "subsequentPayments" REAL, "commissionPaid" BOOLEAN );
CREATE TABLE tasks ( id TEXT PRIMARY KEY, title TEXT, "projectId" TEXT, status TEXT, "dueDate" TEXT );
CREATE TABLE tickets ( id TEXT PRIMARY KEY, title TEXT, description TEXT, "requesterId" TEXT, "requesterType" TEXT, "assigneeId" TEXT, status TEXT, priority TEXT, "createdAt" TEXT, "closedAt" TEXT, comments JSONB );
CREATE TABLE "immediateTasks" ( id TEXT PRIMARY KEY, title TEXT, "userId" TEXT, status TEXT, "projectId" TEXT, notes TEXT, comments JSONB );
CREATE TABLE "warehouseRequests" ( id TEXT PRIMARY KEY, "projectId" TEXT, "requesterId" TEXT, status TEXT, "requestDate" TEXT, "requiredByDate" TEXT, items JSONB, notes TEXT, comments JSONB );
CREATE TABLE notifications ( id BIGSERIAL PRIMARY KEY, message TEXT, link TEXT, "createdAt" TIMESTAMPTZ, read BOOLEAN, "userId" TEXT );
CREATE TABLE "generalChatMessages" ( id TEXT PRIMARY KEY, "senderId" TEXT, content TEXT, "createdAt" TIMESTAMPTZ, read BOOLEAN, "recipientId" TEXT );
CREATE TABLE "privateChatMessages" ( id TEXT PRIMARY KEY, "senderId" TEXT, content TEXT, "createdAt" TIMESTAMPTZ, read BOOLEAN, "recipientId" TEXT );
CREATE TABLE permissions ( id INT PRIMARY KEY, data JSONB );

-- Insert the default permissions row
INSERT INTO permissions (id, data) VALUES (1, '{"Super-Admin":{"Dashboard":true,"Analytics":true,"Recursos Humanos":true,"Administración y Supervisión":true,"Trabajo inmediato":true,"Tickets":true,"Projects":true,"Tasks":true,"Chat":true,"Invoices":true,"Clients":true,"Services":true,"Warehouse":true,"Montaje":true,"Reparto":true,"Cuentas por Cobrar":true,"Nuestras Fiestas":true,"Users & Companies":true,"Settings":true},"Admin":{"Dashboard":true,"Analytics":true,"Recursos Humanos":true,"Administración y Supervisión":true,"Trabajo inmediato":true,"Tickets":true,"Projects":true,"Tasks":true,"Chat":true,"Invoices":true,"Clients":true,"Services":true,"Warehouse":true,"Montaje":true,"Reparto":true,"Cuentas por Cobrar":true,"Nuestras Fiestas":true,"Users & Companies":true,"Settings":true},"Agent":{"Dashboard":true,"Analytics":false,"Recursos Humanos":false,"Administración y Supervisión":false,"Trabajo inmediato":true,"Tickets":true,"Projects":true,"Tasks":true,"Chat":true,"Invoices":true,"Clients":true,"Services":true,"Warehouse":true,"Montaje":true,"Reparto":true,"Cuentas por Cobrar":false,"Nuestras Fiestas":true,"Users & Companies":false,"Settings":false},"Viewer":{"Dashboard":false,"Analytics":false,"Recursos Humanos":false,"Administración y Supervisión":false,"Trabajo inmediato":true,"Tickets":true,"Projects":false,"Tasks":true,"Chat":true,"Invoices":false,"Clients":false,"Services":false,"Warehouse":true,"Montaje":true,"Reparto":true,"Cuentas por Cobrar":false,"Nuestras Fiestas":true,"Users & Companies":false,"Settings":false}}');

-- Insert the default users
INSERT INTO users (id, name, email, phone, password, role, company, status, "lastSeen", "birthDate", position, "workStatus", "hireDate")
VALUES
('user-super-admin-01', 'Super Admin', 'admin@segoeventos.com', '+12016671859', 'Mi123456@', 'Super-Admin', 'Sego Eventos Inc.', 'offline', '2025-09-03T02:19:30.654Z', '1988-07-22', 'Administrador de Sistema', 'Activo', '2010-01-01'),
('user-1756861699390', 'Sury Moreno', 'Suri.moreno@segoeventos.com', '+18096067888', 'Amelia170806', 'Admin', 'Sego Eventos Inc.', 'offline', '2025-09-03T02:23:16.614Z', '2025-09-02', 'Gerente General', 'Activo', '2010-01-01'),
('user-1756862405533', 'Raymond Perez', 'raymond@segoeventos.com', '+18498802678', 'Raymond123', 'Agent', 'Sego Eventos Inc.', 'offline', '2025-09-03T01:38:18.777Z', '2004-09-02', 'Agente de Ventas', 'Activo', null),
('user-1756863656286', 'Almacenes Sego', 'almacen@segoeventos.com', '+18097661121', 'almacen123', 'Viewer', 'Sego Eventos Inc.', 'offline', '2025-09-03T01:44:21.195Z', '2025-09-02', 'Encargado de Almacen', 'Activo', null);

-- Enable Row Level Security and allow public reads on users table for login
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public users are viewable by everyone." ON public.users FOR SELECT USING ( true );
