import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Product interface - defines what information each product has
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  image: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  status: 'active' | 'blocked';
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  getProductsBySeller: (sellerId: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Hook to use products throughout the app
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

// Provider component
export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from localStorage when app starts
  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Initialize with some dummy products for demo
      const dummyProducts: Product[] = [
        {
          id: '1',
          title: 'Engineering Textbook Bundle',
          description: 'Complete set of first-year engineering books in excellent condition',
          price: 2500,
          category: 'Books',
          condition: 'Like New',
          image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
          sellerId: 'demo',
          sellerName: 'Demo User',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        {
          id: '2',
          title: 'Scientific Calculator',
          description: 'Casio FX-991EX calculator, barely used',
          price: 800,
          category: 'Electronics',
          condition: 'Like New',
          image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400',
          sellerId: 'demo',
          sellerName: 'Demo User',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      ];
      setProducts(dummyProducts);
      localStorage.setItem('products', JSON.stringify(dummyProducts));
    }
  }, []);

  // Add new product
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'status'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  // Update existing product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updatedProducts = products.map(product =>
      product.id === id ? { ...product, ...updates } : product
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  // Delete product
  const deleteProduct = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  // Get single product by ID
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Get all products by a specific seller
  const getProductsBySeller = (sellerId: string) => {
    return products.filter(product => product.sellerId === sellerId);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getProductsBySeller,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
