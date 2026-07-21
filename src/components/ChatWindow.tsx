"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Message = {
  id: string;
  sender_role: "trainer" | "client";
  content: string;
  created_at: string;
  read_at: string | null;
};

type Props = {
  trainerId: string;
  clientId: string;
  myRole: "trainer" | "client";
  clientName: string;
};

export default function ChatWindow({ trainerId, clientId, myRole, clientName }: Props) {
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("id, sender_role, content, created_at, read_at")
      .eq("trainer_id", trainerId)
      .eq("client_id", clientId)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((data as Message[]) ?? []);
    setLoading(false);
  }, [supabase, trainerId, clientId]);

  useEffect(() => {
    loadMessages();

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${trainerId}:${clientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `trainer_id=eq.${trainerId}`,
        },
        (payload) => {
          const msg = payload.new as Message & { client_id: string };
          if (msg.client_id === clientId) {
            setMessages(prev => {
              if (prev.find(m => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [trainerId, clientId, loadMessages, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark incoming messages as read
  useEffect(() => {
    const unread = messages.filter(m => m.sender_role !== myRole && !m.read_at);
    if (unread.length === 0) return;
    const ids = unread.map(m => m.id);
    supabase.from("messages").update({ read_at: new Date().toISOString() }).in("id", ids).then(() => {});
  }, [messages, myRole, supabase]);

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    setInput("");
    const { error } = await supabase.from("messages").insert({
      trainer_id: trainerId,
      client_id: clientId,
      sender_role: myRole,
      content: text,
    });
    if (error) setInput(text);
    setSending(false);
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-2xl overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <MessageCircle className="h-4 w-4 text-indigo-600" />
        <span className="font-medium text-sm">{clientName}</span>
        <span className="ml-auto w-2 h-2 rounded-full bg-green-400" title="En línea" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading && <p className="text-center text-sm text-muted-foreground py-8">Cargando…</p>}
        {!loading && messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No hay mensajes todavía. ¡Sé el primero!</p>
        )}
        {messages.map(m => {
          const isMe = m.sender_role === myRole;
          return (
            <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                isMe
                  ? "bg-indigo-600 text-white rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )}>
                <p>{m.content}</p>
                <p className={cn("text-[10px] mt-0.5", isMe ? "text-indigo-200 text-right" : "text-muted-foreground")}>
                  {formatTime(m.created_at)}
                  {isMe && m.read_at && " ✓✓"}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Escribí un mensaje…"
          className="rounded-xl"
          disabled={sending}
        />
        <Button onClick={handleSend} disabled={sending || !input.trim()} size="sm" className="h-10 w-10 p-0 rounded-xl">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
