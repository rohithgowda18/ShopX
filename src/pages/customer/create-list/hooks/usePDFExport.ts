import { toast } from 'sonner';
import { OrderItem } from '../../../../types';
import { PRODUCTS } from '../../../../data/products';

export function usePDFExport() {
  const generatePDF = (items: OrderItem[]) => {
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

    const container = document.createElement('div');
    container.style.padding = '40px';
    container.style.fontFamily = 'sans-serif';
    container.style.color = '#000';
    container.style.backgroundColor = '#fff';
    container.style.width = '800px';
    container.style.fontSize = '20px';
    container.style.lineHeight = '2';
    
    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth()+1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    let html = `
      <div style="text-align: left; max-width: 800px; margin: 0 auto;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">ಕಿರಾಣಿ ಪಟ್ಟಿ</h1>
        <p style="font-size: 20px; color: #333; margin-bottom: 24px;">Date: ${dateString}</p>
        <hr style="border: 1px solid #000; margin-bottom: 24px;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 24px;">
          <tbody>
    `;

    items.forEach(item => {
      const product = PRODUCTS.find(p => p.englishName.toLowerCase() === item.name.toLowerCase());
      const name = product?.kannadaName || item.name;
      const unit = kannadaUnits[item.unit] || item.unit;
      
      html += `
        <tr>
          <td style="padding: 12px 0;">${name}</td>
          <td style="text-align: right; padding: 12px 0; white-space: nowrap;">${item.quantity} ${unit}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <hr style="border: 1px solid #000; margin-top: 24px;" />
      </div>
    `;
    
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.zIndex = '-100';
    document.body.appendChild(container);

    Promise.all([
      import('html-to-image'),
      import('jspdf')
    ]).then(async ([htmlToImage, { jsPDF }]) => {
      try {
        await new Promise(r => setTimeout(r, 200));
        await htmlToImage.toPng(container, { quality: 0.98, pixelRatio: 2, skipFonts: true }).catch(() => {});
        const dataUrl = await htmlToImage.toPng(container, { quality: 0.98, pixelRatio: 2, skipFonts: true });
        
        if (dataUrl === 'data:,') {
          throw new Error("Generated image is empty");
        }

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: 'a4'
        });
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const margin = 0.5;
        const printWidth = pdfWidth - margin * 2;
        const printHeight = (imgProps.height * printWidth) / imgProps.width;
        pdf.addImage(dataUrl, 'PNG', margin, margin, printWidth, printHeight);
        pdf.save('grocery-list.pdf');
        document.body.removeChild(container);
        toast.success('Downloaded Grocery List');
      } catch (err) {
        console.error('Failed to generate PDF', err);
        toast.error('Failed to download list');
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }
    }).catch(err => {
      console.error('Failed to import PDF libraries', err);
      toast.error('Failed to load PDF libraries');
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    });
  };

  return { generatePDF };
}
