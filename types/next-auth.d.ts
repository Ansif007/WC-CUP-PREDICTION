import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: string;
      employeeId: string;
      department: string;
      status: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    employeeId?: string;
    department?: string;
    status?: string;
  }
}
