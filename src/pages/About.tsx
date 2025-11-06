import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users, Award, BookOpen } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              About MTech Academy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Empowering the next generation of professionals in Cameroon through quality online education
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                MTech Academy is dedicated to providing accessible, high-quality online education 
                to students across Cameroon. We believe that everyone deserves the opportunity to 
                learn new skills and advance their careers, regardless of their location or schedule.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our platform offers flexible, self-paced learning in technology, business, human resources, 
                and logistics, ensuring that our students can balance their education with their personal 
                and professional commitments.
              </p>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-80"></div>
              <div className="relative h-full flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <BookOpen className="h-20 w-20 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Learn. Grow. Succeed.</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Our Vision</h3>
                  <p className="text-sm text-muted-foreground">
                    To become Cameroon's leading online learning platform
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Expert Instructors</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn from industry professionals with real-world experience
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Certification</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn recognized certificates upon course completion
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">Flexible Learning</h3>
                  <p className="text-sm text-muted-foreground">
                    Study at your own pace with lifetime course access
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted/30 rounded-3xl p-12 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing the best learning experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">8+</div>
                <p className="text-muted-foreground">Professional Courses</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-muted-foreground">Online & Flexible</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">24/7</div>
                <p className="text-muted-foreground">Course Access</p>
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
