import type { NextAuthConfig } from "next-auth";

const authConfig = {
  providers: [],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const authUser = user as typeof user & {
          role?: string;
          employeeId?: string;
          department?: string;
          status?: string;
        };

        token.role = authUser.role;
        token.employeeId = authUser.employeeId;
        token.department = authUser.department;
        token.status = authUser.status;
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
        session.user.employeeId = token.employeeId as string;
        session.user.department = token.department as string;
        session.user.status = token.status as string;
      }

      return session;
    }
  }
} satisfies NextAuthConfig;

export default authConfig;
