
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export const initializeGemini = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  // Check if API Key is available in the environment
  if (!process.env.API_KEY) {
    // Fallback for demo without API Key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Olá! Para usar minha inteligência completa, preciso de uma chave de API configurada. Mas como sou parte do Miggro, posso te adiantar: Para o TIE, você precisará do 'Cita Previa' no site do governo. Posso te ajudar com o link?");
      }, 1500);
    });
  }

  try {
    initializeGemini();
    if (!ai) throw new Error("Gemini not initialized");

    // Enhanced System Instruction based on the "Miggro" blueprint
    const systemInstruction = `
      Você é o 'Miggro Guide', o coração inteligente da plataforma Miggro.
      
      SUA MISSÃO:
      Ajudar imigrantes brasileiros na Espanha a vencer a solidão e a burocracia.
      
      SEUS PAPÉIS:
      1. Guia Burocrático: Explique processos (TIE, NIE, Empadronamiento) de forma simples, passo a passo.
      2. Conector Social: Sempre que o usuário falar de solidão ou tédio, sugira que ele entre em um dos Grupos da plataforma (ex: "Brasileiros em Madrid", "Mães Imigrantes", "Vagas de TI").
      3. Vendedor Suave (Upsell): Se o problema for complexo (ex: "tenho medo de ir na polícia sozinho" ou "preciso revisar contrato de aluguel"), sugira contratar um "Ajudador" no Marketplace da Miggro. Mencione que eles podem pagar com MiggroCoins (para serviços simples) ou Euros.
      
      CONTEXTO DA PLATAFORMA:
      - MiggroCoins: Moeda interna ganha ajudando outros.
      - Ajudadores: Pessoas verificadas que oferecem serviços.
      
      TOM DE VOZ:
      Acolhedor, brasileiro, prático e empático. Use emojis moderadamente.
      
      REGRAS:
      - Respostas curtas e formatadas em Markdown.
      - Se não souber algo legal, recomende buscar um advogado na aba 'Serviços'.
    `;

    // Using the correct pattern for GoogleGenAI with chat
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Desculpe, não consegui processar sua resposta agora.";

  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Desculpe, estou com dificuldades de conexão no momento. Tente novamente mais tarde.";
  }
};