import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import client from '../../api/client';

export default function VoiceAssistant({ onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const text = Array.from(event.results).map(r => r[0].transcript).join('');
        setTranscript(text);

        if (event.results[0].isFinal) {
          setIsListening(false);
          processQuery(text);
        }
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const processQuery = async (text) => {
    setLoading(true);
    try {
      const res = await client.post('/ai/voice-query', { text });
      setResponse(res.data.response);
      speak(res.data.response);
    } catch {
      setResponse("Sorry, I couldn't process that. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card p-8 w-full max-w-md text-center animate-fade-in-up">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold gradient-text mb-2">Voice Assistant</h2>
        <p className="text-sm text-slate-400 mb-6">Ask me anything about your tasks</p>

        {/* Mic Button */}
        <button
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
            isListening
              ? 'bg-red-500 animate-pulse-glow shadow-lg shadow-red-500/30'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-105 shadow-lg shadow-indigo-500/30'
          }`}
        >
          {isListening ? <MicOff className="w-8 h-8 text-white" /> : <Mic className="w-8 h-8 text-white" />}
        </button>

        {/* Transcript */}
        {transcript && (
          <div className="glass-light rounded-xl p-4 mb-4 text-left">
            <p className="text-xs text-slate-400 mb-1">You said:</p>
            <p className="text-white text-sm">{transcript}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 text-indigo-400 mb-4">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <p className="text-xs text-indigo-400">AI Response:</p>
            </div>
            <p className="text-white text-sm leading-relaxed">{response}</p>
          </div>
        )}

        <p className="text-xs text-slate-500 mt-4">
          Try: "What should I do now?" or "Show today's priorities"
        </p>
      </div>
    </div>
  );
}
