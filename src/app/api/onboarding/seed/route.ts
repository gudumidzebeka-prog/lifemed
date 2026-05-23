import { NextResponse } from "next/server";

import {

  demoAppointments,

  demoDocuments,

  demoFamilyMembers,

  demoProfile,

  demoTimeline,

} from "@/data/demo-data";

import { createClient } from "@/lib/supabase/server";

import { isDemoModeEnabled, isSupabaseConfigured } from "@/lib/supabase/config";



export async function POST() {
  if (!isDemoModeEnabled()) {
    return NextResponse.json({ error: "Demo seed is disabled in production" }, { status: 403 });
  }

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



  const { count } = await supabase

    .from("timeline_events")

    .select("*", { count: "exact", head: true })

    .eq("user_id", user.id);



  if (count && count > 0) {

    return NextResponse.json({ message: "Already seeded" });

  }



  await supabase.from("profiles").upsert({

    id: user.id,

    full_name: demoProfile.fullName,

    date_of_birth: demoProfile.dateOfBirth,

    blood_type: demoProfile.bloodType,

    allergies: demoProfile.allergies,

    chronic_illnesses: demoProfile.chronicIllnesses,

  });



  if (demoProfile.emergencyContacts.length) {

    await supabase.from("emergency_contacts").insert(

      demoProfile.emergencyContacts.map((c) => ({

        user_id: user.id,

        name: c.name,

        relationship: c.relationship,

        phone: c.phone,

        email: c.email ?? null,

      }))

    );

  }



  if (demoProfile.currentMedications.length) {

    await supabase.from("medications").insert(

      demoProfile.currentMedications.map((m) => ({

        user_id: user.id,

        name: m.name,

        dosage: m.dosage,

        frequency: m.frequency,

        start_date: m.startDate,

        prescriber: m.prescriber ?? null,

        active: true,

      }))

    );

  }



  await supabase.from("timeline_events").insert(

    demoTimeline.map((event) => ({

      user_id: user.id,

      type: event.type,

      title: event.title,

      description: event.description ?? null,

      event_date: event.date,

      provider: event.provider ?? null,

      category: event.category ?? null,

    }))

  );



  // Metadata only — real files uploaded via Documents page

  const docsToSeed = demoDocuments.filter((d) => d.fileUrl !== "#");

  if (docsToSeed.length) {

    await supabase.from("health_documents").insert(

      docsToSeed.map((doc) => ({

        user_id: user.id,

        name: doc.name,

        category: doc.category,

        file_path: doc.fileUrl,

        file_type: doc.fileType,

        file_size: doc.fileSize,

        tags: doc.tags ?? [],

      }))

    );

  }



  if (demoAppointments.length) {

    await supabase.from("appointments").insert(

      demoAppointments.map((apt) => ({

        user_id: user.id,

        title: apt.title,

        provider: apt.provider,

        appointment_date: apt.date,

        location: apt.location ?? null,

      }))

    );

  }



  if (demoFamilyMembers.length) {

    await supabase.from("family_members").insert(

      demoFamilyMembers.map((m) => ({

        manager_id: user.id,

        name: m.name,

        relationship: m.relationship,

        date_of_birth: m.dateOfBirth || null,

      }))

    );

  }



  return NextResponse.json({ success: true });

}


