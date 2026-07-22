import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import PortfolioTerminal from "@/components/PortfolioTerminal";
import OnboardingQuestionnaire from "@/components/OnboardingQuestionnaire";
import { useUser } from "@/hooks/useUser";
import { getInvestorProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/terminal")({
  component: TerminalWithOnboarding,
});

function TerminalWithOnboarding() {
  const { user, loading } = useUser();
  const [checked, setChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { setChecked(true); return; }
    getInvestorProfile().then(profile => {
      const done = profile && (profile.onboarding_skipped || profile.investment_goal);
      setShowOnboarding(!done);
      setChecked(true);
    }).catch(() => setChecked(true));
  }, [user, loading]);

  return (
    <>
      <PortfolioTerminal />
      {checked && showOnboarding && (
        <OnboardingQuestionnaire onDone={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
