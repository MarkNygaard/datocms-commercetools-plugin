export type FirstInstallationParameters = {};

export type ValidConfig = {
  commercetoolsRegion: string;
  projectKey: string;
  clientId: string;
  clientSecret: string;
  languageCode: string;
  currencyCode: string;
  paramsVersion: '2';
};

export type LegacyConfig =
  | {
      commercetoolsRegion: string;
      projectKey: string;
      clientId: string;
      clientSecret: string;
      languageCode: string;
      currencyCode: string;
    }
  | FirstInstallationParameters;

export type Config = ValidConfig | LegacyConfig | FirstInstallationParameters;

export function isValidConfig(params: Config): params is ValidConfig {
  return params && 'paramsVersion' in params && params.paramsVersion === '2';
}

export function normalizeConfig(params: Config): ValidConfig {
  if (isValidConfig(params)) {
    return params;
  }

  return {
    paramsVersion: '2',
    projectKey: 'projectKey' in params ? params.projectKey : 'brand-production',
    commercetoolsRegion:
      'commercetoolsRegion' in params
        ? params.commercetoolsRegion
        : 'europe-west1',
    clientId: '',
    clientSecret: '',
    languageCode: 'en-GB',
    currencyCode: 'USD',
  };
}
