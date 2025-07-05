import { getSupabaseClient } from "@/lib/supabase/supabase-client";
import { MovieType } from "@/movies";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const movie = (await request.json()) as MovieType;

  // Create Embedding
  const embeddingResponse = await openAi.embeddings.create({
    model: "text-embedding-ada-002",
    input: `${movie.title} - ${movie.plot}`,
  });

  const [{ embedding }] = embeddingResponse.data;

  // Insert Into Supabase
  const supabaseClient = getSupabaseClient();
  
  if (!supabaseClient) {
    return NextResponse.json(
      { error: "Supabase is not configured. Please check environment variables." },
      { status: 500 }
    );
  }

  const { error } = await supabaseClient.from("movies").insert({
    ...movie,
    embedding,
  });

  return NextResponse.json({ error });
}
