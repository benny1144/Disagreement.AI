// client/src/components/ChatWindow.tsx
import { Disagreement } from "@/app/dashboard/page"; // NEW: Import the Disagreement type

interface ChatWindowProps {
  disagreement: Disagreement | null; // NEW: The component now accepts a disagreement object or null
}

export default function ChatWindow({ disagreement }: ChatWindowProps) {
  // NEW: If no disagreement is selected, show a placeholder message
  if (!disagreement) {
    return (
      <div className="flex-1 p-4 flex justify-center items-center bg-gray-700 text-gray-400">
        <p>Select a disagreement from the list to see the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 flex flex-col bg-gray-700">
      <div className="border-b-2 border-gray-600 pb-2 mb-4">
        {/* NEW: Display the title of the selected disagreement */}
        <h1 className="text-xl font-bold text-white">{disagreement.title}</h1>
        <p className="text-sm text-gray-400">Participants: You, John Doe (placeholder)</p>
      </div>

      <div className="flex-grow text-white mb-4">
        <p>This is where the chat messages will appear for {disagreement.title}...</p>
      </div>

      <div className="flex">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full px-3 py-2 text-white bg-gray-800 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md">
          Send
        </button>
      </div>
    </div>
  );
}