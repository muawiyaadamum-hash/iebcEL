import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Users, Video, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-500/10 text-green-700 border-green-500/30 hover:bg-green-500/10">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Disponible
              </Badge>
              <Badge variant="outline" className="border-primary/30 text-primary">
                100% — Déjà lancée
              </Badge>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Centre de Formation{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                IEBC
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Plateforme de formation professionnelle offrant des cours certifiants en
              <strong> finance islamique</strong>, commerce international, management et technologies.
              Développez vos compétences avec nos experts en zone CEMAC.
            </p>

            <ul className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: Award, label: "Formations certifiantes en finance islamique" },
                { icon: BookOpen, label: "Cours en ligne et présentiel" },
                { icon: Video, label: "Cours en visioconférence" },
                { icon: Users, label: "Formateurs experts & accompagnement personnalisé" },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-start gap-2 text-sm">
                  <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary group">
                  Commencer
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline">
                  Voir les cours
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative lg:h-[500px] hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3"></div>
            <div className="relative h-full bg-gradient-to-br from-primary to-accent rounded-3xl overflow-hidden">
              <div className="relative h-full flex items-center justify-center p-12">
                <div className="text-center text-white space-y-6">
                  <GraduationCap className="h-16 w-16 mx-auto" />
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold mb-2">IEBC E-Learning</h3>
                    <p className="text-white/90 text-sm">
                      Cours vidéo, QCM interactifs, certifications et suivi de progression
                    </p>
                  </div>
                  <p className="text-xs text-white/80">
                    NB : Programmes spécialisés en finance & produits de la finance islamique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
