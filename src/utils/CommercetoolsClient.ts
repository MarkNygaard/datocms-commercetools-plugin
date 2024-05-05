import { ValidConfig } from '../types';

export type Product = {
  name: string;
  description: string;
  slug: string;
  key: string;
  imageUrl: string;
  masterVariant: {
    sku: string;
    images: {
      url: string;
    }[];
    price: {
      value: {
        centAmount: number;
        currencyCode: string;
      };
    };
  };
};

const normalizeProduct = (product: any): Product => {
  if (!product || typeof product !== 'object') {
    throw new Error('Invalid product');
  }

  return {
    ...product,
    imageUrl: product?.masterVariant?.images[0]?.url || '',
  };
};

const normalizeProducts = (data: any): Product[] =>
  data.map((product: Product) => normalizeProduct(product));

export default class CommercetoolsClient {
  commercetoolsRegion: string;
  projectKey: string;
  clientId: string;
  clientSecret: string;
  languageCode: string;
  currencyCode: string;

  constructor({
    commercetoolsRegion,
    projectKey,
    clientId,
    clientSecret,
    languageCode,
    currencyCode,
  }: Pick<
    ValidConfig,
    | 'projectKey'
    | 'commercetoolsRegion'
    | 'clientId'
    | 'clientSecret'
    | 'languageCode'
    | 'currencyCode'
  >) {
    this.commercetoolsRegion = commercetoolsRegion;
    this.projectKey = projectKey;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.languageCode = languageCode;
    this.currencyCode = currencyCode;
  }

  async productsMatching(query: string) {
    const response = await this.fetch({
      query: `
        query getProducts($query: String) {
          productProjectionSearch(locale: "${this.languageCode}", limit: 10, text: $query) {
            results {
              name(locale: "${this.languageCode}")
              description(locale: "${this.languageCode}")
              slug(locale: "${this.languageCode}")
              key
              masterVariant {
                sku
                images {
                  url
                }
                price(currency: "${this.currencyCode}") {
                  value {
                    currencyCode
                    centAmount
                  }
                }
              }
            }
          }
        }
      `,
      variables: { query: query || '' },
    });
    return normalizeProducts(response.productProjectionSearch.results);
  }

  async productBySku(sku: string) {
    const response = await this.fetch({
      query: `
        query getProduct($sku: String!) {
          product(sku: $sku) {
            masterData {
              current {
                name(locale: "${this.languageCode}")
                description(locale: "${this.languageCode}")
                slug(locale: "${this.languageCode}")
                masterVariant {
                  sku
                  images {
                    url
                  }
                  price(currency: "${this.currencyCode}") {
                    value {
                      currencyCode
                      centAmount
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: { sku },
    });

    return normalizeProduct(response.product.masterData.current);
  }

  async getAccessToken() {
    const res = await fetch(
      `https://auth.${this.commercetoolsRegion}.gcp.commercetools.com/oauth/token?grant_type=client_credentials&scope=view_products:${this.projectKey}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Basic ${btoa(
            this.clientId + ':' + this.clientSecret
          )}`,
        },
      }
    );

    if (res.status !== 200) {
      throw new Error(`Failed to get access token: ${res.status}`);
    }

    const data = await res.json();

    return data.access_token;
  }

  async fetch(requestBody: any) {
    const accessToken = await this.getAccessToken();

    const res = await fetch(
      `https://api.${this.commercetoolsRegion}.gcp.commercetools.com/${this.projectKey}/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (res.status !== 200) {
      throw new Error(`Invalid status code: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    const body = await res.json();

    return body.data;
  }
}
