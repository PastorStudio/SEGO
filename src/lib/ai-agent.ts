'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  addTask,
  addProject,
  addTicket,
  addWarehouseRequest,
  getFirstSuperAdmin,
  getTask,
  getProject,
  getTicket as getTicketById,
  getWarehouseRequest as getWarehouseRequestById,
  getProjectSummaryData,
  getProjects
} from './data';

const API_KEY = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

function getPrompt(command: string) {
    return `
    You are an intelligent command processing agent for the "Sego" event management system.
    Your task is to analyze a user's command in Spanish and translate it into a specific, structured JSON object representing a function call.
    You must identify the user's intent (e.g., creating a task, querying a ticket) and extract all necessary parameters.

    **STRICT RULES:**
    1.  Your response MUST be a single, valid JSON object. Do not include any text, explanations, or markdown before or after the JSON.
    2.  The "function" property in the JSON must be one of the functions listed below.
    3.  The "args" object must contain all the required parameters for that function. All text values in args must be in Spanish.
    4.  If a required parameter is missing, or if the intent is unclear, return { "function": "request_more_info", "args": { "message": "Necesito más información para procesar tu solicitud. Por favor, sé más específico." } }.
    // Example: User: "crea una tarea" => { "function": "request_more_info", "args": { "message": "Necesito más información para procesar tu solicitud. Por favor, sé más específico." } }
    6.  For dates, if the user says "mañana", calculate the date relative to today, which is ${new Date().toISOString().split('T')[0]}, and format it as 'YYYY-MM-DD'.

    **Function Signatures & Required Fields:**
    // --- WRITE (CREATE) FUNCTIONS ---
    - addTask: { description: "Crea una nueva tarea en un proyecto específico.", args: { projectId: string, title: string, dueDate?: string } }
    - addProject: { description: "Crea un nuevo proyecto.", args: { name: string, client: string, dueDate?: string } }
    - addTicket: { description: "Crea un nuevo ticket.", args: { title: string, description: string, priority?: 'Baja' | 'Media' | 'Alta' } }
    - addWarehouseRequest: { description: "Crea una nueva solicitud de almacén para un proyecto.", args: { projectId: string, notes?: string, items: { itemName: string, quantity: number }[] } }
    
    // --- READ (QUERY) FUNCTIONS ---
    - getTask: { description: "Obtiene los detalles de una tarea específica por su ID.", args: { taskId: string } }
    - getProject: { description: "Obtiene los detalles de un proyecto específico por su ID.", args: { projectId: string } }
    - getTicket: { description: "Obtiene los detalles de un ticket específico por su ID.", args: { ticketId: string } }
    - getWarehouseRequest: { description: "Obtiene los detalles de una solicitud de almacén específica por su ID.", args: { requestId: string } }
    - getProjectSummary: { description: "Obtiene un resumen del estado de un proyecto, incluyendo sus tareas y solicitudes de almacén. Puede inferir el nombre del proyecto de la conversación.", args: { projectName: string } }
    - listAllProjectNames: { description: "Lista todos los nombres de los proyectos registrados en el sistema. No requiere argumentos.", args: {} }
    // Example: User: "lista todos los proyectos" => { "function": "listAllProjectNames", "args": {} }

    **User Command:**
    "${command}"

    **Your JSON Response:**
    `;
}

export async function processNaturalLanguageCommand(command: string): Promise<{ success: boolean; message: string; data?: any; }> {
  if (!command) {
    return { success: false, message: "El comando no puede estar vacío." };
  }

  const prompt = getPrompt(command);

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json\n|```/g, '').trim();
    console.log("AI Raw Response Text:", responseText);
    const action = JSON.parse(responseText);
    console.log("AI Parsed Action:", action);
    console.log("AI Action Function:", action.function);

    const adminUser = await getFirstSuperAdmin();
    if (!adminUser) {
      return { success: false, message: "No se encontró un usuario administrador para realizar la acción." };
    }

    switch (action.function) {
      // --- WRITE CASES ---
      case 'addTask':
        if (!action.args.projectId || !action.args.title) return { success: false, message: "Para crear una tarea, se requiere el ID del proyecto y un título." };
        const newTask = await addTask({ status: 'To Do', ...action.args }, adminUser.name);
        return { success: true, message: `Tarea "${newTask.title}" creada exitosamente.` };

      case 'addProject':
         if (!action.args.name || !action.args.client) return { success: false, message: "Para crear un proyecto, se requiere un nombre y un cliente." };
        const newProject = await addProject({ status: 'On Track', team: [], ...action.args }, adminUser.name);
        return { success: true, message: `Proyecto "${newProject.name}" creado exitosamente.` };
      
      case 'addTicket':
        if (!action.args.title || !action.args.description) return { success: false, message: "Para crear un ticket, se requiere un título y una descripción." };
        const newTicket = await addTicket({ status: 'Abierto', priority: 'Media', requesterId: adminUser.id, requesterType: 'user', assigneeId: null, ...action.args });
        return { success: true, message: `Ticket "${newTicket.title}" creado exitosamente.` };

      case 'addWarehouseRequest':
        if (!action.args.projectId || !action.args.items || action.args.items.length === 0) return { success: false, message: "Para una solicitud de almacén, se requiere el ID del proyecto y al menos un artículo." };
        const newRequest = await addWarehouseRequest({ requesterId: adminUser.id, status: 'Pending', requestDate: new Date().toISOString().split('T')[0], ...action.args }, adminUser.name);
        return { success: true, message: `Solicitud de almacén para el proyecto ${newRequest.projectId} creada.` };

      // --- READ CASES ---
      case 'getTask':
        if (!action.args.taskId) return { success: false, message: "Por favor, proporciona el ID de la tarea." };
        const task = await getTask(action.args.taskId);
        return task 
            ? { success: true, message: `La tarea '${task.title}' tiene el estado: ${task.status}.` }
            : { success: false, message: `No se encontró la tarea con ID ${action.args.taskId}.` };

      case 'getProject':
        if (!action.args.projectId) return { success: false, message: "Por favor, proporciona el ID del proyecto." };
        const project = await getProject(action.args.projectId);
        return project
            ? { success: true, message: `El proyecto '${project.name}' tiene el estado: ${project.status}.` }
            : { success: false, message: `No se encontró el proyecto con ID ${action.args.projectId}.` };

      case 'getTicket':
        if (!action.args.ticketId) return { success: false, message: "Por favor, proporciona el ID del ticket." };
        const ticket = await getTicketById(action.args.ticketId);
        return ticket
            ? { success: true, message: `El ticket '${ticket.title}' tiene el estado: ${ticket.status} y prioridad ${ticket.priority}.` }
            : { success: false, message: `No se encontró el ticket con ID ${action.args.ticketId}.` };

      case 'getWarehouseRequest':
        if (!action.args.requestId) return { success: false, message: "Por favor, proporciona el ID de la solicitud." };
        const request = await getWarehouseRequestById(action.args.requestId);
        return request
            ? { success: true, message: `La solicitud de almacén ${request.id} para el proyecto ${request.projectId} tiene el estado: ${request.status}.` }
            : { success: false, message: `No se encontró la solicitud con ID ${action.args.requestId}.` };

      case 'getProjectSummary':
        if (!action.args.projectName) return { success: false, message: "Por favor, proporciona el nombre o ID del proyecto para el resumen." };
        const summaryData = await getProjectSummaryData(action.args.projectName);
        if (!summaryData) {
            return { success: false, message: `No se encontró ningún proyecto que coincida con "${action.args.projectName}".` };
        }
        if (summaryData.ambiguous) {
            const projectList = summaryData.matches.map((name: string) => `- ${name}`).join('\n');
            return { success: false, message: `Encontré varios proyectos que coinciden con "${action.args.projectName}":\n${projectList}\nPor favor, sé más específico.` };
        }

        const summaryPrompt = `
            Eres un asistente experto en gestión de proyectos.
            Aquí tienes datos detallados sobre un proyecto, sus tareas y solicitudes de almacén.
            Tu tarea es proporcionar un resumen conciso y útil del estado general del proyecto.
            Destaca los puntos clave, el progreso, los elementos pendientes y cualquier información relevante.
            Todo el resumen debe ser en español.

            Datos del Proyecto:
            ${JSON.stringify(summaryData, null, 2)}

            Resumen del Estado del Proyecto:
        `;
        const summaryResult = await model.generateContent(summaryPrompt);
        const summaryText = summaryResult.response.text();
        return { success: true, message: summaryText };

      case 'listAllProjectNames':
        const projectListResult = await listAllProjectNames();
        return projectListResult;

      // --- DEFAULT CASE ---
      case 'request_more_info':
        return { success: false, message: action.args.message, data: { needsMoreInfo: true } };

      default:
        return { success: false, message: "No se pudo reconocer la acción solicitada en tu comando." };
    }
  } catch (error) {
    console.error("Error processing AI command:", error);
    return { success: false, message: "Hubo un error al interpretar tu comando. Inténtalo de nuevo con más detalles." };
  }
}

export async function listAllProjectNames(): Promise<{ success: boolean; message: string; }> {
    const projects = await getProjects(); // Assuming getProjects is imported from data.ts
    if (!projects || projects.length === 0) {
        return { success: true, message: "No hay proyectos registrados en el sistema." };
    }
    const projectNames = projects.map(p => `- ${p.name}`).join('\n');
    return { success: true, message: `Proyectos registrados:\n${projectNames}` };
}