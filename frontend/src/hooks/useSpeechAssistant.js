import { useState, useEffect, useRef } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    // Enable interim results so commands are captured faster (before finalization)
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event) => {
      // Use the most recent chunk (may be interim) for snappy responsiveness
      const last = event.results.length - 1;
      const chunk = event.results[last][0].transcript.trim().toLowerCase();
      if (chunk) setTranscript(chunk);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start(); // Keep listening if it's supposed to be active
      }
    };
    
    recognitionRef.current = recognition;
  }, [isListening]);

  const startListening = () => {
    const r = recognitionRef.current;
    if (!r) return;
    try { r.stop(); } catch {}
    try { r.abort(); } catch {}
    if (!isListening) setIsListening(true);
    r.start();
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  const speak = ({ text, onEnd }) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd(); // Callback when speech finishes
    };
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  
  const pause = () => window.speechSynthesis.pause();
  const resume = () => window.speechSynthesis.resume();
  const stop = () => window.speechSynthesis.cancel();

  return {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speak,
    pause,
    resume,
    stop,
    resetTranscript: () => setTranscript(''),
    hasSpeechSupport: !!SpeechRecognition,
  };
};