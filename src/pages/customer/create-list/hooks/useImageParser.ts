import { useState } from 'react';
import { toast } from 'sonner';
import { OrderItem } from '../../../../types';

export function useImageParser() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageCapture = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (): Promise<OrderItem[]> => {
    if (!image) return [];
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await fetch('/api/gemini/parse-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: base64Data, mimeType }),
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        toast.success('List extracted successfully');
        return data;
      }
      return [];
    } catch (error) {
      console.error(error);
      toast.error('Failed to process image');
      return [];
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  return {
    image,
    setImage,
    loading,
    handleImageCapture,
    processImage,
  };
}
