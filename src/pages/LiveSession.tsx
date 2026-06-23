import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, ArrowLeft, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const LiveSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("Participant");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase.from("live_sessions").select("*, cursus:cursus(title,slug)").eq("id", id).maybeSingle();
      setSession(data);
      if (user) {
        const { data: p } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
        if (p?.full_name) setDisplayName(p.full_name);
      }
      setLoading(false);
    })();
  }, [id, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!session) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <section className="py-20 text-center"><div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-4">Session introuvable</h1>
          <Button onClick={() => navigate("/courses")}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button>
        </div></section><Footer />
      </div>
    );
  }

  const room = (session.room_name || `iebc-${session.id}`).replace(/[^a-zA-Z0-9-_]/g, "");
  const jitsiUrl = `https://meet.jit.si/${room}#userInfo.displayName="${encodeURIComponent(displayName)}"&config.prejoinPageEnabled=false`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <section className="flex-1 py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-2"><ArrowLeft className="h-4 w-4 mr-1" />Retour</Button>
              <h1 className="text-2xl font-bold flex items-center gap-2"><Video className="h-6 w-6 text-primary" />{session.title}</h1>
              {session.cursus?.title && <p className="text-sm text-muted-foreground">{session.cursus.title}</p>}
            </div>
          </div>

          {session.provider === "external" ? (
            <Card>
              <CardHeader><CardTitle>Lien de réunion externe</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{session.description}</p>
                <Button size="lg" asChild>
                  <a href={session.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5 mr-2" />Rejoindre la réunion
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg overflow-hidden border bg-card" style={{ height: "75vh", minHeight: 500 }}>
              <iframe
                src={jitsiUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-0"
                title={session.title}
              />
            </div>
          )}

          {session.description && session.provider !== "external" && (
            <p className="text-sm text-muted-foreground mt-3">{session.description}</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LiveSession;
