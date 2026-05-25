import { NextRequest, NextResponse } from "next/server";
import {
  createDocumentSignedUrl,
  getHealthDocumentById,
} from "@/lib/health/db";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const doc = await getHealthDocumentById(supabase, user.id, id);
  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const { url, error } = await createDocumentSignedUrl(supabase, doc.file_path);

  if (error || !url) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  if (request.nextUrl.searchParams.get("redirect") === "1") {
    return NextResponse.redirect(url);
  }

  return NextResponse.json({
    url,
    name: doc.name,
    fileType: doc.file_type,
  });
}
