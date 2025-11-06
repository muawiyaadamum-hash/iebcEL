import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                Learn at Your Own Pace
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Transform Your Future with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MTech Academy
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl">
              Professional online courses in Technology, Business, HR, and Logistics. 
              Start learning today with flexible modules designed for your success.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary group">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button size="lg" variant="outline">
                  Browse Courses
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">8+</span>
                </div>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">Flexible</span>
                </div>
                <p className="text-sm text-muted-foreground">Learning</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">Career</span>
                </div>
                <p className="text-sm text-muted-foreground">Growth</p>
              </div>
            </div>
          </div>

          <div className="relative lg:h-[500px] hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl transform rotate-3"></div>
            <div className="relative h-full bg-gradient-to-br from-primary to-accent rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20"></div>
              <div className="relative h-full flex items-center justify-center p-12">
                <div className="text-center text-white space-y-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-3xl font-bold mb-2">5,000 XAF</h3>
                    <p className="text-white/90">Registration Fee</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                    <h3 className="text-3xl font-bold mb-2">15,000 XAF</h3>
                    <p className="text-white/90">Per Course</p>
                  </div>
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
