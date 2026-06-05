import type { NextAuthConfig } from "next-auth";

const isProd = process.env.NODE_ENV === "production";

export const authConfig: NextAuthConfig = {
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  // Secure cookie flags — httpOnly prevents JS access (XSS mitigation)
  cookies: {
    sessionToken: {
      name: isProd ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,    // inaccessible to JS
        secure:   isProd,  // HTTPS only in production
        sameSite: "lax",   // CSRF protection
        path:     "/",
      },
    },
  },

  pages: {
    signIn: "/login",
    error:  "/login",
  },

  providers: [],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id     = user.id;
        token.role   = (user as any).role;
        token.avatar = (user as any).avatar;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id          = token.id as string;
        (session.user as any).role   = token.role;
        (session.user as any).avatar = token.avatar;
      }
      return session;
    },

    // Prevent deactivated accounts from getting a session
    async signIn({ user }) {
      if ((user as any).isActive === false) return false;
      return true;
    },
  },
};
