import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, MicOff, Video as VideoIcon, VideoOff, MonitorUp, MonitorOff, PhoneOff, Play, Send, Users, Radio } from "lucide-react";
import { toast } from "sonner";

const ICE = { iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }] };

type ChatMsg = { id: string; from: string; name: string; text: string; ts: number };

interface Props {
  sessionId: string;
  sessionTitle: string;
  isBroadcaster: boolean;
  userId: string;
  displayName: string;
}

const LiveBroadcast = ({ sessionId, sessionTitle, isBroadcaster, userId, displayName }: Props) => {
  const [live, setLive] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "waiting" | "playing">("idle");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const broadcasterIdRef = useRef<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendSignal = useCallback((event: string, payload: any) => {
    channelRef.current?.send({ type: "broadcast", event, payload });
  }, []);

  const createPeerForViewer = useCallback((viewerId: string) => {
    const pc = new RTCPeerConnection(ICE);
    peersRef.current.set(viewerId, pc);
    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal("ice", { to: viewerId, from: userId, candidate: e.candidate });
    };
    pc.onconnectionstatechange = () => {
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        pc.close();
        peersRef.current.delete(viewerId);
      }
    };
    (async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal("offer", { to: viewerId, from: userId, sdp: pc.localDescription });
    })();
  }, [sendSignal, userId]);

  const createPeerForBroadcaster = useCallback((broadcasterId: string) => {
    let pc = peersRef.current.get(broadcasterId);
    if (pc) return pc;
    pc = new RTCPeerConnection(ICE);
    peersRef.current.set(broadcasterId, pc);
    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        setStatus("playing");
      }
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal("ice", { to: broadcasterId, from: userId, candidate: e.candidate });
    };
    return pc;
  }, [sendSignal, userId]);

  // Join channel
  useEffect(() => {
    const channel = supabase.channel(`live:${sessionId}`, {
      config: { presence: { key: userId }, broadcast: { self: false } },
    });
    channelRef.current = channel;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState() as Record<string, Array<{ role: string; name: string }>>;
      const list = Object.entries(state);
      setParticipants(list.length);
      const broadcaster = list.find(([, arr]) => arr[0]?.role === "broadcaster");
      const wasLive = live;
      const nowLive = !!broadcaster;
      if (broadcaster) broadcasterIdRef.current = broadcaster[0];
      setLive(nowLive);
      if (!isBroadcaster) {
        if (nowLive && !wasLive) setStatus("connecting");
        if (!nowLive) {
          setStatus("waiting");
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        }
      }
    });

    channel.on("presence", { event: "join" }, ({ key, newPresences }) => {
      const p = (newPresences as any)?.[0];
      if (!p) return;
      if (isBroadcaster && p.role === "viewer" && localStreamRef.current) {
        createPeerForViewer(key);
      }
    });

    channel.on("presence", { event: "leave" }, ({ key }) => {
      const pc = peersRef.current.get(key);
      if (pc) { pc.close(); peersRef.current.delete(key); }
    });

    channel.on("broadcast", { event: "offer" }, async ({ payload }) => {
      if (payload.to !== userId || isBroadcaster) return;
      const pc = createPeerForBroadcaster(payload.from);
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal("answer", { to: payload.from, from: userId, sdp: pc.localDescription });
    });

    channel.on("broadcast", { event: "answer" }, async ({ payload }) => {
      if (payload.to !== userId || !isBroadcaster) return;
      const pc = peersRef.current.get(payload.from);
      if (pc && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      }
    });

    channel.on("broadcast", { event: "ice" }, async ({ payload }) => {
      if (payload.to !== userId) return;
      const pc = peersRef.current.get(payload.from);
      if (pc && payload.candidate) {
        try { await pc.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
      }
    });

    channel.on("broadcast", { event: "chat" }, ({ payload }) => {
      setMessages((m) => [...m, payload as ChatMsg]);
    });

    channel.on("broadcast", { event: "end" }, () => {
      if (!isBroadcaster) {
        setStatus("waiting");
        setLive(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        peersRef.current.forEach((pc) => pc.close());
        peersRef.current.clear();
      }
    });

    channel.subscribe(async (s) => {
      if (s === "SUBSCRIBED") {
        await channel.track({ role: isBroadcaster ? "waiting-broadcaster" : "viewer", name: displayName });
        if (!isBroadcaster) setStatus("waiting");
      }
    });

    return () => {
      peersRef.current.forEach((pc) => pc.close());
      peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, userId, isBroadcaster, displayName]);

  const startBroadcast = async () => {
    try {
      setStatus("connecting");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      await channelRef.current?.track({ role: "broadcaster", name: displayName });
      await supabase.from("live_sessions").update({ status: "live", started_at: new Date().toISOString(), broadcaster_id: userId }).eq("id", sessionId);
      // create peer per current viewers
      const state = channelRef.current?.presenceState() as Record<string, any[]> | undefined;
      if (state) {
        Object.entries(state).forEach(([key, arr]) => {
          if (arr[0]?.role === "viewer") createPeerForViewer(key);
        });
      }
      setLive(true);
      setStatus("playing");
      toast.success("Diffusion démarrée");
    } catch (e: any) {
      setStatus("idle");
      toast.error(e.message || "Impossible d'accéder à la caméra/micro");
    }
  };

  const stopBroadcast = async () => {
    sendSignal("end", { from: userId });
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    await channelRef.current?.track({ role: "waiting-broadcaster", name: displayName });
    await supabase.from("live_sessions").update({ status: "ended" }).eq("id", sessionId);
    setLive(false); setStatus("idle"); setSharing(false);
    toast.success("Diffusion terminée");
  };

  const toggleMic = () => {
    const s = localStreamRef.current; if (!s) return;
    s.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn(s.getAudioTracks()[0]?.enabled ?? false);
  };
  const toggleCam = () => {
    const s = localStreamRef.current; if (!s) return;
    s.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn(s.getVideoTracks()[0]?.enabled ?? false);
  };

  const toggleShare = async () => {
    if (sharing) {
      // restore camera
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(camTrack);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setSharing(false);
      return;
    }
    try {
      const scr = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = scr;
      const track = scr.getVideoTracks()[0];
      peersRef.current.forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        sender?.replaceTrack(track);
      });
      if (localVideoRef.current) localVideoRef.current.srcObject = scr;
      track.onended = () => toggleShare();
      setSharing(true);
    } catch {
      toast.error("Partage d'écran annulé");
    }
  };

  const sendChat = () => {
    const text = draft.trim(); if (!text) return;
    const msg: ChatMsg = { id: crypto.randomUUID(), from: userId, name: displayName, text, ts: Date.now() };
    setMessages((m) => [...m, msg]);
    sendSignal("chat", msg);
    setDraft("");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-base">
            <Radio className={`h-5 w-5 ${live ? "text-red-500 animate-pulse" : "text-muted-foreground"}`} />
            {sessionTitle}
          </CardTitle>
          <div className="flex items-center gap-2">
            {live && <Badge className="bg-red-600 hover:bg-red-600">EN DIRECT</Badge>}
            <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{participants}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative bg-black aspect-video">
            {isBroadcaster ? (
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
            ) : (
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain" />
            )}
            {!isBroadcaster && status !== "playing" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2">
                <Radio className="h-10 w-10" />
                <p className="text-lg">
                  {status === "waiting" && "En attente du démarrage de la diffusion…"}
                  {status === "connecting" && "Connexion au flux en cours…"}
                  {status === "idle" && "Chargement…"}
                </p>
              </div>
            )}
            {isBroadcaster && !live && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button size="lg" onClick={startBroadcast}><Play className="h-5 w-5 mr-2" />Démarrer la diffusion</Button>
              </div>
            )}
          </div>
          {isBroadcaster && live && (
            <div className="flex items-center justify-center gap-2 p-3 bg-muted/40 flex-wrap">
              <Button variant={micOn ? "outline" : "destructive"} size="sm" onClick={toggleMic}>
                {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
              <Button variant={camOn ? "outline" : "destructive"} size="sm" onClick={toggleCam}>
                {camOn ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
              <Button variant={sharing ? "default" : "outline"} size="sm" onClick={toggleShare}>
                {sharing ? <MonitorOff className="h-4 w-4 mr-1" /> : <MonitorUp className="h-4 w-4 mr-1" />}
                {sharing ? "Arrêter partage" : "Partager écran"}
              </Button>
              <Button variant="destructive" size="sm" onClick={stopBroadcast}>
                <PhoneOff className="h-4 w-4 mr-1" />Terminer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex flex-col max-h-[calc(100vh-160px)]">
        <CardHeader className="py-3"><CardTitle className="text-base">Chat en direct</CardTitle></CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-2 text-sm">
          {messages.length === 0 && <p className="text-muted-foreground text-center py-4">Aucun message.</p>}
          {messages.map((m) => (
            <div key={m.id} className={`rounded-md p-2 ${m.from === userId ? "bg-primary/10 ml-6" : "bg-muted mr-6"}`}>
              <div className="text-xs font-medium">{m.name}</div>
              <div className="whitespace-pre-wrap break-words">{m.text}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </CardContent>
        <div className="p-2 border-t flex gap-2">
          <Input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Message…" />
          <Button size="icon" onClick={sendChat}><Send className="h-4 w-4" /></Button>
        </div>
      </Card>
    </div>
  );
};

export default LiveBroadcast;
