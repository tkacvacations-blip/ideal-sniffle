import { supabase } from './supabase';
import type { CartItem } from '../types';

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      activity:activities(*),
      property:properties(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart items:', error);
    return [];
  }

  return data || [];
}

export async function addToCart(userId: string, item: Omit<CartItem, 'id' | 'user_id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('cart_items').insert({
    ...item,
    user_id: userId,
  });

  if (error) {
    throw new Error(`Failed to add item to cart: ${error.message}`);
  }
}

export async function removeFromCart(itemId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('id', itemId);

  if (error) {
    throw new Error(`Failed to remove item from cart: ${error.message}`);
  }
}

export async function clearCart(userId: string): Promise<void> {
  const { error } = await supabase.from('cart_items').delete().eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to clear cart: ${error.message}`);
  }
}

export function calculateCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.total_price, 0);
}
