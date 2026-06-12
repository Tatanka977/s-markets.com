import { createServerFn } from "@tanstack/react-start";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: ChatMessage[]; system: string }) => d)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI gateway not configured");
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: data.system }, ...data.messages],
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`AI ${r.status}: ${txt.slice(0, 200)}`);
    }
    const json = await r.json();
    const reply: string = json?.choices?.[0]?.message?.content || "NO RESPONSE";
    return { reply };
  });
