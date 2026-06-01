import argon2 from "argon2";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { UserStatus, Role } from "@prisma/client";
import { z } from "zod";
import authConfig from "@/lib/auth/auth.config";
import { prisma } from "@/lib/db/prisma";

const loginSchema = z.object({
  employeeId: z.string().min(3),
  pin: z.string().regex(/^\d{4}$/)
});

type SessionUserPayload = {
  id: string;
  name: string;
  employeeId: string;
  role: Role;
  status: UserStatus;
  department: string;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Employee PIN",
      credentials: {
        employeeId: { label: "Employee ID", type: "text" },
        pin: { label: "PIN", type: "password" }
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { employeeId: parsed.data.employeeId },
          include: { department: true }
        });

        if (!user || user.status !== "APPROVED") {
          return null;
        }

        const isValid = await argon2.verify(user.pinHash, parsed.data.pin);
        if (!isValid) {
          return null;
        }

        const sessionUser: SessionUserPayload = {
          id: user.id,
          name: user.displayName,
          employeeId: user.employeeId,
          role: user.role,
          status: user.status,
          department: user.department.name
        };

        return sessionUser;
      }
    })
  ]
});
