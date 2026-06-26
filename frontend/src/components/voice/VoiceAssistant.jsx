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
        className="glass-card p-8 w-full max-w-md text-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none" />

        {/* Close */}
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </motion.button>

        <motion.div variants={fadeUp} className="relative z-10">
          <h2 className="text-xl font-bold gradient-text mb-2">Voice Assistant</h2>
          <p className="text-sm text-slate-400 mb-6">Ask me anything about your tasks</p>
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
                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
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
                className="glass-light rounded-xl p-4 text-left border border-white/5"
              >
                <p className="text-xs text-slate-400 mb-1">You said:</p>
                <p className="text-white text-sm">{transcript}</p>
              </motion.div>
            )}

            {/* Loading */}
            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 text-indigo-400 py-6"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div 
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                    className="w-2.5 h-2.5 rounded-full bg-indigo-400" 
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
                className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                  <p className="text-xs text-indigo-400 font-medium">AI Response:</p>
                </div>
                <p className="text-white text-sm leading-relaxed">{response}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.p variants={fadeUp} className="text-xs text-slate-500 mt-6 relative z-10">
          Try: "What should I do now?" or "Show today's priorities"
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
