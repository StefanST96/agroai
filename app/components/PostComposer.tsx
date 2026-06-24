"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import ZoomableProfileImage from "./ZoomableProfileImage";

type Props = {
  userAvatar: string;
  id?: string;
};

export default function PostComposer({ userAvatar, id }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File, kind: "image" | "video") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kind", kind);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || typeof data.url !== "string" || typeof data.assetId !== "number") {
      throw new Error(data.error ?? "Upload nije uspeo.");
    }

    return {
      url: data.url as string,
      assetId: data.assetId as number,
    };
  }

  function togglePollMode() {
    setPollEnabled((prev) => !prev);
    setError("");

    if (pollEnabled) {
      setPollQuestion("");
      setPollOptions(["", ""]);
    }
  }

  function updatePollOption(index: number, value: string) {
    setPollOptions((prev) => prev.map((option, i) => (i === index ? value : option)));
  }

  function addPollOption() {
    setPollOptions((prev) => (prev.length >= 4 ? prev : [...prev, ""]));
  }

  function removePollOption(index: number) {
    setPollOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, i) => i !== index)));
  }

  function buildPollPayload() {
    if (!pollEnabled) return null;

    const question = pollQuestion.trim();
    const options = pollOptions.map((item) => item.trim()).filter(Boolean);

    if (question.length < 4) {
      setError("Unesite pitanje ankete (bar 4 karaktera).");
      return null;
    }

    if (options.length < 2) {
      setError("Anketa mora imati najmanje 2 opcije.");
      return null;
    }

    return { question, options: options.slice(0, 4) };
  }

  function cycleCategory() {
    const categories = ["GENERAL", "QUESTION", "MARKET", "SUBSIDY", "DISEASE"];
    const currentIndex = categories.indexOf(category);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % categories.length;
    setCategory(categories[nextIndex]);
  }

  function getCategoryLabel(value: string) {
    switch (value) {
      case "SUBSIDY":
        return "Subvencije";
      case "QUESTION":
        return "Pitanje";
      case "MARKET":
        return "Trziste";
      case "DISEASE":
        return "Bolesti";
      default:
        return "Opste";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const pollPayload = buildPollPayload();
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) {
      setError("Unesite naslov objave.");
      return;
    }

    if (!normalizedDescription) {
      setError("Unesite opis objave.");
      return;
    }

    if (pollEnabled && !pollPayload) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      let uploadedImageUrl: string | undefined;
      let uploadedImageAssetId: number | undefined;
      let uploadedVideoAssetId: number | undefined;

      if (imageFile) {
        const uploaded = await uploadFile(imageFile, "image");
        uploadedImageUrl = uploaded.url;
        uploadedImageAssetId = uploaded.assetId;
      }

      if (videoFile) {
        const uploaded = await uploadFile(videoFile, "video");
        uploadedVideoAssetId = uploaded.assetId;
      }

      const pollMarker = pollPayload
        ? `<!--POLL:${encodeURIComponent(JSON.stringify(pollPayload))}-->`
        : "";
      const finalContent = `${pollMarker}${pollMarker ? "\n" : ""}${normalizedDescription}`.trim();

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: normalizedTitle,
          content: finalContent,
          category,
          imageUrl: uploadedImageUrl,
          imageAssetId: uploadedImageAssetId,
          videoAssetId: uploadedVideoAssetId,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error ?? "Objava nije sacuvana.");
        return;
      }

      setTitle("");
      setDescription("");
      setPollEnabled(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setImageFile(null);
      setVideoFile(null);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Objava nije sacuvana.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit} id={id}>
      <ZoomableProfileImage src={userAvatar} alt="Korisnik" />
      <div className="composer-body">
        <input
          placeholder="Naslov objave"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          placeholder="Opis objave"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            setImageFile(event.target.files?.[0] ?? null);
          }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          style={{ display: "none" }}
          onChange={(event) => {
            setVideoFile(event.target.files?.[0] ?? null);
          }}
        />
        <div className="composer-tools">
          <button type="button" onClick={() => imageInputRef.current?.click()}>
            Dodaj sliku{imageFile ? ` (${imageFile.name})` : ""}
          </button>
          <button type="button" onClick={() => videoInputRef.current?.click()}>
            Video{videoFile ? ` (${videoFile.name})` : ""}
          </button>
          <button type="button" onClick={togglePollMode} className={pollEnabled ? "poll-toggle active" : "poll-toggle"}>
            {pollEnabled ? "Anketa ukljucena" : "Anketa"}
          </button>
          <button type="button" onClick={cycleCategory}>
            Oznaka: {getCategoryLabel(category)}
          </button>
          <button className="publish-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Objavljujem..." : "Objavi"}
          </button>
        </div>

        {pollEnabled ? (
          <div className="poll-builder">
            <label className="field">
              <span>Pitanje ankete</span>
              <input
                value={pollQuestion}
                onChange={(event) => setPollQuestion(event.target.value)}
                placeholder="Npr. Koji preparat vam je dao bolji rezultat?"
              />
            </label>

            <div className="poll-builder-options">
              {pollOptions.map((option, index) => (
                <div className="poll-option-row" key={`poll-option-${index}`}>
                  <input
                    value={option}
                    onChange={(event) => updatePollOption(index, event.target.value)}
                    placeholder={`Opcija ${index + 1}`}
                  />
                  {pollOptions.length > 2 ? (
                    <button type="button" onClick={() => removePollOption(index)}>
                      Ukloni
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <button type="button" className="button secondary poll-add-option" onClick={addPollOption} disabled={pollOptions.length >= 4}>
              Dodaj opciju
            </button>
          </div>
        ) : null}

        {error ? <p className="error-text">{error}</p> : null}
      </div>
    </form>
  );
}
