import type { DefaultSession } from "next-auth";

// Make session.user non-optional and expose our custom fields (id, role).
// This eliminates the widespread "session.user is possibly undefined" errors
// and the need for `(session.user as any).role` casts.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}
