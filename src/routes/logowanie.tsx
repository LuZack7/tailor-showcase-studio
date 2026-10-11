import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/logowanie")({
  head: () => ({
    meta: [
      { title: "Logowanie — Nić & Miara" },
      { name: "description", content: "Zaloguj się do konta pracowni Nić & Miara." },
      { property: "og:title", content: "Logowanie — Nić & Miara" },
      { property: "og:description", content: "Zaloguj się do konta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);

  if (user) {
    return (
      <div className="mx-auto max-w-sm px-6 py-24">
        <h1 className="text-4xl">Witaj</h1>
        <p className="mt-2 text-muted-foreground">{user.email}</p>
        <div className="mt-8 flex gap-3">
          {isAdmin && <Button asChild><Link to="/panel">Panel</Link></Button>}
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Wyloguj</Button>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim();
    const password = String(fd.get("password"));
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("Nieprawidłowy e-mail lub hasło"); return; }
      navigate({ to: "/" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Sprawdź skrzynkę e-mail, aby potwierdzić konto.");
      setMode("in");
    }
  };

  return (
    <div className="mx-auto max-w-sm px-6 py-24">
      <h1 className="text-4xl">{mode === "in" ? "Logowanie" : "Rejestracja"}</h1>
      <form onSubmit={submit} className="mt-8 grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" required /></div>
        <div className="grid gap-2"><Label htmlFor="password">Hasło</Label><Input id="password" name="password" type="password" required minLength={6} /></div>
        <Button type="submit" disabled={busy}>{mode === "in" ? "Zaloguj" : "Załóż konto"}</Button>
      </form>
      <button className="mt-4 text-sm text-muted-foreground underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>
        {mode === "in" ? "Nie masz konta? Zarejestruj się" : "Masz konto? Zaloguj się"}
      </button>
    </div>
  );
}
