import { RenderConfigScreenCtx } from 'datocms-plugin-sdk';
import { Button, Canvas, TextField, Form, FieldGroup } from 'datocms-react-ui';
import { Form as FormHandler, Field } from 'react-final-form';
import { ValidConfig, normalizeConfig } from '../types';
import CommercetoolsClient from '../utils/CommercetoolsClient';
import s from './styles.module.css';

type Props = {
  ctx: RenderConfigScreenCtx;
};

export default function ConfigScreen({ ctx }: Props) {
  return (
    <Canvas ctx={ctx}>
      <FormHandler<ValidConfig>
        initialValues={normalizeConfig(ctx.plugin.attributes.parameters)}
        validate={(values: ValidConfig) => {
          const errors: Record<string, string> = {};

          if (!values.commercetoolsRegion) {
            errors.commercetoolsRegion = 'This field is required!';
          }

          if (!values.projectKey) {
            errors.projectKey = 'This field is required!';
          }

          if (!values.clientId) {
            errors.clientId = 'This field is required!';
          }

          if (!values.clientSecret) {
            errors.clientSecret = 'This field is required!';
          }

          if (!values.languageCode) {
            errors.languageCode = 'This field is required!';
          }

          if (!values.currencyCode) {
            errors.clientSecret = 'This field is required!';
          }

          return errors;
        }}
        onSubmit={async (values: ValidConfig) => {
          try {
            const client = new CommercetoolsClient(values);
            await client.productsMatching('organic');
          } catch (e) {
            console.log('test', e);

            return {
              tupleFailing:
                'The API key seems to be invalid for the specified Commercetools domain!',
            };
          }

          await ctx.updatePluginParameters(values);
          ctx.notice('Settings updated successfully!');
        }}
      >
        {({ handleSubmit, submitting, dirty, submitErrors }) => (
          <Form onSubmit={handleSubmit}>
            {submitErrors?.tupleFailing && (
              <div className={s.error}>{submitErrors.tupleFailing}</div>
            )}
            <FieldGroup>
              <Field name="commercetoolsRegion">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="commercetoolsRegion"
                    label="Commercetools Region"
                    hint={
                      <>
                        Insert your region. If your shop domain is{' '}
                        <code>mc.europe-west1.gcp.commercetools.com</code>, then
                        insert <code>europe-west1</code>
                      </>
                    }
                    placeholder="commercetools_region"
                    required
                    error={error}
                    {...input}
                  />
                )}
              </Field>
              <Field name="projectKey">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="projectKey"
                    label="Project Key"
                    hint={
                      <>
                        See{' '}
                        <a
                          href="https://docs.commercetools.com/merchant-center/projects"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Commercetools Project Key documentation
                        </a>{' '}
                        for more info
                      </>
                    }
                    textInputProps={{ monospaced: true }}
                    placeholder="XXXYYY"
                    required
                    error={error}
                    {...input}
                  />
                )}
              </Field>
              <Field name="clientId">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="clientId"
                    label="Client ID"
                    hint={
                      <>
                        See{' '}
                        <a
                          href="https://docs.commercetools.com/getting-started/create-api-client"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Commercetools Client ID & Secret documentation
                        </a>{' '}
                        for more info
                      </>
                    }
                    placeholder="client_id"
                    error={error}
                    textInputProps={{ monospaced: true }}
                    {...input}
                  />
                )}
              </Field>
              <Field name="clientSecret">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="clientSecret"
                    label="Client Secret"
                    hint={
                      <>
                        See{' '}
                        <a
                          href="https://docs.commercetools.com/getting-started/create-api-client"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Commercetools Client ID & Secret documentation
                        </a>{' '}
                        for more info
                      </>
                    }
                    placeholder="client_secret"
                    error={error}
                    textInputProps={{ monospaced: true }}
                    {...input}
                  />
                )}
              </Field>
              <Field name="languageCode">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="languageCode"
                    label="Language Code"
                    hint={
                      <>
                        Insert language code e.g. <code>en-GB</code>
                      </>
                    }
                    placeholder="en-GB"
                    error={error}
                    textInputProps={{ monospaced: true }}
                    {...input}
                  />
                )}
              </Field>
              <Field name="currencyCode">
                {({ input, meta: { error } }) => (
                  <TextField
                    id="currencyCode"
                    label="Currency Code"
                    hint={
                      <>
                        Insert currency code e.g. <code>USD</code>
                      </>
                    }
                    placeholder="USD"
                    error={error}
                    textInputProps={{ monospaced: true }}
                    {...input}
                  />
                )}
              </Field>
            </FieldGroup>
            <Button
              type="submit"
              fullWidth
              buttonSize="l"
              buttonType="primary"
              disabled={submitting || !dirty}
            >
              Save settings
            </Button>
          </Form>
        )}
      </FormHandler>
    </Canvas>
  );
}
