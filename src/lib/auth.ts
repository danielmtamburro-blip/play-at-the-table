import "server-only";
import { redirect } from "next/navigation";
import { getServerClient } from "./supabase/server";

/** Signed-in Supabase client + user, or a redirect to /login. */
export async function requireUser() {
  const sb = await getServerClient();
  if (!sb) redirect("/login");
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return { sb, user };
}
