import { useCallback, useEffect, useMemo } from 'react';
import { normalizeConfig } from '../../types';
import Price from '../Price';
import { useCtx } from 'datocms-react-ui';
import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import CommercetoolsClient from '../../utils/CommercetoolsClient';
import useStore, { State } from '../../utils/useStore';
import s from './styles.module.css';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExternalLinkAlt,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';

export type ValueProps = {
  value: string;
  onReset: () => void;
};

export default function Value({ value, onReset }: ValueProps) {
  const ctx = useCtx<RenderFieldExtensionCtx>();

  const {
    commercetoolsRegion,
    projectKey,
    clientId,
    clientSecret,
    languageCode,
    currencyCode,
  } = normalizeConfig(ctx.plugin.attributes.parameters);

  const client = useMemo(
    () =>
      new CommercetoolsClient({
        commercetoolsRegion,
        projectKey,
        clientId,
        clientSecret,
        languageCode,
        currencyCode,
      }),
    [
      commercetoolsRegion,
      projectKey,
      clientId,
      clientSecret,
      languageCode,
      currencyCode,
    ]
  );

  const { product, status } = useStore(
    useCallback((state) => (state as State).getProduct(value), [value])
  );

  const fetchProductBySku = useStore(
    (state) => (state as State).fetchProductBySku
  );

  useEffect(() => {
    fetchProductBySku(client, value);
  }, [client, value, fetchProductBySku]);

  return (
    <div
      className={classNames(s['value'], {
        [s['loading']]: status === 'loading',
      })}
    >
      {status === 'error' && (
        <div className={s['product']}>
          API Error! Could not fetch details for product:&nbsp;
          <code>{value}</code>
        </div>
      )}
      {product && (
        <div className={s['product']}>
          <div
            className={s['product__image']}
            style={{
              backgroundImage: `url(${product.imageUrl})`,
            }}
          />
          <div className={s['product__info']}>
            <div className={s['product__title']}>
              <span>{product.name}</span>
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </div>
            <div className={s['product__description']}>
              {product.description}
            </div>

            <div className={s['product__price']}>
              <strong>Price: </strong>

              <span>
                <Price
                  amount={product.masterVariant.price.value.centAmount / 100}
                  currencyCode={product.masterVariant.price.value.currencyCode}
                />
              </span>
            </div>
          </div>
        </div>
      )}
      <button type="button" onClick={onReset} className={s['reset']}>
        <FontAwesomeIcon icon={faTimesCircle} />
      </button>
    </div>
  );
}
