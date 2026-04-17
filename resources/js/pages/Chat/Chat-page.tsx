import React, { useState, useEffect, useRef } from "react";
import { useForm, usePage, router } from "@inertiajs/react";
import type { PageProps as InertiaPageProps } from "@inertiajs/core";
import { route } from "ziggy-js";

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  created_at: string;
}

interface CustomProps {
  messages: Message[];
  auth: {
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    } | null;
  };
  otherUser: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

type PageProps = InertiaPageProps & CustomProps;

export default function ChatPage() {
  const { props } = usePage<PageProps>();
  const { ziggy } = props as any;
  const { messages, auth, otherUser } = props;

  const authUserId = auth.user?.id;
  const [messageList, setMessageList] = useState<Message[]>(messages);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { data, setData, post, reset } = useForm({
    message: "",
  });
    const users = auth?.user;

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.message.trim()) return;

    post(route("messages.store", otherUser.id, false, ziggy), {
      onSuccess: () => {
        setMessageList([
          ...messageList,
          {
            id: Date.now(),
            sender_id: authUserId!,
            receiver_id: otherUser.id,
            message: data.message,
            created_at: new Date().toISOString(),
          },
        ]);
        reset("message");

        router.reload({ only: ["messages"] });
      },
    });
  };

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ["messages"] });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-white border rounded shadow">
      {/* Chat Header */}
      <div className="p-4 border-b font-semibold text-gray-700">
        Chat with {otherUser.first_name} {otherUser.last_name} ({otherUser.email})
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messageList.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender_id === authUserId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.sender_id === authUserId
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <p>{msg.message}</p>
              <span className="text-xs text-gray-500 block mt-1">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={data.message}
          onChange={(e) => setData("message", e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
