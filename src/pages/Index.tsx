import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CursusCard from "@/components/CursusCard";
import Footer from "@/components/Footer";
import InstallBanner from "@/components/InstallBanner";
import ExpertsCarousel from "@/components/ExpertsCarousel";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { fetchCursusList, fetchPoles, type Cursus, type Pole, REGISTRATION_FEE_XAF, formatXaf } from "@/lib/lms";

const Index = () => {
  useScrollToTop();
  const [featured, setFeatured] = useState<Cursus[]>([]);
  const [poles, setPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCursusList(), fetchPoles()])
      .then(([cursus, p]) => {
        setFeatured(cursus.filter((c) => c.featured).slice(0, 6));
        setPoles(p);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ExpertsCarousel />
      <InstallBanner />

      {/* Pôles de formation */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Nos pôles de formation</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cinq pôles d'expertise pour développer vos compétences professionnelles
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {poles.map((p) => (
                <Link key={p.id} to={`/courses?pole=${p.slug}`} className="group">
                  <div className="bg-card border rounded-xl p-6 h-full hover:shadow-[var(--shadow-elevated)] transition-shadow">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                    {p.description && <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>}
                    <p className="text-sm text-primary mt-4 inline-flex items-center gap-1">
                      Voir les cursus <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cursus phares */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cursus phares</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Démarrez avec nos programmes les plus demandés en finance islamique et au-delà
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featured.map((c) => <CursusCard key={c.id} cursus={c} />)}
            </div>
          )}

          <div className="text-center">
            <Link to="/courses">
              <Button size="lg" variant="outline" className="group">
                Voir tous les cursus
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi choisir le Centre de Formation IEBC ?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expertise en finance islamique, accompagnement personnalisé et flexibilité totale
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Formations certifiantes", desc: "Obtenez un certificat reconnu à l'issue de chaque cursus validé." },
              { title: "Frais d'inscription unique", desc: `${formatXaf(REGISTRATION_FEE_XAF)} par cursus, paiement validé manuellement via WhatsApp.` },
              { title: "Formateurs experts", desc: "Apprenez auprès de professionnels de la finance islamique et de la conformité bancaire." },
            ].map((b, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] border border-border">
                <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{b.title}</h3>
                <p className="text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à vous former ?</h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Rejoignez le Centre de Formation IEBC et obtenez vos certifications en finance islamique, commerce et management.
            </p>
            <Link to="/courses">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Découvrir les cursus
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
