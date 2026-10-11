import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/wycena")({
  head: () => ({
    meta: [
      { title: "Szybka wycena online — Nić & Miara" },
      { name: "description", content: "Opisz, czego potrzebujesz, a przygotujemy wycenę przeróbki lub szycia na miarę." },
      { property: "og:title", content: "Wycena online — Nić & Miara" },
      { property: "og:description", content: "Bezpłatna wycena usług krawieckich w 24 godziny." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Wycena,
});

const services = ["Przeróbka spodni", "Przeróbka marynarki", "Przeróbka koszuli", "Garnitur na miarę", "Inne"];

const schema = z.object({
  name: z.string().trim().min(1, "Podaj imię").max(100),
  email: z.string().trim().email("Niepoprawny e-mail").max(255),
  phone: z.string().trim().max(30).optional(),
  service: z.string().min(1).max(100),
  details: z.string().trim().min(5, "Opisz zlecenie").max(2000),
});

function Wycena() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = Object.fromEntries(new FormData(e.currentTarget));
    const parsed = schema.safeParse(fd);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setBusy(true);
    const { error } = await supabase.from("quote_requests").insert({ ...parsed.data, phone: parsed.data.phone || null });
    setBusy(false);
    if (error) return toast.error("Nie udało się wysłać. Spróbuj ponownie.");
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="eyebrow mb-3">Wycena online</p>
      <h1 className="text-5xl">Opowiedz nam o zleceniu</h1>
      {sent ? (
        <p className="mt-10 text-lg">Dziękujemy! Odezwiemy się z wyceną w ciągu 24 godzin.</p>
      ) : (
        <form onSubmit={submit} className="mt-10 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="name">Imię i nazwisko</Label><Input id="name" name="name" required maxLength={100} /></div>
            <div className="grid gap-2"><Label htmlFor="phone">Telefon (opcjonalnie)</Label><Input id="phone" name="phone" maxLength={30} /></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" required maxLength={255} /></div>
          <div className="grid gap-2">
            <Label htmlFor="service">Rodzaj usługi</Label>
            <select id="service" name="service" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm">
              {services.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid gap-2"><Label htmlFor="details">Opis</Label><Textarea id="details" name="details" rows={5} required maxLength={2000} placeholder="np. skrócenie rękawów marynarki o 2 cm" /></div>
          <Button type="submit" size="lg" disabled={busy}>{busy ? "Wysyłanie…" : "Wyślij zapytanie"}</Button>
        </form>
      )}
    </div>
  );
}
