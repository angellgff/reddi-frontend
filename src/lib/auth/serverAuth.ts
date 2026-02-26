import { createClient } from "@/src/lib/supabase/server";
import { type Session, type User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

type ServerAuthResult = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
};

const getServerSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return session;
});

export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
});

export const serverAuth = cache(async (): Promise<ServerAuthResult> => {
  const user = await getUser();

  if (!user) {
    return {
      session: null,
      user: null,
      isAuthenticated: false,
    };
  }

  const session = await getServerSession();

  const validatedSession =
    session?.user?.id && user?.id && session.user.id === user.id
      ? session
      : null;

  return {
    session: validatedSession,
    user,
    isAuthenticated: Boolean(user),
  };
});

export async function requireUser(
  redirectTo: string = "/auth/login",
): Promise<User> {
  const { user } = await serverAuth();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}
