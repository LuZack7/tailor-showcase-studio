import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { galleryQuery, pricesQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/panel")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel administracyjny — Nić & Miara" },
      { name: "description", content: "Panel zarządzania pracownią." },
      { property: "og:title", content: "Panel — Nić & Miara" },
      { property: "og:description", content: "Panel zarządzania." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Panel,
});

function Panel() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div className="p-20 text-center text-muted-foreground">Ładowanie…</div>;
  if (!user || !isAdmin)
    return (
      <div className="p-20 text-center">
        <p className="text-muted-foreground">Brak dostępu.</p>
        <Button asChild variant="link"><Link to="/logowanie">Zaloguj się</Link></Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-4xl">Panel administracyjny</h1>
      <Tabs defaultValue="prices" className="mt-8">
        <TabsList>
          <TabsTrigger value="prices">Cennik</TabsTrigger>
          <TabsTrigger value="gallery">Galeria</TabsTrigger>
          <TabsTrigger value="quotes">Zapytania</TabsTrigger>
        </TabsList>
        <TabsContent value="prices"><Prices /></TabsContent>
        <TabsContent value="gallery"><Gallery /></TabsContent>
        <TabsContent value="quotes"><Quotes /></TabsContent>
      </Tabs>
    </div>
  );
}

function Prices() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(pricesQuery);
  const refresh = () => qc.invalidateQueries({ queryKey: ["prices"] });

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const { error } = await supabase.from("price_items").insert({
      category: String(fd.get("category")).trim().slice(0, 60),
      name: String(fd.get("name")).trim().slice(0, 120),
      price: String(fd.get("price")).trim().slice(0, 40),
      sort_order: data.length + 1,
    });
    if (error) { toast.error(error.message); return; }
    form.reset();
    refresh();
  };
  const update = async (id: string, field: "category" | "name" | "price", value: string) => {
    const { error } = await supabase.from("price_items").update({ [field]: value } as { category?: string; name?: string; price?: string }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  };
  const remove = async (id: string) => {
    await supabase.from("price_items").delete().eq("id", id);
    refresh();
  };

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={add} className="grid gap-2 md:grid-cols-[1fr_2fr_1fr_auto]">
        <Input name="category" placeholder="Kategoria" required />
        <Input name="name" placeholder="Usługa" required />
        <Input name="price" placeholder="np. od 50 zł" required />
        <Button type="submit">Dodaj</Button>
      </form>
      <div className="space-y-2">
        {data.map((p) => (
          <div key={p.id} className="grid gap-2 md:grid-cols-[1fr_2fr_1fr_auto]">
            <Input defaultValue={p.category} onBlur={(e) => e.target.value !== p.category && update(p.id, "category", e.target.value)} />
            <Input defaultValue={p.name} onBlur={(e) => e.target.value !== p.name && update(p.id, "name", e.target.value)} />
            <Input defaultValue={p.price} onBlur={(e) => e.target.value !== p.price && update(p.id, "price", e.target.value)} />
            <Button variant="outline" onClick={() => remove(p.id)}>Usuń</Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Zmiany zapisują się po opuszczeniu pola.</p>
    </div>
  );
}

function Gallery() {
  const qc = useQueryClient();
  const { data = [] } = useQuery(galleryQuery);
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const file = fd.get("file") as File;
    if (!file || !file.size) { toast.error("Wybierz zdjęcie"); return; }
    if (!file.type.startsWith("image/")) { toast.error("Plik musi być obrazem"); return; }
    setBusy(true);
    const path = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
    const up = await supabase.storage.from("gallery").upload(path, file);
    if (up.error) { setBusy(false); { toast.error(up.error.message); return; } }
    const signed = await supabase.storage.from("gallery").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signed.error) { setBusy(false); { toast.error(signed.error.message); return; } }
    const { error } = await supabase.from("gallery_items").insert({
      title: String(fd.get("title")).trim().slice(0, 120),
      description: String(fd.get("description")).trim().slice(0, 300) || null,
      image_url: signed.data.signedUrl,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    form.reset();
    toast.success("Dodano do galerii");
    qc.invalidateQueries({ queryKey: ["gallery"] });
  };
  const remove = async (id: string) => {
    await supabase.from("gallery_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["gallery"] });
  };

  return (
    <div className="mt-6 space-y-8">
      <form onSubmit={add} className="grid gap-2 md:grid-cols-2">
        <Input name="title" placeholder="Tytuł" required />
        <Input name="description" placeholder="Opis (opcjonalnie)" />
        <Input name="file" type="file" accept="image/*" required />
        <Button type="submit" disabled={busy}>{busy ? "Wysyłanie…" : "Dodaj zdjęcie"}</Button>
      </form>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.map((g) => (
          <div key={g.id} className="space-y-2">
            <img src={g.image_url} alt={g.title} className="aspect-[4/5] w-full object-cover" />
            <div className="flex items-center justify-between text-sm">
              <span className="truncate">{g.title}</span>
              <Button size="sm" variant="ghost" onClick={() => remove(g.id)}>Usuń</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quotes() {
  const { data = [] } = useQuery({
    queryKey: ["quotes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  if (!data.length) return <p className="mt-6 text-muted-foreground">Brak zapytań.</p>;
  return (
    <div className="mt-6 space-y-4">
      {data.map((q) => (
        <div key={q.id} className="border border-border p-4">
          <div className="flex justify-between text-sm">
            <strong>{q.name} · {q.service}</strong>
            <span className="text-muted-foreground">{new Date(q.created_at).toLocaleString("pl-PL")}</span>
          </div>
          <div className="text-sm text-muted-foreground">{q.email}{q.phone ? ` · ${q.phone}` : ""}</div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{q.details}</p>
        </div>
      ))}
    </div>
  );
}
