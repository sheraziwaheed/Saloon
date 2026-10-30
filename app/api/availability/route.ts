import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";
import { fail } from "@/lib/http";
export async function GET(r: Request) {
  try {
    const q = new URL(r.url).searchParams;
    return NextResponse.json(
      await getAvailability(
        q.get("branch") || "",
        (q.get("services") || "").split(",").filter(Boolean),
        q.get("staff") || "any",
        q.get("date") || "",
        (q.get("addons") || "").split(",").filter(Boolean),
      ),
    );
  } catch (e) {
    return fail(e);
  }
}
