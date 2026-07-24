type Portfolio = { id: string; name: string; holdings: any[]; updated_at: string };
type Watchlist = { id: string; symbol: string; name?: string; category?: string; created_at: string };
type Convo = { id: string; title: string; messages: any[]; updated_at: string };

import { supabase } from "@/integrations/supabase/client";

export async function savePortfolio({ data }: { data: { name: string; holdings: any[] } }): Promise<Portfolio> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not signed in");
  const { data: row, error } = await supabase
    .from("portfolios")
    .insert({ user_id: user.id, name: data.name, holdings: data.holdings })
    .select()
    .single();
  if (error) throw error;
  return row as Portfolio;
}

export async function listPortfolios(): Promise<Portfolio[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Portfolio[];
}

export async function deletePortfolio({ data }: { data: { id: string } }): Promise<{ ok: true }> {
  const { error } = await supabase.from("portfolios").delete().eq("id", data.id);
  if (error) throw error;
  return { ok: true };
}

export async function addToWatchlist({ data }: { data: { symbol: string; name?: string; category?: string } }): Promise<Watchlist> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not signed in");
  const { data: row, error } = await supabase
    .from("watchlist")
    .upsert({ user_id: user.id, symbol: data.symbol, name: data.name, category: data.category }, { onConflict: "user_id,symbol" })
    .select()
    .single();
  if (error) throw error;
  return row as Watchlist;
}

export async function listWatchlist(): Promise<Watchlist[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Watchlist[];
}

export async function deleteWatchlist({ data }: { data: { id: string } }): Promise<{ ok: true }> {
  const { error } = await supabase.from("watchlist").delete().eq("id", data.id);
  if (error) throw error;
  return { ok: true };
}

export async function saveConversation({ data }: { data: { title: string; messages: any[] } }): Promise<Convo> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not signed in");
  const { data: row, error } = await supabase
    .from("ai_conversations")
    .insert({ user_id: user.id, title: data.title, messages: data.messages })
    .select()
    .single();
  if (error) throw error;
  return row as Convo;
}

export async function listConversations(): Promise<Convo[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []) as Convo[];
}

export async function deleteConversation({ data }: { data: { id: string } }): Promise<{ ok: true }> {
  const { error } = await supabase.from("ai_conversations").delete().eq("id", data.id);
  if (error) throw error;
  return { ok: true };
}

export async function updateProfile({ data }: { data: { display_name: string } }): Promise<{ display_name: string }> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: data.display_name, updated_at: new Date().toISOString() })
    .eq("id", user.id);
  if (error) throw error;
  return { display_name: data.display_name };
}
export interface InvestorProfile {
  age_range?: string;
  investment_goal?: string;
  time_horizon?: string;
  risk_tolerance?: string;
  experience_level?: string;
  onboarding_skipped?: boolean;
}

export async function getInvestorProfile(): Promise<InvestorProfile | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data as InvestorProfile | null;
}

export async function saveInvestorProfile({ data }: { data: InvestorProfile }): Promise<InvestorProfile> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error("Not signed in");
  const { data: row, error } = await supabase
    .from("investor_profiles")
    .upsert({ user_id: user.id, ...data, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return row as InvestorProfile;
}

export async function skipOnboarding(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  await supabase.from("investor_profiles").upsert({ user_id: user.id, onboarding_skipped: true });
}
export async function upsertSnapshot({ data }: { data: { date: string; value: number } }): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return;
  await supabase.from("portfolio_snapshots").upsert({
    user_id: user.id,
    snapshot_date: data.date,
    total_value: data.value,
  });
}

export async function getSnapshots(): Promise<{ snapshot_date: string; total_value: number }[]> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return [];
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("snapshot_date, total_value")
    .eq("user_id", user.id)
    .order("snapshot_date", { ascending: true });
  if (error) throw error;
  return data || [];
}
