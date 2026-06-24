"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Message = {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

type Props = {
  initialMessages: Message[];
  suggestions: string[];
};

export default function AiChatPanel({ initialMessages, suggestions }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendQuestion(rawQuestion: string) {
    const trimmed = rawQuestion.trim();
    if (!trimmed) {
      setError("Unesite pitanje za AI asistenta.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Razgovor sa AI asistentom",
          question: trimmed,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "AI odgovor nije dostupan.");
        return;
      }

      const newMessages = Array.isArray(data.messages) ? data.messages : [];
      if (newMessages.length) {
        setMessages(newMessages);
      }
      setQuestion("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendQuestion(question);
  }

  return (
    <>
      <div className="message-list">
        {messages.length ? (
          messages.map((message, index) => (
            <div
              className={`message ${message.role.toLowerCase()}`}
              key={`${message.role}-${index}-${message.content.slice(0, 10)}`}
            >
              <p>{message.content}</p>
            </div>
          ))
        ) : (
          <div className="empty-result">
            <strong>Nema poruka</strong>
            <p className="muted">Postavite pitanje i AI asistent ce zapoceti razgovor.</p>
          </div>
        )}
      </div>

      <form className="ai-input" onSubmit={handleSubmit}>
        <input
          placeholder="Npr. Sta da radim ako list maline zuti posle kise?"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? "Slanje..." : "Posalji"}
        </button>
      </form>

      {error ? <p className="form-feedback error">{error}</p> : null}

      <div className="suggestion-list" style={{ marginTop: 12 }}>
        {suggestions.map((suggestion) => (
          <button
            type="button"
            key={suggestion}
            onClick={() => {
              setQuestion(suggestion);
              sendQuestion(suggestion);
            }}
            disabled={loading}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </>
  );
}
