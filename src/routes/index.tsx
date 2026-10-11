import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { galleryQuery } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nić & Miara — pracownia krawiecka w Warszawie" },
      { name: "description", content: "Garnitury szyte na miarę i profesjonalne przeróbki krawieckie. Zobacz nasze realizacje i zamów wycenę online." },
      { property: "og:title", content: "Nić & Miara — pracownia krawiecka" },
      { property: "og:description", content: "Garnitury na miarę i przeróbki krawieckie z dbałością o każdy detal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: gallery = [] } = useQuery(galleryQuery);
  return (
    <>
      <section className="relative h-[82vh] min-h-[520px] overflow-hidden">
        <img src="/images/hero.jpg" alt="Garnitur na manekinie w pracowni" width={1600} height={1008} className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-6 pb-20 text-primary-foreground">
          <p className="eyebrow mb-4">Pracownia krawiecka · od 1998</p>
          <h1 className="max-w-2xl text-5xl leading-[1.05] md:text-7xl">Krój, który mówi więcej niż słowa.</h1>
          <p className="mt-6 max-w-md text-primary-foreground/80">Garnitury szyte na miarę i precyzyjne przeróbki — ręcznie, z szacunkiem do tkaniny.</p>
          <div className="mt-8 flex gap-3">
            <Button asChild variant="secondary" size="lg"><Link to="/wycena">Bezpłatna wycena</Link></Button>
            <Button asChild variant="link" size="lg" className="text-primary-foreground"><Link to="/cennik">Cennik →</Link></Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow mb-3">O nas</p>
          <h2 className="text-4xl md:text-5xl">Rzemiosło przekazywane z ręki do ręki.</h2>
        </div>
        <div className="space-y-5 text-muted-foreground leading-relaxed">
          <p>Jesteśmy rodzinną pracownią, w której każdy garnitur powstaje od pierwszej miary do ostatniego ściegu w jednym miejscu. Pracujemy na wełnach z najlepszych włoskich i angielskich tkalni.</p>
          <p>Poza szyciem na miarę wykonujemy przeróbki — od skrócenia nogawek po pełne przemodelowanie marynarki. Każde zlecenie traktujemy z tą samą uwagą.</p>
          <div className="grid grid-cols-3 gap-6 pt-6 text-foreground">
            {[["25+", "lat doświadczenia"], ["3 000", "uszytych garniturów"], ["48 h", "ekspresowe przeróbki"]].map(([n, l]) => (
              <div key={l}><div className="font-serif text-4xl">{n}</div><div className="text-xs text-muted-foreground">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div><p className="eyebrow mb-3">Galeria</p><h2 className="text-4xl md:text-5xl">Nasze realizacje</h2></div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {gallery.map((g) => (
            <figure key={g.id} className="group overflow-hidden bg-muted">
              <div className="aspect-[4/5] overflow-hidden">
                <img src={g.image_url} alt={g.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <figcaption className="p-3">
                <div className="font-serif text-lg">{g.title}</div>
                {g.description && <div className="text-xs text-muted-foreground">{g.description}</div>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  );
}
