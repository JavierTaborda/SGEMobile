import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ExchangeRate } from "../../../types/exchangerate";
import { OrderItem } from "../types/orderItem";

type CreateOrderState = {
  items: OrderItem[];
  exchangeRate: ExchangeRate;
  totalsVES: boolean;
  IVA:number;
  addItem: (product: OrderItem, qty?: number) => void;
  increase: (codart: string, by?: number) => void;
  decrease: (codart: string, by?: number) => void;
  removeItem: (codart: string) => void;
  clearOrder: () => void;
  getSubtotal: () => number;
  getItemsCount: () => number;
  syncWithProducts: (products: OrderItem[], exchange: ExchangeRate, iva?: number) => void;
  setTotalsVES:(value:boolean)=>void;
};

const useCreateOrderStore = create<CreateOrderState>()(
  persist(
    (set, get) => ({
      items: [],
      exchangeRate: {
        tasa_v:0,
        fecha: new Date(),
        co_mone:""
      },
      totalsVES:false,
      IVA:0,
      syncWithProducts: (products: OrderItem[], exchange: ExchangeRate, iva?: number) => {
        set({
          items: get().items
            .map((cartItem) => {
              const product = products.find((p) => p.codart === cartItem.codart);

              if (!product) {
                return null;
              }

              const available = product.available ?? 0;
              return {
                ...cartItem,
                price: product.price,
                quantity: Math.min(
                  cartItem.quantity,
                  product.quantity ?? cartItem.quantity
                ),
                available,
              };
            })
            .filter(Boolean) as OrderItem[],
          exchangeRate: exchange, 
          IVA:iva,
        });
      }
      ,
      addItem: (product, qty = 1) => {
        const exists = get().items.find((i) => i.codart === product.codart);
        if (exists) {
          set({
            items: get().items.map((i) =>
              i.codart === product.codart
                ? {
                  ...i,
                  discount:
                    product.discount !== undefined &&
                      product.discount !== i.discount
                      ? product.discount
                      : i.discount,

                  quantity: Math.min(
                    i.quantity + qty,
                    product.available ?? Infinity
                  ),
                }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...product, quantity: Math.min(qty, product.available ?? qty) },
            ],
          });
        }
      },

      increase: (codart, by = 1) => {
        set({
          items: get().items.map((i) =>
            i.codart === codart
              ? {
                ...i,
                quantity: Math.min(
                  i.quantity + by,
                  i.available ?? i.quantity + by
                ),
              }
              : i
          ),
        });
      },

      decrease: (codart, by = 1) =>
        set({
          items: get()
            .items.map((i) =>
              i.codart === codart
                ? { ...i, quantity: Math.max(0, i.quantity - by) }
                : i
            )
            .filter((i) => i.quantity > 0),
        }),

      removeItem: (codart) => {
        set({ items: get().items.filter((i) => i.codart !== codart) });
      },

      clearOrder: () => {
        set({ items: [] });
      },

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemsCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      setTotalsVES:(value)=> {
        set({ totalsVES:value})
      }
    }),
    {
      name: "create-order-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCreateOrderStore;
