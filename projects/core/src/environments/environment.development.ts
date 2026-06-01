export const environment = {
  production: false,

  uri: 'http://localhost:3000',

  keycloak: {
    config: {
      url: 'http://localhost:8080',
      realm: 'trajectiv',
      clientId: 'trajectiv-web',
      backEndUri: 'http://localhost:3000',
    },
    redirectUri: 'http://localhost:4200',
    sessionTimeout: 1800000,
  },
};
