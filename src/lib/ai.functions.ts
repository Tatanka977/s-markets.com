import { createServerFn } from "@tanstack/react-start";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: ChatMessage[]; system: string }) => d)
  .handler(async ({ data }) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const model = "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = data.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const today = new Date().toLocaleDateString("it-IT", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const systemWithDate = `${data.system}\n\nOggi è ${today}. Usa sempre questa data come riferimento per qualsiasi domanda relativa al tempo, non fare assunzioni basate su altre date.`;

    const body = {
      contents,
      systemInstruction: { parts: [{ text: systemWithDate }] },
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`AI ${r.status}: ${txt.slice(0, 200)}`);
    }

    const json = await r.json();
    const reply: string =
      json?.candidates?.[0]?.content?.parts?.[0]?.text || "NO RESPONSE";

    return { reply };
  });
