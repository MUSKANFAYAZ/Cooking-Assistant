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
        // Add a small delay before restarting to prevent audio artifacts
        setTimeout(() => {
          try {
            recognition.start();
          } catch (error) {
            console.log('Speech recognition restart error:', error);
          }
        }, 100);
      }
    };

    recognition.onerror = (event) => {
      console.log('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsListening(false);
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
    // Add a small delay to prevent browser default sounds
    setTimeout(() => {
      r.start();
    }, 100);
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  
  const speak = ({ text, onEnd }) => {
    // Cancel any ongoing speech to prevent overlapping
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    // Wait a moment for the cancellation to complete
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = (event) => {
        console.log('Speech synthesis error:', event.error);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }, 50);
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