import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { MockProduct } from '@/lib/mock/products';

export type CartLine = {
  id: string;
  productId: string;
  nameBn: string;
  slug: string;
  price: number;
  quantity: number;
  stock: number;
  variantLabel: string;
  image: string;
};
type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  cartDrawerOpen: boolean;
  hasHydrated: boolean;
  addToCart: (product: MockProduct, quantity?: number, variantLabel?: string, stockLimit?: number) => void;
  toggleWishlist: (productId: string) => void;
  setCartDrawerOpen: (open: boolean) => void;
  setCartQuantity: (lineId: string, quantity: number) => void;
  removeCartLine: (lineId: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
};
type PersistedShopState = Pick<ShopState, 'cart' | 'wishlist'>;

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      cartDrawerOpen: false,
      hasHydrated: false,
    addToCart: (product, quantity = 1, variantLabel = '', stockLimit = product.stock) =>
        set((state) => {
          const lineId = `${product.id}:${variantLabel}`;
          const found = state.cart.find((line) => line.id === lineId);
          const currentQuantity = found?.quantity ?? 0;
        if (currentQuantity >= stockLimit || stockLimit <= 0) return { cartDrawerOpen: true };
        const nextQuantity = Math.min(stockLimit, currentQuantity + quantity);
          return {
            cartDrawerOpen: true,
            cart: found
              ? state.cart.map((line) =>
                  line.id === lineId ? { ...line, quantity: nextQuantity } : line,
                )
              : [
                  ...state.cart,
                  {
                    id: lineId,
                    productId: product.id,
                    nameBn: product.nameBn,
                    slug: product.slug,
                    price: product.price,
                    quantity: Math.min(product.stock, quantity),
                  stock: stockLimit,
                    variantLabel,
                    image: product.image,
                  },
                ],
          };
        }),
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      setCartQuantity: (lineId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((line) => line.id !== lineId)
              : state.cart.map((line) =>
                  line.id === lineId ? { ...line, quantity: Math.min(line.stock, quantity) } : line,
                ),
        })),
      removeCartLine: (lineId) =>
        set((state) => ({ cart: state.cart.filter((line) => line.id !== lineId) })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'haatgo-shop-v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state): PersistedShopState => ({ cart: state.cart, wishlist: state.wishlist }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export const selectCartCount = (state: ShopState) =>
  state.cart.reduce((count, line) => count + line.quantity, 0);
