import React, { useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface CameraCaptureProps {
  image: string | null;
  loading: boolean;
  onImageCapture: (file: File) => void;
  onClearImage: () => void;
  onProcess: () => void;
  onClose: () => void;
}

export default function CameraCapture({
  image,
  loading,
  onImageCapture,
  onClearImage,
  onProcess,
  onClose,
}: CameraCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageCapture(file);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 sm:max-w-md sm:mx-auto bg-white dark:bg-gray-900 rounded-t-[32px] z-50 p-6 shadow-2xl animate-slide-up safe-area-pb">
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6" />
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-bold text-2xl text-gray-900 dark:text-white">Scan List</h3>
          <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full active:scale-95 text-gray-500 hover:bg-gray-200 min-h-touch min-w-touch flex items-center justify-center">
            <X className="w-6 h-6" />
          </button>
        </div>
        {!image ? (
          <>
            <div className="w-32 h-32 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <Camera className="w-16 h-16 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-8 text-center text-xl">Take a photo of your handwritten list</p>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-orange-600 text-white font-bold py-5 rounded-[24px] hover:bg-orange-700 active:scale-95 transition-transform text-xl shadow-xl min-h-touch"
            >
              Open Camera
            </button>
          </>
        ) : (
          <div className="space-y-8">
            <div className="relative">
              <img src={image} alt="Scanned list" className="w-full h-72 object-cover rounded-[32px] shadow-lg border border-gray-100 dark:border-gray-800" />
              <button
                onClick={onClearImage}
                className="absolute top-4 right-4 bg-black/60 text-white p-4 rounded-full backdrop-blur-md active:scale-90 transition-transform shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <button
              onClick={onProcess}
              disabled={loading}
              className="w-full bg-orange-600 text-white font-bold py-5 rounded-[24px] disabled:opacity-50 active:scale-95 transition-transform text-xl shadow-xl min-h-touch"
            >
              {loading ? 'Extracting List...' : 'Extract Items'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
