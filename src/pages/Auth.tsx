import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    education: "",
    password: "",
    confirmPassword: ""
  });

  const resolveHomeForUser = async (userId: string): Promise<string> => {
    const to = searchParams.get("to");
    if (to && to.startsWith("/")) return to;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const list = (roles || []).map((r: any) => r.role);
    if (list.includes("admin")) return "/admin";
    if (list.includes("responsable_pedagogique") || list.includes("formateur")) return "/pedagogique";
    if (list.includes("student")) return "/etudiant";
    return "/dashboard";
  };

  useEffect(() => {
    if (!loading && user) {
      resolveHomeForUser(user.id).then((path) => navigate(path));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials" 
          ? "Incorrect email or password. Please try again." 
          : error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome Back!",
        description: "You have successfully logged in."
      });
      const { data: authData } = await supabase.auth.getUser();
      const uid = authData?.user?.id;
      const path = uid ? await resolveHomeForUser(uid) : "/dashboard";
      navigate(path);

    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      emailSchema.parse(signupData.email);
      passwordSchema.parse(signupData.password);
      
      if (signupData.password !== signupData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive"
        });
        return;
      }
      
      if (!signupData.fullName.trim()) {
        toast({
          title: "Name Required",
          description: "Please enter your full name",
          variant: "destructive"
        });
        return;
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: err.errors[0].message,
          variant: "destructive"
        });
        return;
      }
    }
    
    setIsSubmitting(true);

    // Only send metadata fields that have values.
    // (Avoid sending empty strings like date_of_birth="" which can break backend parsing.)
    const metadata: Record<string, string> = {
      full_name: signupData.fullName.trim(),
    };
    if (signupData.phone.trim()) metadata.phone = signupData.phone.trim();
    if (signupData.dateOfBirth) metadata.date_of_birth = signupData.dateOfBirth;
    if (signupData.address.trim()) metadata.address = signupData.address.trim();
    if (signupData.education.trim()) metadata.education = signupData.education.trim();

    const { error } = await signUp(signupData.email.trim(), signupData.password, metadata);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account Exists",
          description: "This email is already registered. Please login instead.",
          variant: "destructive"
        });
        setActiveTab("login");
      } else {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Account Created!",
        description: "Welcome to Centre de Formation IEBC. Redirecting to your dashboard..."
      });
      navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Centre de Formation IEBC</h1>
            <p className="text-muted-foreground">
              Access your student dashboard
            </p>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {activeTab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name *</Label>
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone Number</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+237 XXX XXX XXX"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password *</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm *</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="••••••••"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/auth?to=/pedagogique")}
              className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4 inline-flex items-center gap-1"
            >
              <GraduationCap className="h-4 w-4" />
              Espace Pédagogique / Formateurs — Se connecter
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Les comptes pédagogiques sont créés par un administrateur.
            </p>
          </div>
        </div>

      </section>

      <Footer />
    </div>
  );
};

export default Auth;
