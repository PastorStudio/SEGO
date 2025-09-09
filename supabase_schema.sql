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
DROP TABLE IF EXISTS time_entries; -- Added this line
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS users;

-- Create the users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
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

-- Create time_entries table for clock in/out
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    clock_in_time TIMESTAMPTZ NOT NULL,
    clock_out_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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



-- Enable Row Level Security and allow public reads on users table for login
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public users are viewable by everyone." ON public.users FOR SELECT USING ( true );

-- WhatsApp Integration Tables

-- Stores individual chat sessions/conversations
CREATE TABLE whatsapp_chats (
    jid TEXT PRIMARY KEY, -- The WhatsApp ID for the user or group
    name TEXT, -- The contact's or group's name
    last_message_timestamp TIMESTAMPTZ,
    unread_count INT DEFAULT 0,
    archived BOOLEAN DEFAULT FALSE
);

-- Stores all incoming and outgoing messages
CREATE TABLE whatsapp_messages (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT UNIQUE NOT NULL, -- The unique ID from WhatsApp
    chat_jid TEXT NOT NULL REFERENCES whatsapp_chats(jid) ON DELETE CASCADE,
    sender_jid TEXT, -- JID of the sender, can be the user or the contact
    is_from_me BOOLEAN NOT NULL,
    message_type TEXT NOT NULL, -- e.g., 'text', 'image', 'audio', 'video', 'document'
    text_content TEXT,
    media_url TEXT, -- URL to the file in Supabase Storage
    mime_type TEXT,
    file_name TEXT,
    timestamp TIMESTAMPTZ NOT NULL
);

-- Stores internal notes for a WhatsApp contact, visible only to system users
CREATE TABLE whatsapp_contact_notes (
    id BIGSERIAL PRIMARY KEY,
    contact_jid TEXT NOT NULL, -- The WhatsApp ID of the contact
    author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- The system user who wrote the note
    note_content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_whatsapp_messages_chat_jid ON whatsapp_messages(chat_jid);
CREATE INDEX idx_whatsapp_contact_notes_contact_jid ON whatsapp_contact_notes(contact_jid);
