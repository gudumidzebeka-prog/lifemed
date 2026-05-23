import { NextRequest, NextResponse } from "next/server";

import { createShareLink, fetchShareLinks, revokeShareLink } from "@/lib/health/db";

import {

  listDemoShares,

  revokeDemoShare,

  saveDemoShare,

} from "@/lib/health/demo-share-store";

import { createClient } from "@/lib/supabase/server";

import { isSupabaseConfigured } from "@/lib/supabase/config";

import { generateShareToken } from "@/lib/utils";



export async function GET() {

  if (!isSupabaseConfigured()) {

    const links = listDemoShares().map((entry) => ({

      id: entry.token,

      token: entry.token,

      expiresAt: entry.expiresAt,

      permissions: entry.scopes.map((scope) => ({ type: "view", scope })),

      createdAt: entry.createdAt,

      demo: true,

    }));

    return NextResponse.json({ links });

  }



  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) {

    return NextResponse.json({ links: [] });

  }



  const { links, error } = await fetchShareLinks(supabase, user.id);

  if (error) {

    return NextResponse.json({ error: error.message }, { status: 500 });

  }



  return NextResponse.json({ links });

}



export async function POST(request: NextRequest) {

  const body = await request.json();

  const { scopes, expiryHours } = body as { scopes: string[]; expiryHours: number };

  const token = generateShareToken();

  const expiresAt = new Date(Date.now() + (expiryHours ?? 24) * 60 * 60 * 1000).toISOString();

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;



  if (!isSupabaseConfigured()) {

    saveDemoShare({

      token,

      scopes: scopes ?? [],

      expiresAt,

      createdAt: new Date().toISOString(),

    });



    return NextResponse.json({

      token,

      url: `${origin}/share/${token}`,

      expiresAt,

      demo: true,

    });

  }



  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  }



  const permissions = (scopes ?? []).map((scope) => ({

    type: "view",

    scope,

  }));



  const { error } = await createShareLink(supabase, user.id, {

    token,

    permissions,

    expiresAt,

  });



  if (error) {

    return NextResponse.json({ error: error.message }, { status: 500 });

  }



  return NextResponse.json({

    token,

    url: `${origin}/share/${token}`,

    expiresAt,

    demo: false,

  });

}



export async function DELETE(request: NextRequest) {

  const token = request.nextUrl.searchParams.get("token");

  if (!token) {

    return NextResponse.json({ error: "Token required" }, { status: 400 });

  }



  if (!isSupabaseConfigured()) {

    revokeDemoShare(token);

    return NextResponse.json({ success: true });

  }



  const supabase = await createClient();

  const {

    data: { user },

  } = await supabase.auth.getUser();



  if (!user) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  }



  const { error } = await revokeShareLink(supabase, user.id, token);

  if (error) {

    return NextResponse.json({ error: error.message }, { status: 500 });

  }



  return NextResponse.json({ success: true });

}


