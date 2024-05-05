import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk';
import { Canvas } from 'datocms-react-ui';
import Value from '../components/Value';
import Empty from '../components/Empty';
import { Product } from '../utils/CommercetoolsClient';
import get from 'lodash-es/get';

type PropTypes = {
  ctx: RenderFieldExtensionCtx;
};

export default function FieldExtension({ ctx }: PropTypes) {
  const fieldType = ctx.field.attributes.field_type;

  const rawValue = get(ctx.formValues, ctx.fieldPath) as string;

  let parsedJson = null;
  const value = JSON.parse(rawValue);
  if (value !== null) {
    parsedJson = value.masterVariant.sku;
  }

  let commercetoolsSku;

  switch (fieldType) {
    case 'json':
      commercetoolsSku = rawValue && parsedJson;
      break;
    case 'string':
      commercetoolsSku = rawValue;
      break;

    default:
      break;
  }

  const handleSelect = (product: Product) => {
    ctx.setFieldValue(
      ctx.fieldPath,
      fieldType === 'json'
        ? JSON.stringify(product)
        : product?.masterVariant?.sku
    );
  };

  const handleReset = () => {
    ctx.setFieldValue(ctx.fieldPath, null);
  };

  return (
    <Canvas ctx={ctx}>
      {commercetoolsSku ? (
        <Value value={commercetoolsSku} onReset={handleReset} />
      ) : (
        <Empty onSelect={handleSelect} />
      )}
    </Canvas>
  );
}
