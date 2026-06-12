import { createServerFn } from "@tanstack/react-start";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const aiChat = createServerFn({ method: "POST" })
  .inputValidator((d: { messages: ChatMessage[]; system: string }) => d)
  .handler(async ({ data }) => {
    const backendUrl = process.env.EMERGENT_BACKEND_URL || "http://localhost:8001";
    const r = await fetch(`${backendUrl}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: data.messages,
        system: data.system,
        provider: "gemini",
        model: "gemini-2.5-flash",
      }),
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`AI ${r.status}: ${txt.slice(0, 200)}`);
    }
    const json = await r.json();
    const reply: string = json?.reply || "NO RESPONSE";
    return { reply };
  });
