import { type ApiResult, err, ok, supabase } from "./supabase";

export interface Author {
  id: string;
  pen_name: string | null;
  tagline: string | null;
  total_sparks_received: number;
  total_reads: number;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAuthorInput {
  id: string;
  pen_name?: string;
  tagline?: string;
}

export async function createAuthor(
  input: CreateAuthorInput,
): Promise<ApiResult<Author>> {
  const { data, error } = await supabase
    .from("authors")
    .insert([input] as never[])
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

export async function getAuthor(
  authorId: string,
): Promise<ApiResult<Author>> {
  const { data, error } = await supabase
    .from("authors")
    .select("*")
    .eq("id", authorId)
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}
