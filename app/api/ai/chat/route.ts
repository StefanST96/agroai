import { NextResponse } from "next/server";
import {
  appendAiMessage,
  createAiConversation,
  getAiConversationById,
  getCurrentUser,
  getLatestAiConversationByUser,
  touchAiConversation,
} from "@/lib/db";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const AI_PROVIDER = (process.env.AI_PROVIDER || "auto").toLowerCase();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

function buildSystemPrompt() {
  return [
    "Ti si AgroAI asistent za poljoprivredu u Srbiji.",
    "Odgovaraj jasno, prakticno i na srpskom jeziku.",
    "Kada nisi siguran, to jasno reci i ponudi sledeci korak provere.",
    "Ne izmisljaj zakonske detalje, cene ili rokove ako nisu dati u kontekstu.",
    "Fokus: zastita bilja, prihrana, navodnjavanje, subvencije, organizacija radova.",
    "Odgovori sa kratkim planom koraka i konkretnim preporukama.",
  ].join(" ");
}

function mapHistoryToProviderMessages(messages: Array<{ role: string; content: string }>, question: string): ChatMessage[] {
  const history = messages.slice(-12).map((msg) => {
    const role = msg.role === "ASSISTANT" ? "assistant" : msg.role === "SYSTEM" ? "system" : "user";
    return {
      role,
      content: msg.content,
    } as ChatMessage;
  });

  return [
    {
      role: "system",
      content: buildSystemPrompt(),
    },
    ...history,
    {
      role: "user",
      content: question,
    },
  ];
}

async function callOpenAI(messages: ChatMessage[]) {
  if (!OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}

async function callOllama(messages: ChatMessage[]) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.4,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const content = data?.message?.content;
  return typeof content === "string" && content.trim() ? content.trim() : null;
}

function providerOrder() {
  if (AI_PROVIDER === "openai") return ["openai"] as const;
  if (AI_PROVIDER === "ollama") return ["ollama"] as const;
  if (OPENAI_API_KEY) return ["openai", "ollama"] as const;
  return ["ollama", "openai"] as const;
}

async function buildAssistantReply(messages: Array<{ role: string; content: string }>, question: string) {
  const providerMessages = mapHistoryToProviderMessages(messages, question);
  const order = providerOrder();
  const errors: string[] = [];

  for (const provider of order) {
    try {
      const response = provider === "openai"
        ? await callOpenAI(providerMessages)
        : await callOllama(providerMessages);
      if (response) {
        return response;
      }
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  const reasons = errors.length ? ` Tehnicki detalj: ${errors[0]}` : "";
  return `Trenutno ne mogu da dobijem odgovor od AI servisa.${reasons} Proverite OPENAI_API_KEY ili pokrenite Ollama model i pokusajte ponovo.`;
}

export async function GET(request: Request) {
  const currentUser = await getCurrentUser(request);
  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const conversation = await getLatestAiConversationByUser(currentUser.id);
  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }
  return NextResponse.json(conversation);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = typeof body.question === "string" ? body.question : "";
  const title = typeof body.title === "string" ? body.title : "Nova AI konverzacija";

  const currentUser = await getCurrentUser(request);

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  if (!currentUser) {
    return NextResponse.json({ error: "No current user." }, { status: 401 });
  }

  const latestForUser = await getLatestAiConversationByUser(currentUser.id);
  const assistantReply = await buildAssistantReply(latestForUser?.messages || [], question);

  if (latestForUser) {
    await appendAiMessage({
      conversationId: latestForUser.id,
      role: "USER",
      content: question,
    });

    await appendAiMessage({
      conversationId: latestForUser.id,
      role: "ASSISTANT",
      content: assistantReply,
    });

    await touchAiConversation(latestForUser.id);
    const updatedConversation = await getAiConversationById(latestForUser.id);
    return NextResponse.json(updatedConversation, { status: 201 });
  }

  const conversation = await createAiConversation({
    userId: currentUser.id,
    title,
    firstMessage: question,
    firstAssistantMessage: assistantReply,
  });

  return NextResponse.json(conversation, { status: 201 });
}
