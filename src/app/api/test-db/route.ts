import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.user.count();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      {
        success: false,
        error: String(e),
      },
      { status: 500 }
    );
  }
}