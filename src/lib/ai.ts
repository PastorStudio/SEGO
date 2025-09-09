'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY!;
console.log('GEMINI_API_KEY:', API_KEY ? 'Loaded' : 'Not Loaded');

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateProjectSuggestions(projectDescription: string): Promise<string> {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables.');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

  const prompt = `
  Eres un asistente experto en gestión de proyectos para una empresa de eventos llamada Sego.
  Basado en la siguiente descripción de un proyecto, genera sugerencias para los siguientes pasos.

  **REGLAS ESTRICTAS:**
  1.  Tu respuesta DEBE ser un único objeto JSON válido. No incluyas texto antes o después del JSON.
  2.  El idioma de TODO el texto en tu respuesta DEBE ser español.
  3.  Para las tareas, sugiere un título y una fecha de entrega tentativa ('dueDate').
  4.  Para los tickets, sugiere un título, una descripción y una prioridad ('Baja', 'Media', 'Alta').
  5.  Para las solicitudes de almacén, sugiere una lista de objetos, cada uno con un 'itemName' de artículo y una 'quantity'.

  **Descripción del Proyecto:**
  "${projectDescription}"

  **Formato de Salida JSON Esperado:**
  {
    "tasks": [
      { "title": "Título de la tarea en español", "dueDate": "YYYY-MM-DD" }
    ],
    "tickets": [
      { "title": "Título del ticket en español", "description": "Descripción del problema o necesidad.", "priority": "Media" }
    ],
    "warehouseRequests": [
      { "itemName": "Nombre del artículo", "quantity": 1 }
    ]
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error: any) {
    console.error("Error generating content from Gemini API:", error);
    console.error("Full error object:", JSON.stringify(error, null, 2)); // Log the full error object
    if (error.response) {
      console.error("Gemini API Response Error:", error.response);
      console.error("Gemini API Response Error Status:", error.response.status);
      console.error("Gemini API Response Error Text:", await error.response.text());
    }
    throw new Error("Failed to generate suggestions from AI.");
  }
}

export async function listAvailableModels(): Promise<void> {
  if (!API_KEY) {
    console.error('GEMINI_API_KEY is not set. Cannot list models.');
    return;
  }
  try {
    // @ts-ignore
    const { models } = await genAI.listModels();
    console.log('Available Gemini Models:');
    for (const model of models) {
      console.log(`- Name: ${model.name}, Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
    }
  } catch (error) {
    console.error('Error listing Gemini models:', error);
  }
}
