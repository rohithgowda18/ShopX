import { Product, PRODUCTS } from '../data/products';
import { Unit } from '../types';

export interface ParsedItem {
  product: Product;
  quantity: number;
  unit: string;
}

const UNIT_MAP: Record<string, string> = {
  'kg': 'kg', 'kilo': 'kg', 'kilogram': 'kg', 'kgs': 'kg', 'kilos': 'kg',
  'g': 'g', 'gram': 'g', 'grams': 'g',
  'l': 'litre', 'liter': 'litre', 'litre': 'litre', 'litres': 'litre', 'liters': 'litre',
  'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
  'packet': 'packet', 'packets': 'packet', 'pkt': 'packet', 'pack': 'packet',
  'piece': 'piece', 'pieces': 'piece', 'pc': 'piece', 'pcs': 'piece',
  'dozen': 'dozen', 'dozens': 'dozen',
  'bunch': 'bunch', 'bunches': 'bunch'
};

export function parseVoiceInput(text: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  let remainingText = ` ${text.toLowerCase().replace(/[.,]/g, ' ')} `;

  const allAliases = PRODUCTS.flatMap(p => 
    p.aliases.map(a => ({ alias: a.toLowerCase(), product: p }))
  ).sort((a, b) => b.alias.length - a.alias.length);

  for (const { alias, product } of allAliases) {
    const aliasRegex = new RegExp(`\\s+${alias}\\s+`);
    let match;
    
    while ((match = remainingText.match(aliasRegex)) !== null) {
      const matchIndex = match.index!;
      const beforeStr = remainingText.substring(0, matchIndex) + ' ';
      const afterStr = ' ' + remainingText.substring(matchIndex + match[0].length);
      
      let quantity = 1;
      let unit: string = product.defaultUnit;
      
      const beforeMatch = beforeStr.match(/(\d+(?:\.\d+)?)\s*([a-z]+)?\s*$/);
      const afterMatch = afterStr.match(/^\s*(\d+(?:\.\d+)?)\s*([a-z]+)?/);
      
      let matchedRegexStr = '';

      if (beforeMatch) {
        quantity = parseFloat(beforeMatch[1]);
        if (beforeMatch[2] && UNIT_MAP[beforeMatch[2]]) {
          unit = UNIT_MAP[beforeMatch[2]];
        } else if (beforeMatch[2] && beforeMatch[2] === 'dozen') {
          unit = 'dozen';
        }
        matchedRegexStr = beforeMatch[0];
        remainingText = remainingText.substring(0, beforeStr.length - matchedRegexStr.length) + ' ' + remainingText.substring(matchIndex + match[0].length);
      } else if (afterMatch) {
        quantity = parseFloat(afterMatch[1]);
        if (afterMatch[2] && UNIT_MAP[afterMatch[2]]) {
          unit = UNIT_MAP[afterMatch[2]];
        } else if (afterMatch[2] && afterMatch[2] === 'dozen') {
          unit = 'dozen';
        }
        matchedRegexStr = afterMatch[0];
        remainingText = remainingText.substring(0, matchIndex) + ' ' + afterStr.substring(matchedRegexStr.length);
      } else {
        remainingText = remainingText.substring(0, matchIndex) + ' ' + remainingText.substring(matchIndex + match[0].length);
      }

      if (unit === 'dozen') {
        quantity *= 12;
        unit = 'piece';
      }

      items.push({
        product,
        quantity,
        unit
      });
    }
  }
  
  return items;
}
