import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { courses } from "@/data/courses";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { Clock, TrendingUp, CheckCircle2, ArrowRight, FileText, Award, MessageCircle, User, LogIn, Loader2, BookOpen } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/contexts/AuthContext";
import { getWhatsAppLink } from "@/components/WhatsAppButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CourseDetail = () => {
  useScrollToTop();
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolling, setEnrolling] = useState(false);
  const course = courses.find(c => c.id === id);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  const whatsappConsultMessage = `Hello MTech Academy! I have questions about the ${course.title} course. Can you help me understand if this is right for me?`;

  const handleEnrollNow = async () => {
    if (!user || !course) return;
    
    setEnrolling(true);
    
    try {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from("enrollments")
        .select("id, payment_status")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .maybeSingle();

      if (existingEnrollment) {
        if (existingEnrollment.payment_status === "completed") {
          toast.info("You're already enrolled! Redirecting to course...");
          navigate(`/learn/${course.id}`);
          return;
        }
        // Update existing enrollment to completed (free enrollment)
        await supabase
          .from("enrollments")
          .update({ payment_status: "completed" })
          .eq("id", existingEnrollment.id);
        
        toast.success("Enrollment completed! Starting your course...");
        navigate(`/learn/${course.id}`);
        return;
      }

      // Create new enrollment with completed status (free enrollment)
      const { error } = await supabase
        .from("enrollments")
        .insert({
          user_id: user.id,
          course_id: course.id,
          payment_status: "completed",
          progress: 0,
        });

      if (error) {
        console.error("Error creating enrollment:", error);
        toast.error("Failed to enroll. Please try again.");
        setEnrolling(false);
        return;
      }

      toast.success("Successfully enrolled! Starting your course...");
      navigate(`/learn/${course.id}`);
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

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
                
                <p className="text-lg text-muted-foreground mb-6">
                  {course.description}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>{course.modules.length} Modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>PDF Format</span>
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

              {/* Tabs for Course Content */}
              <Tabs defaultValue="modules" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="modules">Course Modules</TabsTrigger>
                  <TabsTrigger value="outcomes">Learning Outcomes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="modules" className="space-y-4 mt-6">
                  <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
                  <p className="text-muted-foreground mb-6">
                    This course is structured into comprehensive modules, each covering essential topics. 
                    All materials are provided in PDF format for self-paced learning.
                  </p>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {course.modules.map((module, index) => (
                      <AccordionItem key={index} value={`module-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{module.title}</h3>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-11 space-y-2">
                            {module.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-start gap-2 py-2">
                                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground text-sm">{topic}</span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </TabsContent>
                
                <TabsContent value="outcomes" className="space-y-4 mt-6">
                  <h2 className="text-2xl font-bold mb-4">What You Will Achieve</h2>
                  <p className="text-muted-foreground mb-6">
                    Upon completing this course, you will have gained the following skills and knowledge:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.learningOutcomes.map((outcome, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 transition-colors"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{outcome}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <div className="sticky top-24 bg-card rounded-2xl p-8 shadow-[var(--shadow-elevated)] border border-border space-y-6">
                <div>
                  <Badge className="bg-green-500 text-white mb-2">FREE ACCESS</Badge>
                  <p className="text-3xl font-bold text-primary mb-2">
                    Free
                  </p>
                  <p className="text-sm text-muted-foreground">Start learning today - no payment required</p>
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
                      <span>Interactive PDF materials</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Certificate of completion</span>
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>24/7 support access</span>
                    </li>
                  </ul>
                </div>

                {user ? (
                  <>
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary group"
                      onClick={handleEnrollNow}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Start Learning Now
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Create an account to start learning
                      </p>
                      <div className="space-y-2">
                        <Link to="/register" className="block">
                          <Button 
                            size="lg" 
                            className="w-full bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Create Free Account
                          </Button>
                        </Link>
                        <Link to="/auth" className="block">
                          <Button 
                            size="lg" 
                            variant="outline"
                            className="w-full"
                          >
                            <LogIn className="mr-2 h-4 w-4" />
                            Already have account? Login
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </>
                )}

                <a 
                  href={getWhatsAppLink(whatsappConsultMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button 
                    size="lg" 
                    variant="ghost"
                    className="w-full text-muted-foreground hover:text-foreground"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Need help choosing? Consult us
                  </Button>
                </a>

                <div className="text-center text-sm text-muted-foreground border-t border-border pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <Award className="h-4 w-4" />
                    <p className="font-semibold">100% Free Access</p>
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
