import type { DonationPlatform } from "../components/auth/onboarding/donationplatformpicker";

import { type ApiResult, err, ok, supabase } from "./supabase";

export interface DonationLink {
  id: string;
  author_id: string;
  platform: DonationPlatform;
  label: string | null;
  url: string;
  is_primary: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDonationLinkInput {
  author_id: string;
  platform: DonationPlatform;
  url: string;
  label?: string;
  is_primary?: boolean;
  display_order?: number;
}

export async function createDonationLink(
  input: CreateDonationLinkInput,
): Promise<ApiResult<DonationLink>> {
  const { data, error } = await supabase
    .from("donation_links")
    .insert(input as never)
    .select()
    .single();

  if (error)
    return err(error.message);
  return ok(data);
}

export async function listDonationLinks(
  authorId: string,
): Promise<ApiResult<DonationLink[]>> {
  const { data, error } = await supabase
    .from("donation_links")
    .select("*")
    .eq("author_id", authorId)
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error)
    return err(error.message);
  return ok(data ?? []);
}

export async function deleteDonationLink(
  id: string,
): Promise<ApiResult<null>> {
  const { error } = await supabase.from("donation_links").delete().eq("id", id);
  if (error)
    return err(error.message);
  return ok(null);
}
