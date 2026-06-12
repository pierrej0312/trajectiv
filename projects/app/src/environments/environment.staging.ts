export const environment = {
  production: false,

  uri: 'http://localhost:8081/api',

  keycloak: {
    config: {
      url: 'http://localhost:8080',
      realm: 'trajectiv',
      clientId: 'trajectiv-web',
      backEndUri: 'http://localhost:8081/api',
    },
    redirectUri: 'http://localhost:4200',
    sessionTimeout: 300000,
    manager: {
      client_id: '',
      secret: '',
    },
  },
};
