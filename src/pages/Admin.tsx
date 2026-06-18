import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { courses } from "@/data/courses";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import {
  Loader2,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Shield,
  Bell,
  Settings,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  RefreshCw,
  ClipboardList,
  FileText
} from "lucide-react";
import { AdminQuizAttempts, AdminProjectSubmissions } from "@/components/AdminEvaluations";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  payment_status: string;
  progress: number;
  completed_at: string | null;
  payment_reference: string | null;
}

interface UserWithEnrollments extends Profile {
  enrollments: Enrollment[];
  role: string;
}

const Admin = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithEnrollments[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("info");
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (roleData?.role !== "admin") {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        // Fetch all profiles
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        // Fetch all enrollments
        const { data: enrollmentsData } = await supabase
          .from("enrollments")
          .select("*")
          .order("enrolled_at", { ascending: false });

        // Fetch all user roles
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("*");

        if (profilesData) {
          const usersWithData = profilesData.map(profile => {
            const userEnrollments = enrollmentsData?.filter(e => e.user_id === profile.user_id) || [];
            const userRole = rolesData?.find(r => r.user_id === profile.user_id);
            return {
              ...profile,
              enrollments: userEnrollments,
              role: userRole?.role || "student"
            };
          });
          setUsers(usersWithData);
        }

        if (enrollmentsData) {
          setEnrollments(enrollmentsData);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkAdminAndFetchData();
    }
  }, [user, authLoading]);

  const handleUpdatePaymentStatus = async (enrollmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("enrollments")
        .update({ payment_status: newStatus })
        .eq("id", enrollmentId);

      if (error) throw error;

      setEnrollments(prev =>
        prev.map(e => e.id === enrollmentId ? { ...e, payment_status: newStatus } : e)
      );

      setUsers(prev =>
        prev.map(u => ({
          ...u,
          enrollments: u.enrollments.map(e =>
            e.id === enrollmentId ? { ...e, payment_status: newStatus } : e
          )
        }))
      );

      toast.success("Payment status updated");
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSendingNotification(true);
    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType,
          created_by: user?.id,
          is_global: true
        });

      if (error) throw error;

      toast.success("Notification sent successfully");
      setNotificationTitle("");
      setNotificationMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      toast.error("Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const { data: enrollmentsData } = await supabase
        .from("enrollments")
        .select("*")
        .order("enrolled_at", { ascending: false });

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("*");

      if (profilesData) {
        const usersWithData = profilesData.map(profile => {
          const userEnrollments = enrollmentsData?.filter(e => e.user_id === profile.user_id) || [];
          const userRole = rolesData?.find(r => r.user_id === profile.user_id);
          return {
            ...profile,
            enrollments: userEnrollments,
            role: userRole?.role || "student"
          };
        });
        setUsers(usersWithData);
      }

      if (enrollmentsData) {
        setEnrollments(enrollmentsData);
      }

      toast.success("Data refreshed");
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Shield className="h-16 w-16 mx-auto text-destructive mb-6" />
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You don't have permission to access the admin dashboard.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Calculate stats
  const totalUsers = users.length;
  const totalEnrollments = enrollments.length;
  const completedPayments = enrollments.filter(e => e.payment_status === "completed").length;
  const pendingPayments = enrollments.filter(e => e.payment_status === "pending").length;
  const totalRevenue = users.length * 10000; // Registration fee per user

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || courseId;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">
                Manage users, enrollments, and platform settings
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/admin/lms")} className="bg-gradient-to-r from-primary to-accent">
                <BookOpen className="h-4 w-4 mr-2" />Gestion pédagogique (LMS)
              </Button>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />Refresh Data
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-secondary/10">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalEnrollments}</p>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{completedPayments}</p>
                    <p className="text-sm text-muted-foreground">Paid Enrollments</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-accent/10">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(totalRevenue / 1000).toFixed(0)}k XAF</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
              <TabsTrigger value="quiz"><ClipboardList className="h-4 w-4 mr-1" />Quiz Attempts</TabsTrigger>
              <TabsTrigger value="projects"><FileText className="h-4 w-4 mr-1" />Projects</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>Manage registered users</CardDescription>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Enrollments</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.full_name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.phone || "N/A"}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                                {u.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{u.enrollments.length}</TableCell>
                            <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enrollments Tab */}
            <TabsContent value="enrollments">
              <Card>
                <CardHeader>
                  <CardTitle>All Enrollments</CardTitle>
                  <CardDescription>View and manage course enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Enrolled</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enrollments.map((enrollment) => {
                          const enrolledUser = users.find(u => u.user_id === enrollment.user_id);
                          return (
                            <TableRow key={enrollment.id}>
                              <TableCell className="font-medium max-w-[200px] truncate">
                                {getCourseName(enrollment.course_id)}
                              </TableCell>
                              <TableCell>{enrolledUser?.full_name || "Unknown"}</TableCell>
                              <TableCell>{getStatusBadge(enrollment.payment_status)}</TableCell>
                              <TableCell>{enrollment.progress}%</TableCell>
                              <TableCell>{new Date(enrollment.enrolled_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Select
                                  defaultValue={enrollment.payment_status}
                                  onValueChange={(value) => handleUpdatePaymentStatus(enrollment.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz">
              <AdminQuizAttempts />
            </TabsContent>

            <TabsContent value="projects">
              <AdminProjectSubmissions />
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Send Notification
                  </CardTitle>
                  <CardDescription>Send announcements to all users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Notification title..."
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Write your message..."
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={notificationType} onValueChange={setNotificationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSendNotification} disabled={sendingNotification}>
                    {sendingNotification ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Notification
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    All Courses
                  </CardTitle>
                  <CardDescription>View available courses and enrollment stats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Enrollments</TableHead>
                          <TableHead>Completed</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course) => {
                          const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
                          const completedEnrollments = courseEnrollments.filter(e => e.completed_at);
                          return (
                            <TableRow key={course.id}>
                              <TableCell className="font-medium">{course.title}</TableCell>
                              <TableCell>{course.category}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{course.level}</Badge>
                              </TableCell>
                              <TableCell>{course.duration}</TableCell>
                              <TableCell>{courseEnrollments.length}</TableCell>
                              <TableCell>{completedEnrollments.length}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
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

export default Admin;
