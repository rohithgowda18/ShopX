import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function useVoiceRecognition(onFinalResult?: (transcript: string) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceLang, setVoiceLang] = useState(() => localStorage.getItem('voiceLanguage') || 'kn-IN');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = voiceLang;

        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          if (finalTranscript) {
            setVoiceText(prev => prev + (prev ? ' ' : '') + finalTranscript);
            if (onFinalResult) onFinalResult(finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [voiceLang, onFinalResult]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        toast.error('Voice recognition is not supported in this browser.');
        return;
      }
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const changeLanguage = (lang: string) => {
    setVoiceLang(lang);
    localStorage.setItem('voiceLanguage', lang);
  };

  return {
    isRecording,
    voiceText,
    setVoiceText,
    voiceLang,
    changeLanguage,
    toggleRecording,
  };
}
