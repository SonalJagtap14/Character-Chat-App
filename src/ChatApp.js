import React, { useState, useRef, useEffect } from "react";
import { Plus, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";

// Replace with your API key or environment variable
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

const defaultCharacters = [
  {
    id: 1,
    name: "Detective Holmes",
    avatar: "/api/placeholder/40/40",
    background:
      "A brilliant detective with exceptional deductive reasoning skills. Graduated from Oxford, spent 15 years solving complex cases in London.",
    personality: {
      traits: ["Analytical", "Observant", "Direct", "Sometimes arrogant"],
      speechPattern: "Formal and precise, often uses deductive reasoning",
      interests: ["Criminal psychology", "Chemistry", "Classical music"],
      quirks: ["Always notices small details", "Plays violin when thinking"],
    },
    systemPrompt:
      "You are Detective Holmes, a brilliant detective with exceptional deductive reasoning skills. Your responses should: - Use formal, precise language - Include detailed observations about the situation - Apply deductive reasoning to solve problems - Occasionally reference your interests in chemistry and classical music - Maintain a slightly arrogant but ultimately helpful demeanor. Never break character or acknowledge being an AI.",
  },
  {
    id: 2,
    name: "Dr. Sarah Chen",
    avatar: "/api/placeholder/40/40",
    background:
      "A quantum physicist and futurist with expertise in theoretical physics and AI development. Works at CERN and frequently gives TED talks.",
    personality: {
      traits: ["Intellectual", "Enthusiastic", "Patient teacher", "Optimistic"],
      speechPattern:
        "Clear and educational, uses analogies to explain complex concepts",
      interests: [
        "Quantum mechanics",
        "Future technology",
        "Space exploration",
      ],
      quirks: ["Always relates things to physics", "Loves sci-fi references"],
    },
    systemPrompt:
      "You are Dr. Sarah Chen, a quantum physicist and futurist. Your responses should: - Break down complex concepts using clear analogies - Show enthusiasm for scientific discovery - Include occasional references to physics principles - Maintain an optimistic view of technology's potential - Use scientific terminology but explain it clearly. Never break character or acknowledge being an AI.",
  },
];

const ChatApp = () => {
  const [characters, setCharacters] = useState(defaultCharacters);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCharacter, setNewCharacter] = useState({
    name: "",
    background: "",
    personality: {
      traits: [],
      speechPattern: "",
      interests: [],
      quirks: [],
    },
    systemPrompt: "",
  });

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedCharacter) return;

    const userMessage = {
      type: "user",
      content: newMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are ${selectedCharacter.name}. ${
                  selectedCharacter.background
                } 
                  Your personality traits are: ${selectedCharacter.personality.traits.join(
                    ", "
                  )}.
                  Your speech pattern is: ${
                    selectedCharacter.personality.speechPattern
                  }
                  Your interests include: ${selectedCharacter.personality.interests.join(
                    ", "
                  )}
                  Your quirks include: ${selectedCharacter.personality.quirks.join(
                    ", "
                  )}
                  ${selectedCharacter.systemPrompt}
                  Respond in character, maintaining this unique voice and characteristics.
                  You may use markdown formatting in your responses.`,
              },
              ...messages.map((msg) => ({
                role: msg.type === "user" ? "user" : "assistant",
                content: msg.content,
              })),
              {
                role: "user",
                content: newMessage,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "An error occurred while getting the response"
        );
      }

      const aiMessage = {
        type: "ai",
        content: data.choices[0].message.content,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        type: "ai",
        content: "I apologize, but I'm having trouble responding right now.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCharacter = () => {
    const id = characters.length + 1;
    setCharacters((prev) => [...prev, { ...newCharacter, id }]);
    setIsModalOpen(false);
    setNewCharacter({
      name: "",
      background: "",
      personality: {
        traits: [],
        speechPattern: "",
        interests: [],
        quirks: [],
      },
      systemPrompt: "",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Add Character
          </Button>
        </div>
        <div className="overflow-y-auto h-full">
          {characters.map((char) => (
            <div
              key={char.id}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedCharacter?.id === char.id ? "bg-blue-50" : ""}`}
              onClick={() => setSelectedCharacter(char)}
            >
              <img
                src={char.avatar}
                alt={char.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h3 className="font-medium">{char.name}</h3>
                <p className="text-sm text-gray-500 truncate">
                  {char.background.slice(0, 30)}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-white shadow">
          <h2 className="text-xl font-semibold">
            {selectedCharacter
              ? `Chat with ${selectedCharacter.name}`
              : "Select a character to start chatting"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div>{message.content}</div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && handleSendMessage()
              }
              placeholder="Type your message..."
              disabled={!selectedCharacter || isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!selectedCharacter || !newMessage.trim() || isLoading}
              className="w-24"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span className="ml-2">{isLoading ? "Sending..." : "Send"}</span>
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newCharacter.name}
                onChange={(e) =>
                  setNewCharacter((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Background</label>
              <Textarea
                value={newCharacter.background}
                onChange={(e) =>
                  setNewCharacter((prev) => ({
                    ...prev,
                    background: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Personality Traits (comma-separated)
              </label>
              <Input
                value={newCharacter.personality.traits.join(", ")}
                onChange={(e) =>
                  setNewCharacter((prev) => ({
                    ...prev,
                    personality: {
                      ...prev.personality,
                      traits: e.target.value.split(",").map((t) => t.trim()),
                    },
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCharacter}>Add Character</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatApp;
