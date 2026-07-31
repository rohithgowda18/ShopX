import React from 'react';
import { Mic, X } from 'lucide-react';

interface VoiceRecorderProps {
  isRecording: boolean;
  voiceText: string;
  voiceLang: string;
  loading: boolean;
  onToggleRecording: () => void;
  onChangeLanguage: (lang: string) => void;
  onTextChange: (text: string) => void;
  onProcess: () => void;
  onClose: () => void;
}

export default function VoiceRecorder({
  isRecording,
  voiceText,
  voiceLang,
  loading,
  onToggleRecording,
  onChangeLanguage,
  onTextChange,
  onProcess,
  onClose,
}: VoiceRecorderProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto bg-white dark:bg-gray-900 rounded-t-[32px] z-50 p-6 shadow-2xl animate-slide-up safe-area-pb">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl text-gray-900 dark:text-white">Voice Entry</h3>
          <div className="flex items-center gap-3">
            <select
              value={voiceLang}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="bg-gray-100 dark:bg-gray-800 text-sm rounded-xl px-4 py-2 outline-none font-bold text-gray-700 dark:text-gray-300 min-h-touch"
            >
              <option value="kn-IN">Kannada</option>
              <option value="en-IN">English</option>
              <option value="hi-IN">Hindi</option>
            </select>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full active:scale-95 text-gray-500 hover:bg-gray-200 min-h-touch min-w-touch flex items-center justify-center">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleRecording}
          className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8 transition-all shadow-xl active:scale-90 ${
            isRecording ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Mic className="w-14 h-14" />
        </button>
        <p className="text-gray-600 dark:text-gray-400 font-medium text-center mb-8 text-xl">
          {isRecording ? 'Listening...' : 'Tap the mic and say your list'}
        </p>
        <div className="text-left mb-8">
          <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Recognized Text</p>
          <textarea
            className="w-full px-5 py-5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[24px] outline-none min-h-[140px] text-gray-900 dark:text-white text-xl focus:ring-2 focus:ring-blue-500 shadow-inner resize-none"
            placeholder="E.g. 2 kg akki, 1 litre oil..."
            value={voiceText}
            onChange={(e) => onTextChange(e.target.value)}
          />
        </div>
        <button
          onClick={onProcess}
          disabled={loading || !voiceText}
          className="w-full bg-blue-600 text-white font-bold py-5 rounded-[24px] disabled:opacity-50 active:scale-95 transition-transform text-xl shadow-xl flex justify-center items-center gap-2 min-h-touch"
        >
          {loading ? 'Processing...' : 'Extract Items'}
        </button>
      </div>
    </>
  );
}
