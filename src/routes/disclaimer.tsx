import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({ meta: [{ title: "Moneta — Informativa Regolamentare" }] }),
  component: DisclaimerPage,
});

const B = {
  bg: "#000000", panel: "#0A0A0A", panel2: "#111111",
  border: "#2A2A2A", blue: "#0066FF", white: "#FFFFFF",
  yellow: "#FFFF00", cyan: "#00FFFF", gray1: "#CCCCCC", gray2: "#888888",
};

function Section({ title, children }: any) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h2 style={{
        fontSize: 18, color: B.yellow, fontFamily: "'Courier New',monospace",
        fontWeight: 700, letterSpacing: "0.08em", margin: "0 0 8px 0",
        borderBottom: `1px solid ${B.blue}`, paddingBottom: 4,
      }}>
        ▸ {title}
      </h2>
      <div style={{ fontSize: 14, color: B.gray1, lineHeight: 1.65, fontFamily: "'Courier New',monospace" }}>
        {children}
      </div>
    </section>
  );
}

function DisclaimerPage() {
  return (
    <div style={{
      minHeight: "100vh", background: B.bg, color: B.gray1,
      fontFamily: "'Courier New',Courier,monospace", padding: "20px",
    }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{
          background: B.blue, padding: "10px 14px", display: "flex",
          justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 22, color: B.white, fontWeight: 700, letterSpacing: "0.16em" }}>
              MONETA
            </div>
            <div style={{ fontSize: 12, color: B.white, letterSpacing: "0.1em", opacity: 0.85 }}>
              INFORMATIVA REGOLAMENTARE — TERMS & DISCLAIMER
            </div>
          </div>
          <Link to="/" style={{
            color: B.white, textDecoration: "none", fontSize: 14, fontWeight: 700,
            border: `1px solid ${B.white}`, padding: "4px 10px", letterSpacing: "0.08em",
          }}>
            ← TORNA AL TERMINALE
          </Link>
        </div>

        <div style={{
          background: "#1a0f00", border: `1px solid ${B.yellow}`,
          padding: "10px 14px", margin: "14px 0", color: B.yellow,
          fontSize: 14, lineHeight: 1.5, letterSpacing: "0.02em",
        }}>
          ⚠ <b>NOTA INFORMATIVA — LEGGERE ATTENTAMENTE.</b> Moneta è un terminale di
          analisi educativa e informativa. Il contenuto non costituisce, né deve
          essere interpretato come, consulenza finanziaria, raccomandazione di
          investimento, sollecitazione, offerta o invito ad acquistare o vendere
          strumenti finanziari ai sensi della <b>Direttiva 2014/65/UE (MiFID II)</b>,
          del <b>D.Lgs. 58/1998 (TUF)</b>, del <b>Regolamento UE 2017/565</b>,
          del <b>Securities Act of 1933</b>, del <b>Securities Exchange Act of 1934</b>
          o di altra normativa applicabile.
        </div>

        <Section title="1. Natura del Servizio">
          Moneta è una piattaforma di <b>educazione finanziaria</b>, simulazione di
          portafogli e visualizzazione di dati di mercato. I prezzi e le metriche
          mostrate provengono da provider terzi (Finnhub, dati di mercato pubblici)
          e possono essere ritardate, mock, o inesatte. L'AI integrata produce
          osservazioni quantitative e scenari ipotetici a scopo didattico.
        </Section>

        <Section title="2. Assenza di Consulenza Finanziaria">
          <p style={{ margin: "0 0 8px 0" }}>
            Moneta <b>non è un consulente finanziario abilitato</b>, non è iscritta
            all'albo OCF, non è autorizzata da CONSOB, SEC, FCA, BaFin o altra
            autorità di vigilanza ad esercitare servizi di:
          </p>
          <ul style={{ margin: "0 0 8px 18px", padding: 0 }}>
            <li>consulenza in materia di investimenti (art. 1, c. 5-septies TUF);</li>
            <li>gestione di portafogli;</li>
            <li>ricezione e trasmissione di ordini;</li>
            <li>collocamento o sollecitazione del pubblico risparmio.</li>
          </ul>
          <p style={{ margin: 0 }}>
            Tutte le indicazioni numeriche, le analisi statistiche, gli scenari di
            allocazione e le risposte dell'AI sono <b>per scopi educativi e
            informativi</b>. Frasi come "compra", "vendi", "investi", "buy/sell",
            ove dovessero apparire nei risultati AI, sono da intendersi come parte
            di esempi didattici o citazioni di notizie, e <b>non</b> come
            raccomandazioni personalizzate.
          </p>
        </Section>

        <Section title="3. Rischi degli Investimenti">
          Gli strumenti finanziari (azioni, ETF, obbligazioni, derivati, crypto,
          valute) comportano <b>rischi significativi</b>, inclusa la possibile
          perdita totale del capitale investito. Le performance passate <b>non
          sono indicative</b> di risultati futuri. Volatilità, illiquidità,
          rischio emittente, rischio cambio, rischio paese e rischio
          regolamentare possono influenzare materialmente i rendimenti.
        </Section>

        <Section title="4. Limitazione di Responsabilità">
          Nei limiti consentiti dalla legge applicabile, Moneta, i suoi sviluppatori,
          fornitori di dati e affiliati declinano qualsiasi responsabilità per
          danni diretti, indiretti, incidentali, consequenziali o punitivi
          derivanti dall'uso o dall'impossibilità di utilizzo della piattaforma,
          inclusi (a titolo esemplificativo) perdite finanziarie, perdita di
          opportunità, danni reputazionali o interruzioni di servizio.
        </Section>

        <Section title="5. Dati e Cookie">
          I dati di mercato sono forniti da Finnhub.io e fonti pubbliche e
          potrebbero essere ritardati o non accurati. Le sessioni utente e le
          configurazioni di portafoglio sono memorizzate su Supabase
          (UE/USA-hosted). Per dettagli sul trattamento dei dati personali
          consultare la Privacy Policy (in elaborazione).
        </Section>

        <Section title="6. AI Generativa">
          Le risposte AI sono generate da modelli di linguaggio (Gemini 2.5 Flash)
          e possono contenere errori, allucinazioni o informazioni datate. Non
          fare affidamento sulle risposte AI per decisioni finanziarie reali.
          Verifica sempre con fonti ufficiali e consulta un professionista
          abilitato prima di assumere qualsiasi decisione di investimento.
        </Section>

        <Section title="7. Consulta un Professionista Abilitato">
          Per consulenza personalizzata su investimenti, fiscalità o pianificazione
          finanziaria rivolgiti a un <b>consulente finanziario abilitato</b>
          (iscritto OCF in Italia o equivalente nella tua giurisdizione),
          un commercialista o un avvocato esperto della materia.
        </Section>

        <Section title="8. Giurisdizione">
          Questa informativa è disciplinata dalla legge italiana. Qualsiasi
          controversia sarà di competenza esclusiva del Foro del consumatore
          ove applicabile, o del Foro di Milano in via residuale.
        </Section>

        <div style={{
          marginTop: 30, padding: "12px 14px", borderTop: `2px solid ${B.blue}`,
          color: B.gray2, fontSize: 12, lineHeight: 1.6,
        }}>
          <div style={{ color: B.yellow, fontWeight: 700, marginBottom: 6 }}>
            BOTTOM LINE
          </div>
          The information provided by Moneta is for <b>educational and
          informational purposes only</b> and does not constitute investment
          advice, a recommendation, or a solicitation to buy or sell any
          financial instrument. Past performance is not indicative of future
          results. Please consult a licensed financial advisor before making
          any investment decision.
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/" style={{
            display: "inline-block", background: B.blue, color: B.white,
            padding: "8px 20px", textDecoration: "none", fontSize: 14,
            fontWeight: 700, letterSpacing: "0.1em",
          }}>
            ← TORNA AL TERMINALE
          </Link>
        </div>
      </div>
    </div>
  );
}
