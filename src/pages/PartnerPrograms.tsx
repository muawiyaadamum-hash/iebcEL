import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Loader2, ArrowRight } from "lucide-react";

const PartnerPrograms = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("partner_programs")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      setPrograms(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Award className="h-3.5 w-3.5" /> Programmes conjoints
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Certificats conjoints IEBC & Partenaires</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Consultez la liste publique des programmes conjoints, les lauréats certifiés et vérifiez l'authenticité de chaque certificat.
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : programs.length === 0 ? (
          <Card><CardContent className="py-16 text-center text-muted-foreground">Aucun programme conjoint publié pour le moment.</CardContent></Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <Link key={p.id} to={`/partners/${p.slug}`} className="group">
                <Card className="h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5" style={{ borderTopColor: p.primary_color || "hsl(var(--primary))", borderTopWidth: 4 }}>
                  {p.hero_image_url && (
                    <div className="h-36 w-full overflow-hidden bg-muted">
                      <img src={p.hero_image_url} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-1">
                      {p.partner_logo_url ? (
                        <img src={p.partner_logo_url} alt={p.partner_name} className="h-8 w-8 object-contain rounded border p-0.5 bg-white" />
                      ) : (
                        <Award className="h-6 w-6 text-primary" />
                      )}
                      <Badge variant="secondary" className="text-xs">{p.partner_name}</Badge>
                    </div>
                    <CardTitle className="text-lg leading-snug">{p.name}</CardTitle>
                    {p.description && <CardDescription className="line-clamp-2">{p.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{p.duration || p.location || "Voir détails"}</span>
                    <span className="inline-flex items-center gap-1 text-primary font-medium">
                      Lauréats <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PartnerPrograms;
