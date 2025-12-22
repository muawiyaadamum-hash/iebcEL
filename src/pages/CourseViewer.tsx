import { useEffect, useState } from "react";
import { useParams, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { courses } from "@/data/courses";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Lock,
  Award,
  BookOpen,
  Download,
  ArrowLeft,
  GraduationCap
} from "lucide-react";

interface ModuleProgress {
  module_id: string;
  completed: boolean;
  completed_at: string | null;
}

const CourseViewer = () => {
  useScrollToTop();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);

  const course = courses.find(c => c.id === id);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !course) {
        setLoading(false);
        return;
      }

      try {
        // Check enrollment
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .eq("payment_status", "completed")
          .single();

        if (enrollment) {
          setIsEnrolled(true);
          setEnrollmentId(enrollment.id);

          // Fetch module progress
          const { data: progress } = await supabase
            .from("module_progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", course.id);

          if (progress) {
            setModuleProgress(progress.map(p => ({
              module_id: p.module_id,
              completed: p.completed || false,
              completed_at: p.completed_at
            })));
          }
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkEnrollment();
    }
  }, [user, authLoading, course]);

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isEnrolled === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="text-3xl font-bold mb-4">Course Not Accessible</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You need to enroll and complete payment to access this course content.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to={`/course/${course.id}`}>Enroll Now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const currentModule = course.modules[currentModuleIndex];
  const currentTopic = currentModule?.topics[currentTopicIndex];
  const totalTopics = course.modules.reduce((acc, m) => acc + m.topics.length, 0);
  
  // Calculate completed topics
  const completedModulesCount = moduleProgress.filter(p => p.completed).length;
  const overallProgress = Math.round((completedModulesCount / course.modules.length) * 100);
  
  const isModuleCompleted = (moduleIndex: number) => {
    const moduleId = `module-${moduleIndex}`;
    return moduleProgress.some(p => p.module_id === moduleId && p.completed);
  };

  const isAllCompleted = completedModulesCount === course.modules.length;

  const markModuleComplete = async () => {
    if (!user || !course) return;

    const moduleId = `module-${currentModuleIndex}`;
    
    try {
      // Check if already exists
      const existing = moduleProgress.find(p => p.module_id === moduleId);
      
      if (existing) {
        // Update
        await supabase
          .from("module_progress")
          .update({ completed: true, completed_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("course_id", course.id)
          .eq("module_id", moduleId);
      } else {
        // Insert
        await supabase
          .from("module_progress")
          .insert({
            user_id: user.id,
            course_id: course.id,
            module_id: moduleId,
            completed: true,
            completed_at: new Date().toISOString()
          });
      }

      // Update local state
      setModuleProgress(prev => {
        const updated = prev.filter(p => p.module_id !== moduleId);
        return [...updated, { module_id: moduleId, completed: true, completed_at: new Date().toISOString() }];
      });

      // Update enrollment progress
      const newProgress = Math.round(((completedModulesCount + 1) / course.modules.length) * 100);
      await supabase
        .from("enrollments")
        .update({ 
          progress: newProgress,
          ...(newProgress === 100 ? { completed_at: new Date().toISOString() } : {})
        })
        .eq("id", enrollmentId);

      toast.success("Module completed!");

      // Auto-advance to next module
      if (currentModuleIndex < course.modules.length - 1) {
        setCurrentModuleIndex(prev => prev + 1);
        setCurrentTopicIndex(0);
      } else if (newProgress === 100) {
        setShowCertificate(true);
      }
    } catch (error) {
      console.error("Error marking module complete:", error);
      toast.error("Failed to save progress");
    }
  };

  const goToNextTopic = () => {
    if (currentTopicIndex < currentModule.topics.length - 1) {
      setCurrentTopicIndex(prev => prev + 1);
    } else if (currentModuleIndex < course.modules.length - 1) {
      // Prompt to mark module complete before moving on
      if (!isModuleCompleted(currentModuleIndex)) {
        markModuleComplete();
      } else {
        setCurrentModuleIndex(prev => prev + 1);
        setCurrentTopicIndex(0);
      }
    }
  };

  const goToPreviousTopic = () => {
    if (currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(prev => prev - 1);
      setCurrentTopicIndex(course.modules[currentModuleIndex - 1].topics.length - 1);
    }
  };

  const selectModule = (moduleIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentTopicIndex(0);
  };

  // Certificate Modal
  if (showCertificate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-8">
              <Award className="h-20 w-20 mx-auto text-secondary mb-4" />
              <h1 className="text-4xl font-bold mb-2">Congratulations!</h1>
              <p className="text-xl text-muted-foreground">
                You've completed the {course.title} course
              </p>
            </div>

            {/* Certificate Preview */}
            <Card className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 border-2 border-primary/20 overflow-hidden">
              <CardContent className="p-8 md:p-12">
                <div className="text-center space-y-6">
                  <div className="flex justify-center gap-2 items-center">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <span className="text-2xl font-bold text-primary">MTech Academy</span>
                  </div>
                  
                  <div className="py-6 border-t border-b border-border">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">
                      Certificate of Completion
                    </p>
                    <h2 className="text-3xl font-bold mb-4">{course.title}</h2>
                    <p className="text-lg">
                      This certifies that <span className="font-semibold">{user?.email}</span> has successfully completed
                      all {course.modules.length} modules of this course.
                    </p>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium">Date Completed</p>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="font-medium">Course Duration</p>
                      <p>{course.duration}</p>
                    </div>
                    <div>
                      <p className="font-medium">Course Level</p>
                      <p>{course.level}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center mt-8">
              <Button size="lg" onClick={() => setShowCertificate(false)}>
                <BookOpen className="mr-2 h-4 w-4" />
                Review Course
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar - Module List */}
        <aside className="w-full lg:w-80 border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <Button variant="ghost" size="sm" asChild className="mb-4">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h2 className="font-bold text-lg line-clamp-2">{course.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={overallProgress} className="flex-1 h-2" />
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 space-y-2">
              {course.modules.map((module, moduleIndex) => {
                const isCompleted = isModuleCompleted(moduleIndex);
                const isActive = moduleIndex === currentModuleIndex;
                
                return (
                  <button
                    key={moduleIndex}
                    onClick={() => selectModule(moduleIndex)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        ) : (
                          <Circle className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Module {moduleIndex + 1}</p>
                        <p className={`text-sm ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'} line-clamp-2`}>
                          {module.title}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Show Certificate Button if completed */}
          {isAllCompleted && (
            <div className="p-4 border-t border-border">
              <Button 
                className="w-full bg-gradient-to-r from-secondary to-secondary/80"
                onClick={() => setShowCertificate(true)}
              >
                <Award className="mr-2 h-4 w-4" />
                View Certificate
              </Button>
            </div>
          )}
        </aside>

        {/* Main Content - Slide View */}
        <main className="flex-1 flex flex-col">
          {/* Module Header */}
          <div className="border-b border-border p-4 bg-background">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="outline" className="mb-2">
                  Module {currentModuleIndex + 1} of {course.modules.length}
                </Badge>
                <h1 className="text-2xl font-bold">{currentModule.title}</h1>
              </div>
              {!isModuleCompleted(currentModuleIndex) && (
                <Button onClick={markModuleComplete} variant="outline">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              {isModuleCompleted(currentModuleIndex) && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Content Slide */}
          <div className="flex-1 p-8 flex items-center justify-center">
            <Card className="w-full max-w-4xl min-h-[400px] bg-gradient-to-br from-muted/50 to-background border-2">
              <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center h-full">
                <div className="text-center space-y-6">
                  <Badge className="text-lg px-4 py-1">
                    Topic {currentTopicIndex + 1} of {currentModule.topics.length}
                  </Badge>
                  
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {currentTopic}
                  </h2>
                  
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    This topic covers essential concepts and practical applications.
                    Review the material carefully and proceed when ready.
                  </p>

                  <div className="flex items-center justify-center gap-4 pt-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      <span>{course.level}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Footer */}
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={goToPreviousTopic}
                disabled={currentModuleIndex === 0 && currentTopicIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                {currentModule.topics.map((_, i) => (
                  <span
                    key={i}
                    className={`inline-block w-2 h-2 rounded-full mx-1 ${
                      i === currentTopicIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={goToNextTopic}
                disabled={
                  currentModuleIndex === course.modules.length - 1 && 
                  currentTopicIndex === currentModule.topics.length - 1 &&
                  isModuleCompleted(currentModuleIndex)
                }
              >
                {currentModuleIndex === course.modules.length - 1 && 
                 currentTopicIndex === currentModule.topics.length - 1 
                  ? (isModuleCompleted(currentModuleIndex) ? 'Completed' : 'Complete Module')
                  : 'Next'}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseViewer;
