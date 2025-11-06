import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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
  sold: boolean;
  sellerRating: number;
  sellerReviews: number;
  verifiedSeller: boolean;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'status' | 'sold' | 'sellerRating' | 'sellerReviews' | 'verifiedSeller'>) => void;
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

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { user } = useAuth();

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles!products_seller_id_fkey(full_name, seller_rating, total_reviews, verified_seller)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    const formattedProducts: Product[] = data.map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      price: parseFloat(p.price),
      category: p.category,
      condition: p.condition,
      image: p.image,
      sellerId: p.seller_id,
      sellerName: p.profiles?.full_name || 'Unknown Seller',
      createdAt: p.created_at,
      status: p.status,
      sold: p.sold || false,
      sellerRating: parseFloat(p.profiles?.seller_rating) || 0,
      sellerReviews: p.profiles?.total_reviews || 0,
      verifiedSeller: p.profiles?.verified_seller || false,
    }));

    setProducts(formattedProducts);
  };

  useEffect(() => {
    fetchProducts();

    // Set up realtime subscription
    const channel = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'status' | 'sold' | 'sellerRating' | 'sellerReviews' | 'verifiedSeller'>) => {
    if (!user) throw new Error('Must be logged in to add products');

    const { error } = await supabase.from('products').insert({
      title: productData.title,
      description: productData.description,
      price: productData.price,
      category: productData.category,
      condition: productData.condition,
      image: productData.image,
      seller_id: productData.sellerId,
    });

    if (error) throw error;
    await fetchProducts();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.condition !== undefined) dbUpdates.condition = updates.condition;
    if (updates.image !== undefined) dbUpdates.image = updates.image;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.sold !== undefined) dbUpdates.sold = updates.sold;

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) throw error;
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchProducts();
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
