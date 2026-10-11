import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Pracownia" },
  { to: "/cennik", label: "Cennik" },
  { to: "/wycena", label: "Wycena" },
] as const;

export function SiteHeader() {
  const { user, isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-serif text-2xl tracking-wide text-foreground">
          Nić <span className="text-accent">&</span> Miara
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: true }}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/panel" className="text-accent">
              Panel
            </Link>
          )}
          <Link to="/logowanie" className="text-muted-foreground hover:text-foreground">
            {user ? "Konto" : "Zaloguj"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-muted-foreground md:flex-row md:justify-between">
        <span className="font-serif text-lg text-foreground">Nić & Miara — pracownia krawiecka</span>
        <span>ul. Krawiecka 12, Warszawa · pon–pt 9–18 · +48 600 000 000</span>
      </div>
    </footer>
  );
}
