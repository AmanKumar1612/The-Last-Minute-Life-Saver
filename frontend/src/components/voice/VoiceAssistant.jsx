import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import client from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeUp } from '../../lib/motion';

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        exit="hidden"
        className="bg-[var(--surface)] p-8 w-full max-w-md text-center border border-[var(--border-color)] rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-primary)]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--accent-primary)]/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        {/* Close */}
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose} 
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <motion.div variants={fadeUp} className="relative z-10">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">Voice Assistant</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6">Ask me anything about your tasks</p>
        </motion.div>

        {/* Mic Button */}
        <motion.div variants={fadeUp} className="relative z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleListening}
            animate={{
              boxShadow: isListening 
                ? ["0 0 0px 0px rgba(239, 68, 68, 0.4)", "0 0 0px 20px rgba(239, 68, 68, 0)", "0 0 0px 0px rgba(239, 68, 68, 0)"] 
                : "0 10px 15px -3px rgba(99, 102, 241, 0.3)"
            }}
            transition={{ duration: 1.5, repeat: isListening ? Infinity : 0 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-colors duration-300 cursor-pointer ${
              isListening
                ? 'bg-red-500'
                : 'bg-gradient-to-br from-blue-600 to-blue-700'
            }`}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 text-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </motion.button>
        </motion.div>

        <div className="min-h-[120px] relative z-10">
          <AnimatePresence mode="wait">
            {/* Transcript */}
            {transcript && !response && !loading && (
              <motion.div 
                key="transcript"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[var(--surface-secondary)] rounded-xl p-4 text-left border border-[var(--border-color)]"
              >
                <p className="text-[13px] text-[var(--text-muted)] mb-1">You said:</p>
                <p className="text-[var(--text-primary)] text-[15px]">{transcript}</p>
              </motion.div>
            )}

            {/* Loading */}
            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 py-6"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    className="w-2.5 h-2.5 rounded-full bg-[var(--accent-highlight)]" 
                  />
                ))}
              </motion.div>
            )}

            {/* Response */}
            {response && (
              <motion.div 
                key="response"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-xl p-4 text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-[var(--accent-highlight)]" />
                  <p className="text-xs text-[var(--accent-highlight)] font-medium">AI Response:</p>
                </div>
                <p className="text-[var(--text-primary)] text-[15px] leading-relaxed">{response}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.p variants={fadeUp} className="text-xs text-[var(--text-muted)] mt-6 relative z-10">
          Try: "What should I do now?" or "Show today's priorities"
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
