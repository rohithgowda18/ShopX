import { CatalogProduct, Unit, Category } from '../types/productTypes';
import { grains } from '../../data/products_db/grains';
import { dal_products } from '../../data/products_db/dals';
import { dy_products } from '../../data/products_db/dairy';
import { oil_products } from '../../data/products_db/oils';
import { sp_products } from '../../data/products_db/spices';
import { veg_products } from '../../data/products_db/vegetables';
import { fr_products } from '../../data/products_db/fruits';
import { sn_products } from '../../data/products_db/snacks';
import { bev_products } from '../../data/products_db/beverages';
import { inst_products } from '../../data/products_db/instant';
import { cln_products } from '../../data/products_db/cleaning';
import { pc_products } from '../../data/products_db/personal_care';
import { oth_products } from '../../data/products_db/others';

const LEGACY_PRODUCTS = [
  ...grains,
  ...dal_products,
  ...dy_products,
  ...oil_products,
  ...sp_products,
  ...veg_products,
  ...fr_products,
  ...sn_products,
  ...bev_products,
  ...inst_products,
  ...cln_products,
  ...pc_products,
  ...oth_products
];

const now = Date.now();

export const karnatakaCatalog: CatalogProduct[] = LEGACY_PRODUCTS.map(p => {
  return {
    id: p.id,
    englishName: p.englishName,
    kannadaName: p.kannadaName,
    brand: p.brand,
    category: p.category as Category,
    image: p.image,
    aliases: p.aliases ? [...p.aliases, p.transliteration] : [p.transliteration],
    availableUnits: p.availableUnits,
    defaultUnit: p.defaultUnit as Unit,
    isPackaged: !!p.brand,
    isLocalProduct: true,
    createdAt: now,
    updatedAt: now,
    price: p.price,
    popular: p.popular
  };
});
