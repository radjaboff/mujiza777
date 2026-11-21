import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UnitType } from '../lib/api/types';

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  unitType: UnitType;
  minQuantity: number;
  quantityStep: number;
  prepTimeMinutes?: number;
  quantity: number;
  isAvailable?: boolean;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, customQuantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, delta: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getItemQuantity: (productId: number) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, customQuantity) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const initialQuantity = customQuantity ?? item.minQuantity;

          if (existing) {
            const nextQty = Math.min(100, Number((existing.quantity + (item.quantityStep || 1)).toFixed(3)));
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, ...item, quantity: nextQty } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: Math.min(100, Math.max(item.minQuantity, initialQuantity)),
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, delta) => {
        set((state) => {
          const target = state.items.find((i) => i.productId === productId);
          if (!target) return state;

          const step = target.quantityStep || 1;
          const nextQty = Number((target.quantity + delta * step).toFixed(3));

          if (nextQty < target.minQuantity) {
            // Kam miqdordan tushganda olib tashlanadi
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }

          return {
            items: state.items.map((i) =>
              i.productId === productId
                ? { ...i, quantity: Math.min(100, nextQty) }
                : i
            ),
          };
        });
      },

      setQuantity: (productId, quantity) => {
        set((state) => {
          const target = state.items.find((i) => i.productId === productId);
          if (!target) return state;

          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.productId !== productId),
            };
          }

          const clamped = Math.min(100, Math.max(target.minQuantity, Number(quantity.toFixed(3))));
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity: clamped } : i
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.length;
      },

      getItemQuantity: (productId) => {
        const item = get().items.find((i) => i.productId === productId);
        return item ? item.quantity : 0;
      },
    }),
    {
      name: 'mujiza-cart-v1', // TZ 7.1 dagi versiyalangan kalit
      storage: createJSONStorage(() => localStorage),
    }
  )
);
