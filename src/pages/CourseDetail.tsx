import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses } from "@/data/courses";
import { useParams, Link, Navigate } from "react-router-dom";
import { Clock, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();
  const course = courses.find(c => c.id === id);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline">{course.category}</Badge>
                  <Badge variant="secondary">{course.level}</Badge>
                  {course.featured && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      Featured
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {course.title}
                </h1>
                
                <p className="text-lg text-muted-foreground">
                  {course.description}
                </p>

                <div className="flex items-center gap-6 mt-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>{course.modules.length} Modules</span>
                  </div>
                </div>
              </div>

              <div className="h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
                <div className="space-y-4">
                  {course.modules.map((module, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">Module {index + 1}</h3>
                        <p className="text-muted-foreground">{module}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="sticky top-24 bg-card rounded-2xl p-8 shadow-[var(--shadow-elevated)] border border-border">
                <div className="space-y-6">
                  <div>
                    <p className="text-3xl font-bold text-primary mb-2">
                      {course.price.toLocaleString()} XAF
                    </p>
                    <p className="text-sm text-muted-foreground">One-time payment</p>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-semibold mb-4">This course includes:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Lifetime access</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Self-paced learning</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span>Expert instructor support</span>
                      </li>
                    </ul>
                  </div>

                  <Link to="/register" className="block">
                    <Button size="lg" className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary group">
                      Enroll Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>

                  <div className="text-center text-sm text-muted-foreground">
                    <p>Registration fee: 5,000 XAF</p>
                    <p className="mt-1">Required before enrolling</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
