import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import produce from 'immer';
import CommercetoolsClient, { Product } from './CommercetoolsClient';

export type Status = 'loading' | 'success' | 'error';

export type State = {
  query: string;
  searches: Record<string, { result: string[] | null; status: Status }>;
  products: Record<string, { result: Product | null; status: Status }>;
  getProduct(sku: string): {
    status: Status;
    product: Product | null;
  };
  getCurrentSearch(): {
    query: string;
    status: Status;
    products: Product[] | null;
  };
  fetchProductBySku(client: CommercetoolsClient, sku: string): Promise<void>;
  fetchProductsMatching(
    client: CommercetoolsClient,
    query: string
  ): Promise<void>;
};

const useStore = create(
  persist(
    (rawSet, get) => {
      const set = (setFn: (s: State) => void) => {
        return rawSet(produce(setFn));
      };

      return {
        query: '',
        products: {},
        searches: {},
        getProduct(sku: string) {
          const selectedProduct = (get() as State).products[sku];

          return {
            status: selectedProduct?.status
              ? selectedProduct.status
              : 'loading',
            product: selectedProduct?.result,
          };
        },
        getCurrentSearch() {
          const state = get() as State;

          const search = state.searches[state.query] || {
            status: 'loading',
            result: [],
          };

          return {
            query: state.query,
            status: search.status,
            products: search.result?.map((id: string) =>
              state.products[id]?.result
                ? state.products[id]?.result
                : undefined
            ),
          };
        },
        async fetchProductBySku(client: CommercetoolsClient, sku: string) {
          set((state) => {
            state.products[sku] = state.products[sku] || { result: null };
            state.products[sku].status = 'loading';
          });

          try {
            const product = await client.productBySku(sku);

            set((state) => {
              state.products[sku].result = product;
              state.products[sku].status = 'success';
            });
          } catch (e) {
            set((state) => {
              state.products[sku].result = null;
              state.products[sku].status = 'error';
            });
          }
        },
        async fetchProductsMatching(
          client: CommercetoolsClient,
          query: string
        ) {
          set((state) => {
            state.searches[query] = state.searches[query] || { result: [] };
            state.searches[query].status = 'loading';
            state.query = query;
          });

          try {
            const products = await client.productsMatching(query);

            set((state) => {
              state.searches[query].status = 'success';
              state.searches[query].result = products.map(
                (p) => p.masterVariant.sku
              );

              products.forEach((product) => {
                state.products[product.masterVariant.sku] =
                  state.products[product.masterVariant.sku] || {};
                state.products[product.masterVariant.sku].result = product;
              });
            });
          } catch (e) {
            set((state) => {
              state.searches[query].status = 'error';
              state.searches[query].result = null;
              console.log(e);
            });
          }
        },
      };
    },
    {
      name: 'datocms-plugin-commercetools-product',
    }
  )
);

export default useStore;
