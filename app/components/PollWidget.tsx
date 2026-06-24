"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  postId: number;
  question: string;
  options: string[];
};

type PollState = {
  question: string;
  options: string[];
  counts: number[];
  totalVotes: number;
  userVoteIndex: number | null;
};

export default function PollWidget({ postId, question, options }: Props) {
  const [state, setState] = useState<PollState>({
    question,
    options,
    counts: options.map(() => 0),
    totalVotes: 0,
    userVoteIndex: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState("");

  const hasVotes = useMemo(() => state.totalVotes > 0, [state.totalVotes]);

  async function loadPoll() {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}/poll`);
      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        setError("Anketa trenutno nije dostupna.");
        return;
      }

      setState({
        question: data.question,
        options: Array.isArray(data.options) ? data.options : options,
        counts: Array.isArray(data.counts) ? data.counts : options.map(() => 0),
        totalVotes: typeof data.totalVotes === "number" ? data.totalVotes : 0,
        userVoteIndex: typeof data.userVoteIndex === "number" ? data.userVoteIndex : null,
      });
      setError("");
    } finally {
      setIsLoading(false);
    }
  }

  async function vote(optionIndex: number) {
    if (isVoting) return;

    try {
      setIsVoting(true);
      setError("");

      const response = await fetch(`/api/posts/${postId}/poll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIndex }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        setError(data?.error ?? "Glasanje nije uspelo.");
        return;
      }

      setState({
        question: data.question,
        options: Array.isArray(data.options) ? data.options : state.options,
        counts: Array.isArray(data.counts) ? data.counts : state.counts,
        totalVotes: typeof data.totalVotes === "number" ? data.totalVotes : state.totalVotes,
        userVoteIndex: typeof data.userVoteIndex === "number" ? data.userVoteIndex : optionIndex,
      });
    } finally {
      setIsVoting(false);
    }
  }

  useEffect(() => {
    loadPoll();
  }, [postId]);

  return (
    <section className="poll-widget">
      <h3>{state.question}</h3>

      <div className="poll-options">
        {state.options.map((option, index) => {
          const count = state.counts[index] ?? 0;
          const percent = hasVotes ? Math.round((count / state.totalVotes) * 100) : 0;
          const selected = state.userVoteIndex === index;

          return (
            <button
              key={`${option}-${index}`}
              type="button"
              className={`poll-choice ${selected ? "selected" : ""}`}
              onClick={() => vote(index)}
              disabled={isVoting || isLoading}
            >
              <span className="poll-choice-label">{option}</span>
              <span className="poll-choice-meta">{count} glasova · {percent}%</span>
              <span className="poll-choice-fill" style={{ width: `${percent}%` }} aria-hidden />
            </button>
          );
        })}
      </div>

      <div className="poll-footer">
        <small className="muted">Ukupno glasova: {state.totalVotes}</small>
        {state.userVoteIndex !== null ? <small className="poll-voted">Glasali ste</small> : null}
      </div>

      {error ? <p className="form-feedback error">{error}</p> : null}
    </section>
  );
}
