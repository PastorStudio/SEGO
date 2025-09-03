

'use client'

import { getUsers, getGeneralChatMessages } from "@/lib/data";
import { ChatClient } from "./_components/chat-client";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { User, ChatMessage } from "@/lib/definitions";
import { useAuth } from "@/hooks/use-auth.tsx";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');
  const { users } = useAuth(); // Get users from the auth context

  const [generalMessages, setGeneralMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchData() {
      // Users are already available from context, just fetch messages
      const generalMessagesData = await getGeneralChatMessages();
      setGeneralMessages(generalMessagesData);
      setLoading(false);
    }
    fetchData();
  }, []);


  if (loading) {
    return <div>Cargando chat...</div>;
  }
  
  return (
    <ChatClient 
        users={users}
        initialGeneralMessages={generalMessages}
        initialSelectedUserId={userId}
    />
  )
}


export default function ChatPageContainer() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ChatPageContent />
    </Suspense>
  )
}
