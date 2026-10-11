import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const pricesQuery = queryOptions({
  queryKey: ["prices"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("price_items")
      .select("*")
      .order("sort_order")
      .order("created_at");
    if (error) throw error;
    return data;
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
