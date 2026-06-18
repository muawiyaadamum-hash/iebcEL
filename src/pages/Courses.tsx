import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursusCard from "@/components/CursusCard";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Search, SlidersHorizontal, Star, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchCursusList, fetchPoles, type Cursus, type Pole } from "@/lib/lms";

const Courses = () => {
  useScrollToTop();
  const [params, setParams] = useSearchParams();
  const [poles, setPoles] = useState<Pole[]>([]);
  const [cursus, setCursus] = useState<Cursus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPole, setSelectedPole] = useState<string>(params.get("pole") || "all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([fetchPoles(), fetchCursusList()])
      .then(([p, c]) => { setPoles(p); setCursus(c); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPole === "all") params.delete("pole"); else params.set("pole", selectedPole);
    setParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPole]);

  const filtered = useMemo(() => cursus.filter((c) => {
    const poleOk = selectedPole === "all" || c.pole?.slug === selectedPole;
    const lvlOk = selectedLevel === "all" || c.level === selectedLevel;
    const s = search.toLowerCase().trim();
    const searchOk = !s || c.title.toLowerCase().includes(s) || (c.description ?? "").toLowerCase().includes(s);
    return poleOk && lvlOk && searchOk;
  }), [cursus, selectedPole, selectedLevel, search]);

  const featured = useMemo(() => cursus.filter((c) => c.featured).slice(0, 3), [cursus]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {featured.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-2xl font-bold">Cursus phares</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((c) => <CursusCard key={c.id} cursus={c} />)}
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Catalogue des cursus</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Parcourez nos cursus certifiants par pôle de formation
            </p>
          </div>

          <div className="bg-card border rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un cursus..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Niveau" /></SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">Tous les niveaux</SelectItem>
                    <SelectItem value="Débutant">Débutant</SelectItem>
                    <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                    <SelectItem value="Avancé">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs value={selectedPole} onValueChange={setSelectedPole} className="mt-6">
              <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2">Tous les pôles</TabsTrigger>
                {poles.map((p) => (
                  <TabsTrigger key={p.id} value={p.slug} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2">
                    {p.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{filtered.length}</span> cursus
                </p>
                {(search || selectedPole !== "all" || selectedLevel !== "all") && (
                  <button
                    onClick={() => { setSearch(""); setSelectedPole("all"); setSelectedLevel("all"); }}
                    className="text-sm text-primary hover:underline"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((c) => <CursusCard key={c.id} cursus={c} />)}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun cursus ne correspond aux critères.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
