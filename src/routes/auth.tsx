import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Strategic Markets — Sign In" }] }),
  component: AuthPage,
});

const B = {
  bg: "#000", panel: "#0A0A0A", panel2: "#111",
  border: "#2A2A2A", blue: "#0066FF", white: "#FFF",
  gray1: "#CCC", gray2: "#888", gray3: "#555",
  red: "#FF3333", yellow: "#FFF200", cyan: "#0FF",
};

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const fontMono = "'Courier New', Courier, monospace";
  const API = (import.meta as any).env?.VITE_BACKEND_URL || "";

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const handleEmail = async (e: any) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const endpoint = mode === "signin" ? "/api/auth/login" : "/api/auth/register";
      const body: any = { email, password };
      if (mode === "signup") body.name = name || email.split("@")[0];
      const r = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || `HTTP ${r.status}`);
      navigate({ to: "/" });
    } catch (e: any) {
      setErr(e.message || "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: B.bg, display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16, fontFamily: fontMono }}>
      <div style={{ width: "100%", maxWidth: 380, background: B.panel, border: `1px solid ${B.border}` }}>
        <div style={{ background: B.blue, padding: "10px 14px" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: B.white, letterSpacing: "0.14em" }}>STRATEGIC MARKETS</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
            {mode === "signin" ? "SIGN IN TO TERMINAL" : "CREATE ACCOUNT"}
          </div>
        </div>

        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <button data-testid="google-signin-btn" onClick={handleGoogle} disabled={loading} style={{
            background: B.white, color: "#000", border: "none", padding: "10px 12px",
            fontWeight: 700, cursor: "pointer", fontFamily: fontMono, fontSize: 13, letterSpacing: "0.06em",
          }}>
            ▶ CONTINUE WITH GOOGLE
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
            <div style={{ flex: 1, height: 1, background: B.border }} />
            <span style={{ fontSize: 9, color: B.gray2, letterSpacing: "0.14em" }}>OR EMAIL</span>
            <div style={{ flex: 1, height: 1, background: B.border }} />
          </div>

          <form onSubmit={handleEmail} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mode === "signup" && (
              <input data-testid="auth-name-input" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="NAME" required minLength={1}
                style={inputStyle} />
            )}
            <input data-testid="auth-email-input" value={email} onChange={(e) => setEmail(e.target.value)}
              type="email" required placeholder="EMAIL" style={inputStyle} />
            <input data-testid="auth-password-input" value={password} onChange={(e) => setPassword(e.target.value)}
              type="password" required minLength={6} placeholder="PASSWORD (MIN 6)"
              style={inputStyle} />
            <button data-testid="auth-submit-btn" type="submit" disabled={loading} style={{
              background: B.blue, color: B.white, border: "none", padding: "10px 12px",
              fontWeight: 700, cursor: loading ? "wait" : "pointer",
              fontFamily: fontMono, fontSize: 13, letterSpacing: "0.1em", opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "..." : mode === "signin" ? "SIGN IN" : "SIGN UP"}
            </button>
          </form>

          {err && (
            <div style={{ fontSize: 11, color: B.red, padding: "6px 8px",
              background: "#1a0000", border: `1px solid ${B.red}` }}>⚠ {err}</div>
          )}

          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setErr(""); }}
            style={{ background: "none", border: "none", color: B.gray1, fontSize: 11,
              fontFamily: fontMono, cursor: "pointer", textDecoration: "underline", marginTop: 4 }}>
            {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
          </button>

          <Link to="/" style={{ fontSize: 10, color: B.gray2, textAlign: "center",
            fontFamily: fontMono, textDecoration: "none", marginTop: 4 }}>
            ← Back to terminal
          </Link>
        </div>
      </div>
    </div>
  );
}

const inputStyle: any = {
  background: B.bg, border: `1px solid ${B.border}`, color: B.gray1,
  padding: "8px 10px", fontSize: 12, fontFamily: "'Courier New', Courier, monospace",
  outline: "none", letterSpacing: "0.04em", textTransform: "uppercase",
};
