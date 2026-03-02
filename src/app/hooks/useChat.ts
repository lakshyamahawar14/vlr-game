"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
  status?: "sending" | "sent" | "error";
}

export function useChat(passedUsername: string, isOpen: boolean) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [myId, setMyId] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState(0);
  const pendingIds = useRef<Set<string>>(new Set());
  const lastSentText = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const id = localStorage.getItem("vlr_duel_id");
    if (id) setMyId(id);

    const fetchMessages = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .gt("created_at", fiveMinutesAgo)
        .order("created_at", { ascending: true })
        .limit(50);
        
      if (data) {
        setMessages(data.map(m => ({ ...m, status: "sent" as const })));
      }
    };

    fetchMessages();

    const channel = supabase
      .channel("global_chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const incoming = payload.new as Message;
          const currentUserId = localStorage.getItem("vlr_duel_id");
          
          const isFromMe = incoming.sender_id === currentUserId;
          const isDuplicateText = incoming.message === lastSentText.current;

          if (pendingIds.current.has(incoming.id) || (isFromMe && isDuplicateText)) {
            pendingIds.current.delete(incoming.id);
            lastSentText.current = null;
            return;
          }

          if (!isOpen && !isFromMe) {
            setUnreadCount((prev) => prev + 1);
          }

          setMessages((prev) => {
            if (prev.find((m) => m.id === incoming.id)) return prev;
            const updated: Message[] = [...prev, { ...incoming, status: "sent" as const }];
            return updated.slice(-100);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const currentId = localStorage.getItem("vlr_duel_id") || "anon";
    const tempId = crypto.randomUUID();
    lastSentText.current = text;

    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentId,
      sender_name: passedUsername,
      message: text,
      created_at: new Date().toISOString(),
      status: "sending" as const,
    };

    setMessages((prev) => {
      const updated: Message[] = [...prev, optimisticMsg];
      return updated.slice(-100);
    });

    const { error, data } = await supabase
      .from("chat_messages")
      .insert([{ 
        sender_id: currentId, 
        sender_name: passedUsername, 
        message: text 
      }])
      .select()
      .single();

    if (error) {
      lastSentText.current = null;
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "error" as const } : m))
      );
    } else {
      pendingIds.current.add(data.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...data, status: "sent" as const } : m))
      );
    }
  };

  return { messages, sendMessage, myId, unreadCount };
}