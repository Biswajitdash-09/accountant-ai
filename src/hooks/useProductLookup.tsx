import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ProductInfo {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  price?: string;
  description?: string;
  images?: string[];
  nutritionalInfo?: any;
  availability?: 'in_stock' | 'out_of_stock' | 'limited';
}

// Mock product database - in production, integrate with real API
const MOCK_PRODUCTS: { [key: string]: ProductInfo } = {
  '8901030895856': {
    barcode: '8901030895856',
    name: 'Maggi 2-Minute Noodles Masala',
    brand: 'Nestlé',
    category: 'Instant Noodles',
    price: '₹12.00',
    description: 'Quick cooking noodles with masala flavor',
    availability: 'in_stock'
  },
  '8901725111021': {
    barcode: '8901725111021',
    name: 'Britannia Good Day Cookies Rich Cashew',
    brand: 'Britannia',
    category: 'Biscuits & Cookies',
    price: '₹25.00',
    description: 'Premium cookies with cashew nuts',
    availability: 'in_stock'
  },
  '8901030871250': {
    barcode: '8901030871250',
    name: 'KitKat Chocolate Bar',
    brand: 'Nestlé',
    category: 'Chocolates',
    price: '₹20.00',
    description: 'Crispy wafer fingers covered with milk chocolate',
    availability: 'in_stock'
  },
  '8901030826417': {
    barcode: '8901030826417',
    name: 'Nescafe Classic Coffee',
    brand: 'Nestlé',
    category: 'Beverages',
    price: '₹95.00',
    description: 'Premium instant coffee blend',
    availability: 'limited'
  },
  '8901526186433': {
    barcode: '8901526186433',
    name: 'Parle-G Glucose Biscuits',
    brand: 'Parle',
    category: 'Biscuits',
    price: '₹5.00',
    description: 'India\'s favourite glucose biscuits',
    availability: 'in_stock'
  }
};

export const useProductLookup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const lookupProduct = async (barcode: string): Promise<ProductInfo | null> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check mock database first
      const mockProduct = MOCK_PRODUCTS[barcode];
      if (mockProduct) {
        return mockProduct;
      }

      // Try to fetch from external API (OpenFoodFacts, UPC Database, etc.)
      try {
        const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        const response = await fetch(openFoodFactsUrl);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 1 && data.product) {
            const product = data.product;
            return {
              barcode,
              name: product.product_name || 'Unknown Product',
              brand: product.brands || 'Unknown Brand',
              category: product.categories_tags?.[0]?.replace('en:', '') || 'General',
              description: product.generic_name || '',
              images: product.image_url ? [product.image_url] : [],
              nutritionalInfo: product.nutriments || {},
              availability: 'in_stock'
            };
          }
        }
      } catch (apiError) {
        console.warn('External API lookup failed:', apiError);
      }

      // Generate basic product info from barcode
      return {
        barcode,
        name: `Product ${barcode}`,
        brand: 'Unknown',
        category: getProductCategoryFromBarcode(barcode),
        availability: 'in_stock'
      };

    } catch (error) {
      console.error('Product lookup error:', error);
      toast({
        title: "Lookup Failed",
        description: "Could not retrieve product information.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const searchProducts = async (query: string): Promise<ProductInfo[]> => {
    // Search within mock database
    const results = Object.values(MOCK_PRODUCTS).filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );

    return results;
  };

  return {
    lookupProduct,
    searchProducts,
    isLoading
  };
};

// Helper function to determine category from barcode patterns
const getProductCategoryFromBarcode = (barcode: string): string => {
  // EAN-13 country codes and category inference
  const prefix = barcode.substring(0, 3);
  
  // Indian product codes
  if (prefix.startsWith('890')) return 'Food & Beverages';
  
  // General categories based on common patterns
  const categoryMap: { [key: string]: string } = {
    '00': 'Food & Beverages',
    '01': 'Food & Beverages', 
    '02': 'Meat & Poultry',
    '03': 'Dairy Products',
    '04': 'Produce',
    '05': 'Canned Goods',
    '20': 'Health & Beauty',
    '30': 'Household Items',
    '40': 'Clothing & Textiles',
    '50': 'Electronics',
    '60': 'Books & Media',
    '70': 'Automotive',
    '80': 'Toys & Games',
    '90': 'General Merchandise'
  };

  const categoryPrefix = barcode.substring(1, 3);
  return categoryMap[categoryPrefix] || 'General';
};