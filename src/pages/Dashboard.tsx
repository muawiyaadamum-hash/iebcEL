import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  BookOpen, 
  Award, 
  Clock, 
  GraduationCap,
  User,
  LogOut,
  ChevronRight,
  Bell
} from "lucide-react";
import { courses } from "@/data/courses";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface Profile {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}

interface Enrollment {
  id: string;
  course_id: string;
  enrolled_at: string;
  payment_status: string;
  progress: number;
  completed_at: string | null;
}

const Dashboard = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const { requestPermission, isEnabled, isSupported } = usePushNotifications();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, email, phone, avatar_url")
          .eq("user_id", user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch enrollments
        const { data: enrollmentsData } = await supabase
          .from("enrollments")
          .select("*")
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false });

        if (enrollmentsData) {
          setEnrollments(enrollmentsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return { ...enrollment, course };
  }).filter(e => e.course);

  const completedCourses = enrolledCourses.filter(e => e.completed_at);
  const inProgressCourses = enrolledCourses.filter(e => !e.completed_at && e.payment_status === 'completed');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
              </h1>
              <p className="text-muted-foreground">
                Track your learning progress and manage your courses
              </p>
            </div>
            <div className="flex gap-2">
              {isSupported && !isEnabled && (
                <Button variant="outline" size="sm" onClick={requestPermission}>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                    <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{inProgressCourses.length}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedCourses.length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedCourses.length}</p>
                    <p className="text-sm text-muted-foreground">Certificates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="courses" className="space-y-6">
            <TabsList>
              <TabsTrigger value="courses">My Courses</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses">
              {enrolledCourses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your learning journey by enrolling in a course
                    </p>
                    <Button asChild>
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {enrolledCourses.map(({ course, ...enrollment }) => (
                    <Card key={enrollment.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 h-32 md:h-auto">
                          <img 
                            src={course!.image} 
                            alt={course!.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-lg">{course!.title}</h3>
                              <p className="text-sm text-muted-foreground">{course!.duration}</p>
                            </div>
                            <Badge variant="default">
                              Active
                            </Badge>
                          </div>
                          
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </span>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/learn/${course!.id}`}>
                                Continue Learning
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Your account details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                      <p className="text-lg">{profile?.full_name || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-lg">{profile?.email || user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-lg">{profile?.phone || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                      <p className="text-lg">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
