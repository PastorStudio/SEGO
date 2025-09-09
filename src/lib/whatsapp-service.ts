'use server';

import makeWASocket, { DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { supabaseAdmin as supabase } from './supabase-client'; // Assuming supabase client is exported from here

// --- WhatsApp Service State ---

let sock: any;
let qrCode: string | null = null;
let connectionStatus: string = 'disconnected';
let serviceInitialized = false;

// --- Main Connection Logic ---

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // We will handle the QR code manually for the frontend
    });

    sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            qrCode = qr;
            connectionStatus = 'waiting_for_qr';
            console.log("QR Code generated. Scan with your phone via the frontend.");
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            connectionStatus = 'disconnected';
            console.log('Connection closed due to ', lastDisconnect?.error, ', reconnecting: ', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            qrCode = null;
            connectionStatus = 'connected';
            console.log('WhatsApp connection opened');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Listener for incoming messages
    sock.ev.on('messages.upsert', async (m: any) => {
        console.log("Received message:", JSON.stringify(m, undefined, 2));
        // TODO: Process the message, download media, and save to Supabase
    });

    return sock;
}

// --- Public Service Functions ---

export async function startWhatsAppService() {
    if (!serviceInitialized) {
        serviceInitialized = true;
        console.log("Starting WhatsApp service...");
        await connectToWhatsApp();
    } else {
        console.log("WhatsApp service already initialized.");
    }
}

export async function getWhatsAppStatus() {
    return {
        status: connectionStatus,
        qr: qrCode,
    };
}

export async function sendWhatsAppMessage(jid: string, text: string) {
    if (connectionStatus !== 'connected' || !sock) {
        throw new Error('WhatsApp not connected');
    }
    console.log(`Sending message to ${jid}: ${text}`);
    await sock.sendMessage(jid, { text });
}