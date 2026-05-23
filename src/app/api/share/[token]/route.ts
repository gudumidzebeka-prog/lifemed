import { NextRequest, NextResponse } from "next/server";

import {

  fetchHealthDocuments,

  fetchHealthProfile,

  fetchShareLinkByToken,

  fetchTimelineEvents,

} from "@/lib/health/db";

import { getDemoShare, getDemoSharePayload } from "@/lib/health/demo-share-store";

import { createClient } from "@/lib/supabase/server";

import { createAdminClient } from "@/lib/supabase/admin";

import { isSupabaseConfigured } from "@/lib/supabase/config";



export async function GET(

  _request: NextRequest,

  { params }: { params: Promise<{ token: string }> }

) {

  const { token } = await params;



  if (!isSupabaseConfigured()) {

    const entry = getDemoShare(token);

    if (!entry) {

      return NextResponse.json({ error: "Link expired or invalid" }, { status: 404 });

    }



    return NextResponse.json({

      expiresAt: entry.expiresAt,

      ...getDemoSharePayload(entry.scopes),

    });

  }



  const admin = createAdminClient();

  const supabase = admin ?? (await createClient());



  const link = await fetchShareLinkByToken(supabase, token);



  if (!link) {

    return NextResponse.json({ error: "Link expired or invalid" }, { status: 404 });

  }



  const scopes = (link.permissions as { scope: string }[]).map((p) => p.scope);

  const payload: Record<string, unknown> = {

    expiresAt: link.expires_at,

    scopes,

  };



  if (scopes.includes("profile") || scopes.includes("emergency")) {

    payload.profile = await fetchHealthProfile(supabase, link.user_id);

  }



  if (scopes.includes("timeline")) {

    payload.timeline = await fetchTimelineEvents(supabase, link.user_id);

  }



  if (scopes.includes("documents")) {

    payload.documents = await fetchHealthDocuments(supabase, link.user_id);

  }



  return NextResponse.json(payload);

}


