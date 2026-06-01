import { NextResponse } from "next/server";
import argon2 from "argon2";
import { prisma } from "@/lib/db/prisma";
import { registrationSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pinHash = await argon2.hash(parsed.data.pin);

  try {
    const user = await prisma.user.create({
      data: {
        employeeId: parsed.data.employeeId,
        fullName: parsed.data.fullName,
        displayName: parsed.data.displayName,
        departmentId: parsed.data.departmentId,
        pinHash
      }
    });

    return NextResponse.json({ id: user.id, status: user.status }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration could not be completed" }, { status: 409 });
  }
}
