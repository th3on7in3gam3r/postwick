import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getEnvStatus, requireDatabaseUrl } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const env = getEnvStatus();

  if (!env.okForDb) {
    return NextResponse.json(
      {
        status: "error",
        database: "missing",
        env: {
          DATABASE_URL: env.databaseUrl,
          NEXT_PUBLIC_APP_URL: env.appUrl,
          NEXT_PUBLIC_KERYGMA_URL: env.kerygmaUrl,
        },
      },
      { status: 503 },
    );
  }

  try {
    const sql = neon(requireDatabaseUrl());
    await sql`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      database: "up",
      env: {
        DATABASE_URL: true,
        NEXT_PUBLIC_APP_URL: env.appUrl,
        NEXT_PUBLIC_KERYGMA_URL: env.kerygmaUrl,
      },
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "down",
        env: {
          DATABASE_URL: true,
          NEXT_PUBLIC_APP_URL: env.appUrl,
          NEXT_PUBLIC_KERYGMA_URL: env.kerygmaUrl,
        },
      },
      { status: 503 },
    );
  }
}
