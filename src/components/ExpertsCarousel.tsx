import { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import expert1 from "@/assets/islamic-finance-expert-1.jpg";
import expert2 from "@/assets/islamic-finance-expert-2.jpg";
import team from "@/assets/islamic-finance-experts-team.jpg";
import scholar from "@/assets/islamic-finance-scholar.jpg";
import { getWhatsAppLink } from "@/components/WhatsAppButton";

const slides = [
  {
    image: expert1,
    title: "Une communauté d'experts en finance islamique",
    subtitle: "Des professionnels certifiés au service de votre montée en compétences",
  },
  {
    image: expert2,
    title: "Femmes leaders de la finance conforme à la Shariah",
    subtitle: "Banque participative, takaful, sukuk : un écosystème porté par des expertes",
  },
  {
    image: team,
    title: "Apprenez aux côtés de praticiens du marché CEMAC",
    subtitle: "Études de cas réelles, contrats Murabaha, Ijara, Mudaraba et Musharaka",
  },
  {
    image: scholar,
    title: "Encadrement par des oulémas et docteurs en fiqh al-muamalat",
    subtitle: "Un enseignement rigoureux, fidèle aux principes de la Shariah",
  },
];

const ExpertsCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 5000, stopOnInteraction: false })],
  );

  useEffect(() => {
    if (!emblaApi) return;
  }, [emblaApi]);

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Notre communauté d'experts en finance islamique
          </h2>
          <p className="text-muted-foreground">
            Des professionnels musulmans qualifiés, des chercheurs et des praticiens vous accompagnent
            tout au long de votre parcours certifiant.
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
            <div className="flex">
              {slides.map((s, i) => (
                <div key={i} className="relative flex-[0_0_100%] min-w-0">
                  <div className="relative aspect-[16/8] md:aspect-[16/6] w-full overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.title}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex items-center">
                      <div className="px-6 md:px-12 max-w-2xl text-white">
                        <h3 className="text-2xl md:text-4xl font-bold mb-3 leading-tight">
                          {s.title}
                        </h3>
                        <p className="text-sm md:text-lg text-white/90 mb-6">{s.subtitle}</p>
                        <div className="flex flex-wrap gap-3">
                          <Link to="/courses">
                            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                              Découvrir les cursus
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to="/register">
                            <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/40 text-white hover:bg-white/20 hover:text-white">
                              S'inscrire
                            </Button>
                          </Link>
                          <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
                              <MessageCircle className="mr-2 h-4 w-4" />
                              Parler à un conseiller
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            aria-label="Précédent"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Suivant"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur border border-border flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExpertsCarousel;
