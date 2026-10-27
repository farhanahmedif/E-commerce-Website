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
  variantSku?: string;
  image: string;
  isSample?: boolean;
};

type ShopState = {
  cart: CartLine[];
  wishlist: string[];
  couponCode: string;
  cartDrawerOpen: boolean;
  hasHydrated: boolean;
  addToCart: (
    product: MockProduct,
    quantity?: number,
    variantLabel?: string,
    stockLimit?: number,
    variantSku?: string,
    unitPrice?: number,
  ) => void;
  toggleWishlist: (productId: string) => void;
  moveToWishlist: (lineId: string) => void;
  setCouponCode: (couponCode: string) => void;
  clearCart: () => void;
  setCartDrawerOpen: (open: boolean) => void;
  setCartQuantity: (lineId: string, quantity: number) => void;
  removeCartLine: (lineId: string) => void;
  setHasHydrated: (hydrated: boolean) => void;
};

type PersistedShopState = Pick<ShopState, 'cart' | 'wishlist' | 'couponCode'>;

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      wishlist: [],
      couponCode: '',
      cartDrawerOpen: false,
      hasHydrated: false,
      addToCart: (
        product,
        quantity = 1,
        variantLabel = '',
        stockLimit = product.stock,
        variantSku,
        unitPrice = product.price,
      ) =>
        set((state) => {
          if (
            !Number.isSafeInteger(quantity) ||
            quantity <= 0 ||
            !Number.isSafeInteger(stockLimit) ||
            stockLimit <= 0
          )
            return state;
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
                    price: unitPrice,
                    quantity: nextQuantity,
                    stock: stockLimit,
                    variantLabel,
                    ...(variantSku ? { variantSku } : {}),
                    image: product.image,
                    isSample: product.isSample ?? true,
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
      moveToWishlist: (lineId) =>
        set((state) => {
          const line = state.cart.find((item) => item.id === lineId);
          if (!line) return state;
          const cart = state.cart.filter((item) => item.id !== lineId);
          return {
            cart,
            couponCode: cart.length ? state.couponCode : '',
            wishlist: state.wishlist.includes(line.productId)
              ? state.wishlist
              : [...state.wishlist, line.productId],
          };
        }),
      setCouponCode: (couponCode) => set({ couponCode }),
      clearCart: () => set({ cart: [], couponCode: '', cartDrawerOpen: false }),
      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),
      setCartQuantity: (lineId, quantity) =>
        set((state) => {
          if (!Number.isSafeInteger(quantity)) return state;
          if (quantity <= 0) {
            const cart = state.cart.filter((line) => line.id !== lineId);
            return { cart, couponCode: cart.length ? state.couponCode : '' };
          }
          return {
            cart: state.cart.map((line) =>
              line.id === lineId ? { ...line, quantity: Math.min(line.stock, quantity) } : line,
            ),
          };
        }),
      removeCartLine: (lineId) =>
        set((state) => {
          const cart = state.cart.filter((line) => line.id !== lineId);
          return { cart, couponCode: cart.length ? state.couponCode : '' };
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'haatgo-shop-v1',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state): PersistedShopState => ({
        cart: state.cart,
        wishlist: state.wishlist,
        couponCode: state.couponCode,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

export const selectCartCount = (state: ShopState) =>
  state.cart.reduce((count, line) => count + line.quantity, 0);
