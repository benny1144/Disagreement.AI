// client/src/types/index.ts
export interface Message {
  _id: string;
  text: string;
  user: { // Standardized to 'user' to match your schema
    _id: string;
    name: string;
  };
  createdAt: string;
}

export interface Disagreement {
  _id: string;
  title: string;
  messages: Message[];
  participants: any[];
}