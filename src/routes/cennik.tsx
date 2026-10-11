import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { pricesQuery } from "@/lib/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cennik")({
  head: () => ({
    meta: [
      { title: "Cennik usług krawieckich — Nić & Miara" },
      { name: "description", content: "Przejrzysty cennik przeróbek krawieckich i szycia na miarę." },
      { property: "og:title", content: "Cennik — Nić & Miara" },
      { property: "og:description", content: "Ceny przeróbek spodni, marynarek, koszul i szycia na miarę." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cennik,
});

function Cennik() {
  const { data = [], isLoading } = useQuery(pricesQuery);
  const groups = data.reduce<Record<string, typeof data>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="eyebrow mb-3">Cennik</p>
      <h1 className="text-5xl">Usługi i ceny</h1>
      <p className="mt-4 text-muted-foreground">Ceny orientacyjne — ostateczna kwota zależy od tkaniny i zakresu pracy.</p>
      {isLoading && <p className="mt-10 text-muted-foreground">Ładowanie…</p>}
      <div className="mt-12 space-y-12">
        {Object.entries(groups).map(([cat, items]) => (
          <div key={cat}>
            <h2 className="mb-3 text-2xl">{cat}</h2>
            <table className="w-full text-sm">
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-3">{p.name}</td>
                    <td className="py-3 text-right font-medium tabular-nums">{p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <Button asChild className="mt-14" size="lg"><Link to="/wycena">Zapytaj o wycenę</Link></Button>
    </div>
  );
}
