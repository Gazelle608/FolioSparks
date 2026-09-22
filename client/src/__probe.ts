import { supabase } from "./api/supabase";

// TEMPORARY probe — deleted immediately after running typecheck
export async function probe() {
  const { data } = await supabase
    .from("stories")
    .select("id, title")
    .eq("id", "x")
    .maybeSingle();

  return data;
}
