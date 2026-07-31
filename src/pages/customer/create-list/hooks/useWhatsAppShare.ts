import { OrderItem } from '../../../../types';
import { PRODUCTS } from '../../../../data/products';

export function useWhatsAppShare() {
  const shareOnWhatsApp = async (items: OrderItem[]) => {
    const kannadaUnits: Record<string, string> = {
      kg: 'ಕೆಜಿ',
      g: 'ಗ್ರಾಂ',
      litre: 'ಲೀಟರ್',
      ml: 'ಮಿ.ಲೀ',
      packet: 'ಪ್ಯಾಕೆಟ್',
      piece: 'ಸಂಖ್ಯೆ',
      dozen: 'ಡಜನ್',
      box: 'ಬಾಕ್ಸ್'
    };

    let text = 'ಕಿರಾಣಿ ಪಟ್ಟಿ\n\n';
    
    items.forEach(item => {
      const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
      const name = product?.kannadaName || item.name;
      const unit = kannadaUnits[item.unit] || item.unit;
      text += `${name} - ${item.quantity} ${unit}\n`;
    });
    
    text += '\nಧನ್ಯವಾದಗಳು 🙏';

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ಕಿರಾಣಿ ಪಟ್ಟಿ',
          text: text
        });
      } catch (err) {
        console.error('Error sharing:', err);
        const encodedText = encodeURIComponent(text);
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
      }
    } else {
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
  };

  return { shareOnWhatsApp };
}
