import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SavedOrderItem {
  productId?: number;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  unitType?: 'PIECE' | 'KG';
}

export interface SavedOrderRef {
  token: string;
  orderNumber?: string;
  createdAt: string;
  totalAmount?: number;
  orderType?: 'DELIVERY' | 'PICKUP';
  status?: string;
  items?: SavedOrderItem[];
  branchName?: string;
  deliveryAddress?: string;
}

interface MyOrdersStore {
  tokens: string[];
  orders: SavedOrderRef[];
  addToken: (token: string, metadata?: Partial<SavedOrderRef>) => void;
  removeToken: (token: string) => void;
  updateOrderStatus: (token: string, status: string) => void;
}

export const useMyOrdersStore = create<MyOrdersStore>()(
  persist(
    (set) => ({
      tokens: [],
      orders: [],

      addToken: (token, metadata) => {
        set((state) => {
          // Eng yangisi boshida turadi, takrorlanmaydi, ko'pi bilan 30 ta saqlanadi
          const filteredTokens = state.tokens.filter((t) => t !== token);
          const filteredOrders = state.orders.filter((o) => o.token !== token);
          
          const newOrderRef: SavedOrderRef = {
            token,
            orderNumber: metadata?.orderNumber || `#${token.slice(0, 6).toUpperCase()}`,
            createdAt: metadata?.createdAt || new Date().toISOString(),
            totalAmount: metadata?.totalAmount,
            orderType: metadata?.orderType,
            status: metadata?.status || 'NEW',
            items: metadata?.items || [],
            branchName: metadata?.branchName,
            deliveryAddress: metadata?.deliveryAddress,
          };

          return {
            tokens: [token, ...filteredTokens].slice(0, 30),
            orders: [newOrderRef, ...filteredOrders].slice(0, 30),
          };
        });
      },

      removeToken: (token) => {
        set((state) => ({
          tokens: state.tokens.filter((t) => t !== token),
          orders: state.orders.filter((o) => o.token !== token),
        }));
      },

      updateOrderStatus: (token, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.token === token ? { ...o, status } : o
          ),
        }));
      },
    }),
    {
      name: 'mujiza-my-orders-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
