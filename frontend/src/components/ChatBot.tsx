import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Mic, MicOff } from 'lucide-react'; // Import Mic and MicOff icons
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth
import SignInPopup from './SignInPopup'; // <-- Import SignInPopup

// --- Speech Recognition Setup ---
// Check browser compatibility
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true; // Keep listening even after pauses
  recognition.interimResults = true; // Get results as the user speaks
  recognition.lang = 'en-US'; // Set language
}
// --- End Speech Recognition Setup ---

const PREDEFINED_QUERIES = [
  'What is NavAir?',
  'How do I navigate inside the airport?',
  'How can I track my baggage?',
  'How do I get real-time flight updates?',
  'How do I book a slot for airport services?',
  'How do I get emergency assistance?',
  'How do I register or login?',
  'Others',
];

const PREDEFINED_RESPONSES: Record<string, { response: string; followUp?: string }> = {
  'What is NavAir?': {
    response: 'NavAir is an AI-powered platform that streamlines your airport experience with smart navigation, real-time flight and baggage updates, emergency help, and more. We help both passengers and staff enjoy a seamless journey.'
  },
  'How do I navigate inside the airport?': {
    response: 'NavAir provides smart, AR-powered navigation to guide you to gates, lounges, baggage claim, and more. Use the "Navigate" feature from the main menu for step-by-step directions.'
  },
  'How can I track my baggage?': {
    response: 'You can track your baggage in real time using the "Baggage" section. Enter your flight or baggage ID to see its current location and status.'
  },
  'How do I get real-time flight updates?': {
    response: 'Go to the "Flights" section to view live flight status, gate changes, and boarding alerts. You can also enable notifications for your flight.'
  },
  'How do I book a slot for airport services?': {
    response: 'Use the "Booking" feature to reserve slots for airport services like lounges, parking, or fast-track security. Select your service and follow the prompts.'
  },
  'How do I get emergency assistance?': {
    response: 'In case of emergency, tap the "Emergency" button in the app for instant help, or call airport security. NavAir can guide you to the nearest help desk or exit.'
  },
  'How do I register or login?': {
    response: 'Click "Sign In" or "Register" on the top right. You can sign up with email or Google, and you’ll receive an email verification for security.'
  },
  'Others': {
    response: 'We’re sorry we couldn’t help with that. Please contact our support team at support@navair.app or call +91XXXXXXXXXX.'
  }
};

const LOCAL_HISTORY_KEY = 'navair_chatbot_history';

export const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showQueries, setShowQueries] = useState(true);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  // --- Auth State ---
  const { isAuthenticated } = useAuth(); // <-- Use authentication context
  const [showSignInPopup, setShowSignInPopup] = useState(false); // <-- State for sign-in popup
  // --- End Auth State ---

  // --- Speech Recognition State ---
  const [isListening, setIsListening] = useState(false);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // --- End Speech Recognition State ---

  useEffect(() => {
    if (open) {
      setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }
  }, [messages, open]);

  useEffect(() => {
    const handler = () => {
      // Check authentication before opening via event
      if (isAuthenticated) {
        setOpen(true);
      } else {
        setShowSignInPopup(true);
      }
    };
    window.addEventListener('open-navair-chatbot', handler);
    return () => window.removeEventListener('open-navair-chatbot', handler);
  }, [isAuthenticated]); // <-- Add isAuthenticated dependency

  useEffect(() => {
    const history = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (history) setMessages(JSON.parse(history));
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // --- Speech Recognition Handlers ---
  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = null;
      }
      console.log('Speech recognition stopped.');
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      try {
        recognition.start();
        setIsListening(true);
        console.log('Speech recognition started.');

        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(stopListening, 20000);

      } catch (error) {
        if ((error as DOMException).name === 'NotAllowedError' || (error as DOMException).name === 'SecurityError') {
             alert("Microphone access denied. Please allow microphone access in your browser settings to use voice input.");
        } else {
             console.error("Speech recognition could not start:", error);
             alert("Could not start voice input. Please ensure your microphone is working and permissions are granted.");
        }
        setIsListening(false);
      }
    }
  }, [isListening, stopListening]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const currentTranscript = (finalTranscript || interimTranscript).trim();
      setInput(currentTranscript);

      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(stopListening, 20000);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
       if (event.error === 'no-speech') {
        console.log('No speech detected.');
       } else if (event.error === 'audio-capture') {
        alert("Audio capture failed. Please check your microphone connection.");
       } else if (event.error !== 'aborted') {
        alert(`Voice input error: ${event.error}. Please try again.`);
       }
      stopListening();
    };

    recognition.onend = () => {
        if (isListening) {
          console.log('Recognition ended.');
          setIsListening(false);
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }
    };

    return () => {
      stopListening();
    };
  }, [isListening, stopListening]);

  const toggleListening = () => {
    if (!recognition) {
        alert("Sorry, your browser doesn't support speech recognition.");
        return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  // --- End Speech Recognition Handlers ---

  const handleQueryClick = async (query: string) => {
    setMessages((prev) => [...prev, { sender: 'user', text: query }]);
    setShowQueries(false);
    setLoading(true);
    stopListening();
    setTimeout(async () => {
      if (PREDEFINED_RESPONSES[query]) {
        setMessages((prev) => [...prev, { sender: 'bot', text: PREDEFINED_RESPONSES[query].response }]);
        if (PREDEFINED_RESPONSES[query].followUp) {
          setMessages((prev) => [...prev, { sender: 'bot', text: PREDEFINED_RESPONSES[query].followUp! }]);
        } else if (query === 'Others') {
          setSessionEnded(true);
        } else {
          setMessages((prev) => [...prev, { sender: 'bot', text: 'Thank you! If you need any further help, feel free to reach out again.' }]);
          setSessionEnded(true);
        }
      } else {
        const geminiResponse = await fetchGemini(query);
        setMessages((prev) => [...prev, { sender: 'bot', text: geminiResponse }]);
        setSessionEnded(false);
      }
      setLoading(false);
    }, 800);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);
    setInput('');
    setShowQueries(false);
    setLoading(true);
    stopListening();
    const geminiResponse = await fetchGemini(trimmed);
    setMessages((prev) => [...prev, { sender: 'bot', text: geminiResponse }]);
    setLoading(false);
    setSessionEnded(false);
  };

  const fetchGemini = async (query: string) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) return 'Sorry, Gemini API key is not configured.';
    const navAirContext = `You are NavAir's virtual assistant. NavAir is an AI-powered airport platform offering:
    - Smart navigation (AR directions, gate info)
    - Real-time baggage tracking
    - Live flight updates and notifications
    - Emergency assistance
    - Slot booking for airport services (lounges, parking, fast-track)
    - Secure registration and login
    The founders of NavAir are Sanket Jha, Dibangi Dutta, Arpita Biswas, and K Bhawana Sai.
    Always answer as a helpful, concise, user-friendly NavAir assistant. If a question is not about NavAir, politely redirect the user.`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${navAirContext}\n\nUser query: ${query}` }] }
          ]
        })
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Gemini API Error:', res.status, errorText);
        let errorMessage = `Sorry, there was an error processing your request (${res.status}).`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson?.error?.message) {
                errorMessage += ` Details: ${errorJson.error.message}`;
            }
        } catch (parseError) { /* Ignore */ }
        return errorMessage;
      }
      const data = await res.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.warn('Unexpected Gemini response structure:', data);
        return 'Sorry, I received an unexpected response from the AI assistant.';
      }
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
        console.error('Network error connecting to Gemini:', e);
        return 'Sorry, there was a network error connecting to the AI assistant.';
    }
  };

  const handleEndChat = () => {
    setMessages([]);
    setShowQueries(true);
    setSessionEnded(false);
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    stopListening();
  };

  // --- Handler for opening the chatbot/popup ---
  const handleOpenChatbot = () => {
    if (isAuthenticated) {
      setOpen(true);
    } else {
      setShowSignInPopup(true);
    }
  };
  // --- End Handler ---

  return (
    <>
      {/* --- Render Sign In Popup conditionally --- */}
      {showSignInPopup && <SignInPopup onClose={() => setShowSignInPopup(false)} />}

      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 border border-blue-600 shadow-lg rounded-full p-4 flex items-center justify-center hover:bg-blue-700 transition-all duration-300"
        style={{ boxShadow: '0 4px 24px 0 rgba(59,130,246,0.15)' }}
        aria-label="Open Chatbot"
        onClick={handleOpenChatbot} // <-- Use the new handler
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 right-8 z-[60] w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-2xl border border-blue-600 flex flex-col overflow-hidden" // Increased z-index
            style={{ boxShadow: '0 8px 32px 0 rgba(59,130,246,0.18)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600">
              <span className="text-white font-semibold text-lg">Support Chat</span>
              <button onClick={() => setOpen(false)} className="text-white hover:text-blue-200 p-1 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Chat Body */}
            <div ref={chatRef} className="flex-1 px-4 py-3 overflow-y-auto bg-blue-50" style={{ minHeight: 320, maxHeight: 400 }}>
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 40 : -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`rounded-xl px-4 py-2 max-w-[80%] text-sm shadow ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-gray-800 border border-blue-100'}`}>{msg.text}</div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start mb-2">
                  <div className="rounded-xl px-4 py-2 bg-white text-gray-800 border border-blue-100 flex items-center gap-2 text-sm">
                    <span className="dot-flashing" style={{ display: 'inline-block', width: 24 }}>
                      <span className="animate-bounce" style={{ animationDelay: '0s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                    </span>
                  </div>
                </div>
              )}
      {/* Animated dots CSS */}
      <style>{`
        .animate-bounce {
          display: inline-block;
          font-size: 1.5em;
          color: #2563eb;
          animation: bounce 1s infinite;
        }
        .animate-bounce:nth-child(2) { animation-delay: 0.2s; }
        .animate-bounce:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 1; }
          40% { transform: translateY(-8px); opacity: 0.7; }
        }
      `}</style>
              {showQueries && !sessionEnded && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {PREDEFINED_QUERIES.map((q) => (
                    <button
                      key={q}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition"
                      onClick={() => handleQueryClick(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Footer with input and mic button */}
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {/* --- Mic Button --- */}
                {recognition && ( // Only show mic button if API is supported
                  <button
                    onClick={toggleListening}
                    className={`p-2 rounded-lg transition-colors ${isListening ? 'bg-red-200 text-red-600 hover:bg-red-300 animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    aria-label={isListening ? 'Stop recording' : 'Start recording'}
                    disabled={loading} // Disable mic when bot is thinking
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                {/* --- End Mic Button --- */}
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder={isListening ? "Listening..." : "Type your question..."}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                  disabled={loading}
                />
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  Send
                </button>
              </div>
              <div className="flex items-center justify-between mt-1">
                <button
                  className="text-blue-600 text-xs font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleEndChat}
                  disabled={messages.length === 0 && !loading} // Disable if no messages and not loading
                >
                  End Chat
                </button>
                <span className="text-xs text-gray-400">Powered by Gemini</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;