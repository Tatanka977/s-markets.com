import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AppUser {
  user_id: string;
  email: string;
  name: string;
  picture?: string | null;
  provider: string;
}

function mapSupabaseUser(u: any): AppUser | null {
  if (!u) return null;
  return {
    user_id: u.id,
    email: u.email || "",
    name: u.user_metadata?.name || u.email?.split("@")[0] || "",
    picture: u.user_metadata?.picture || u.user_metadata?.avatar_url || null,
    provider: u.app_metadata?.provider || "email",
  };
}

export function useUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    setUser(mapSupabaseUser(data.session?.user));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSupabaseUser(session?.user));
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [refresh]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, refresh, logout };
}
