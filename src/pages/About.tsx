import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, BookOpen, Globe, Briefcase } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const About = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              À propos du Centre de Formation IEBC
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              <strong>International Economics and Business Corporation (IEBC)</strong> est un cabinet
              économique et financier spécialisé dans le déploiement de la <strong>finance islamique</strong> en
              zone <strong>CEMAC</strong> et l'accompagnement des entreprises vers la performance et la
              transformation digitale.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Notre mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                À travers <strong>IEBC E-Learning</strong>, nous rendons accessibles des formations
                certifiantes de haut niveau en finance islamique, commerce international, management
                et technologies. Notre plateforme combine cours vidéo, QCM interactifs, projets pratiques
                et certifications reconnues.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Nous accompagnons les professionnels, étudiants et institutions en zone CEMAC dans le
                déploiement de la finance islamique (Mourabaha, Ijara, Sukuk, Takaful, etc.) et la
                transformation digitale de leurs activités.
              </p>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-80"></div>
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <Globe className="h-20 w-20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Zone CEMAC</h3>
                  <p className="mt-2 text-white/90">Finance Islamique · Transformation Digitale</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {[
              { Icon: Target, title: "Notre vision", desc: "Devenir la référence en formation à la finance islamique en zone CEMAC" },
              { Icon: Users, title: "Formateurs experts", desc: "Apprenez auprès de professionnels du secteur" },
              { Icon: Award, title: "Certifications", desc: "Obtenez des certificats reconnus à la fin de chaque programme" },
              { Icon: Briefcase, title: "Accompagnement", desc: "Suivi personnalisé en présentiel, ligne et visioconférence" },
            ].map(({ Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-muted/30 rounded-3xl p-12 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pourquoi nous choisir ?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Une expertise unique en finance islamique et transformation digitale
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">CEMAC</div>
                <p className="text-muted-foreground">Zone d'intervention</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">En ligne, présentiel & visio</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Accès aux cours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
