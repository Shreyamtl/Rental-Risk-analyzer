import { useState, useRef, useEffect } from "react";
import api from "../api/axiosConfig";

export default function AgreementChat({ agreementId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post(`/agreements/${agreementId}/chat`, {
        message: input,
        history: messages,
      });
      setMessages([...updatedMessages, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-paper-dim dark:bg-white/5 backdrop-blur-xl border border-ink-900/30 dark:border-white/20 rounded-2xl overflow-hidden shadow-xl shadow-black/10 dark:shadow-black/20 transition-all duration-300 hover:border-seal/30 dark:hover:border-white/30">
      <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-ink-900/5 dark:from-white/5 to-transparent border-b border-ink-900/10 dark:border-white/10">
        <div className="relative">
          <span className="w-2.5 h-2.5 rounded-full bg-stamp-green dark:bg-emerald-400 inline-block animate-pulse" />
          <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-stamp-green dark:bg-emerald-400 animate-ping opacity-75" />
        </div>
        <span className="text-ink-900 dark:text-white font-medium text-sm tracking-wide">
          AI Assistant
        </span>
        <span className="ml-auto text-stamp-green text-[10px] font-mono tracking-widest uppercase">
          Online
        </span>
      </div>

      <div className="h-60 overflow-y-auto px-5 py-5 flex flex-col gap-3.5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-seal/20 to-seal/5 flex items-center justify-center mb-4 border border-ink-900/10 dark:border-white/10">
              <svg className="w-6 h-6 text-seal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-muted dark:text-white/40 text-sm font-light max-w-xs leading-relaxed">
              Ask me anything about this agreement<br />
              <span className="text-muted/70 dark:text-white/20 text-xs">Try "Can I sublet?" or "What's the notice period?"</span>
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
              msg.role === "user"
                ? "bg-gradient-to-br from-seal to-seal/90 text-ink-900 self-end rounded-br-sm"
                : "bg-ink-900/5 dark:bg-white/10 backdrop-blur-sm text-ink-900 dark:text-white/90 self-start rounded-bl-sm border border-ink-900/10 dark:border-white/5"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="bg-ink-900/5 dark:bg-white/10 backdrop-blur-sm text-muted dark:text-white/50 self-start px-4 py-3 rounded-2xl rounded-bl-sm text-sm border border-ink-900/10 dark:border-white/5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-muted dark:bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 rounded-full bg-muted dark:bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 rounded-full bg-muted dark:bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2.5 p-4 border-t border-ink-900/10 dark:border-white/10 bg-ink-900/5 dark:bg-white/5 backdrop-blur-sm">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="w-full bg-white dark:bg-white/5 text-ink-900 dark:text-white text-sm px-4 py-3 rounded-xl border border-ink-900/15 dark:border-white/10 focus:outline-none focus:border-seal/60 focus:ring-2 focus:ring-seal/20 transition-all duration-300 placeholder:text-muted dark:placeholder:text-white/30"
          />
          {input.length > 0 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/60 dark:text-white/20 text-[10px] font-mono">
              {input.length}
            </span>
          )}
        </div>
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-seal to-seal/80 text-ink-900 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-seal/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center gap-2 min-w-[80px] justify-center group"
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            "Send"
          )}
        </button>
      </div>
    </div>
  );
}