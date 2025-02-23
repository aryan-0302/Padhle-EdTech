import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import axios from "axios";

const Chatbot = ({ setShowChatbot }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Send message to Gemini API
  const sendMessage = async () => {
    setInput("");
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
        const response = await axios.post("http://localhost:4000/api/generate-content", { input });
        console.log(response.data);     

      const botMessage = {
        text: response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't understand that.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("API Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navbar (Title + Close Button) */}
      <div className="bg-blue-500 text-white px-4 py-3 flex justify-center items-center rounded-t-lg">
        <span className="font-semibold text-lg">AI ASSISTANT</span>
        {/* <button onClick={() => setShowChatbot(false)} className="text-white text-xl">
          <FaTimes />
        </button> */}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
        {messages.map((msg, index) => (
          <div key={index} className={`text-${msg.sender === "user" ? "right" : "left"}`}>
            <span className={`px-3 py-2 rounded-lg inline-block text-sm ${
              msg.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <p className="text-gray-500 text-sm">Typing...</p>}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t flex items-center gap-2 bg-white">
      <input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      sendMessage();
    }
  }}
  className="flex-1 p-2 border rounded-lg text-sm focus:outline-none"
  placeholder="Ask something..."
/>
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
