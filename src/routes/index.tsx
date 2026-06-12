import { createFileRoute } from "@tanstack/react-router";
import PortfolioTerminal from "@/components/PortfolioTerminal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Moneta — Portfolio Terminal" },
      { name: "description", content: "Moneta: portfolio terminal with multi-asset coverage and AI advisor." },
      { property: "og:title", content: "Moneta — Portfolio Terminal" },
      { property: "og:description", content: "Moneta: portfolio terminal with multi-asset coverage and AI advisor." },
    ],
  }),
  component: PortfolioTerminal,
});
