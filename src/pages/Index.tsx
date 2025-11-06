import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CourseCard from "@/components/CourseCard";
import Footer from "@/components/Footer";
import { courses } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const featuredCourses = courses.filter(course => course.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      {/* Featured Courses Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Featured Courses
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start your learning journey with our most popular courses
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          <div className="text-center">
            <Link to="/courses">
              <Button size="lg" variant="outline" className="group">
                View All Courses
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose MTech Academy?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide quality education with flexible learning options
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] border border-border">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Learn at Your Pace</h3>
              <p className="text-muted-foreground">
                Access course materials anytime, anywhere. Study at your own speed with lifetime access.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] border border-border">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Affordable Pricing</h3>
              <p className="text-muted-foreground">
                Pay only 5,000 XAF registration fee and 15,000 XAF per course. No hidden costs.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl shadow-[var(--shadow-card)] border border-border">
              <div className="h-12 w-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expert Instructors</h3>
              <p className="text-muted-foreground">
                Learn from industry professionals with years of practical experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-12 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join MTech Academy today and unlock your potential with our comprehensive online courses.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Register Now
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
