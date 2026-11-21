import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProductCard } from '../lib/api/types';

interface FavoritesStore {
  slugs: string[];
  items: ProductCard[];
  addFavorite: (productOrSlug: ProductCard | string) => void;
  removeFavorite: (slug: string) => void;
  toggleFavorite: (productOrSlug: ProductCard | string) => void;
  isFavorite: (slug: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      slugs: [],
      items: [],

      addFavorite: (productOrSlug) => {
        const slug = typeof productOrSlug === 'string' ? productOrSlug : productOrSlug.slug;
        set((state) => {
          if (state.slugs.includes(slug)) return state;
          const nextSlugs = [...state.slugs, slug];
          const nextItems = typeof productOrSlug === 'object'
            ? [...state.items.filter((i) => i.slug !== slug), productOrSlug]
            : state.items;
          return { slugs: nextSlugs, items: nextItems };
        });
      },

      removeFavorite: (slug) => {
        set((state) => ({
          slugs: state.slugs.filter((s) => s !== slug),
          items: state.items.filter((i) => i.slug !== slug),
        }));
      },

      toggleFavorite: (productOrSlug) => {
        const slug = typeof productOrSlug === 'string' ? productOrSlug : productOrSlug.slug;
        const { slugs, addFavorite, removeFavorite } = get();
        if (slugs.includes(slug)) {
          removeFavorite(slug);
        } else {
          addFavorite(productOrSlug);
        }
      },

      isFavorite: (slug) => {
        return get().slugs.includes(slug);
      },

      clearFavorites: () => {
        set({ slugs: [], items: [] });
      },
    }),
    {
      name: 'mujiza-favorites-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
