// client/src/app/dashboard/page.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import { useEffect, useState, useRef } from 'react';
import { Disagreement, Message } from '@/types';
import { io, Socket } from 'socket.io-client';

export default function DashboardPage() {
  const [disagreements, setDisagreements] = useState<Disagreement[]>([]);
  const [selectedDisagreement, setSelectedDisagreement] = useState<Disagreement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Fetch initial list of disagreements
  const fetchDisagreements = async () => {
    try {
      const response = await fetch('/api/disagreements');
      if (!response.ok) throw new Error('Failed to fetch disagreements');
      const data = await response.json();
      setDisagreements(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDisagreements();

    // Establish socket connection on component mount
    socketRef.current = io('http://localhost:5000'); // Use your backend URL

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current?.id);
    });

    // Clean up the connection when the component unmounts
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // NEW: useEffect to manage socket listeners for the selected disagreement
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !selectedDisagreement?._id) return;

    const eventName = `disagreement:${selectedDisagreement._id}:messages`;

    const handleNewMessages = (newMessages: Message[]) => {
      console.log('New message received from socket:', newMessages);
      setMessages(newMessages);
    };

    // Listen for new messages for the currently selected disagreement
    socket.on(eventName, handleNewMessages);

    // Clean up the listener when the component unmounts or the disagreement changes
    return () => {
      socket.off(eventName, handleNewMessages);
    };
  }, [selectedDisagreement]); // Re-run this effect when the selected disagreement changes

  // Handle selecting a new disagreement
  const handleSelectDisagreement = (disagreement: Disagreement) => {
    console.log("Selected Disagreement:", disagreement);
    setSelectedDisagreement(disagreement);
    setMessages(disagreement.messages || []);
  };

  // Handle new message creation (for sending)
  const handleNewMessage = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar 
        disagreements={disagreements} 
        onDisagreementCreated={fetchDisagreements}
        selectedDisagreement={selectedDisagreement}
        onSelectDisagreement={handleSelectDisagreement}
      />
      <ChatWindow 
        disagreement={selectedDisagreement} 
        messages={messages}
        onNewMessage={handleNewMessage}
      />
    </div>
  );
}