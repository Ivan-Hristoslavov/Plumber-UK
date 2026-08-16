import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export type ServiceRecord = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration_minutes: number | null;
  category: string | null;
};

export type Service = ServiceRecord & { slug: string };

export async function getActiveServices(): Promise<Service[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, name, description, price, duration_minutes, category")
      .eq("is_active", true)
      .order("order", { ascending: true });

    if (error) return [];

    return (data || []).map((s: ServiceRecord) => ({ ...s, slug: slugify(s.name) }));
  } catch {
    return [];
  }
}
