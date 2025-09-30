'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { Disagreement, Message } from '@/types';

interface ChatWindowProps {
  disagreement: Disagreement | null;
  messages: Message[]; // Receive messages as a prop
  onNewMessage: (messages: Message[]) => void; // Function to update parent state
}

export default function ChatWindow({ disagreement, messages, onNewMessage }: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !disagreement?._id) return;

    setLoading(true);
    // REMOVED: setIsAnalyzing(true);
    try {
      const response = await fetch(
        `/api/disagreements/${disagreement._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: messageText }),
        }
      );
      if (!response.ok) throw new Error("Failed to send message");
      const updatedDisagreement: Disagreement = await response.json();
      onNewMessage(updatedDisagreement.messages);
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      // REMOVED: setIsAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!disagreement?._id) return;

    setIsAnalyzing(true);
    try {
      // CORRECTED: Fixed typo in the URL from 'disagagreements'
      const response = await fetch(
        `/api/disagreements/${disagreement._id}/analyze`, 
        { method: "POST" }
      );
      if (!response.ok) throw new Error("Failed to analyze disagreement");
      const updatedDisagreement: Disagreement = await response.json();
      onNewMessage(updatedDisagreement.messages);
    } catch (error) {
      console.error("Error analyzing disagreement:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!disagreement) {
    return (
      <div className="flex-1 p-4 flex justify-center items-center bg-gray-700 text-gray-400">
        <p>Select a disagreement from the list to see the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col bg-gray-700">
      <div className="border-b-2 border-gray-600 pb-2 mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">{disagreement.title}</h1>
        <button
          onClick={handleAnalyze}
          disabled={loading || isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-purple-400 disabled:cursor-not-allowed"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      <div className="flex-grow space-y-4 overflow-y-auto text-white mb-4 pr-2">
        {messages.map((msg) => (
          <div key={msg._id} className="flex flex-col">
            <span className="text-xs text-gray-400">
              {msg.user?.name || "Unknown User"}
            </span>
            <div className="p-3 rounded-lg bg-gray-800 max-w-lg">
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          placeholder="Type your message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          disabled={loading || isAnalyzing} // Also disable while analyzing
          className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading || isAnalyzing} // Also disable while analyzing
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}