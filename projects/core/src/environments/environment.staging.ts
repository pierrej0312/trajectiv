export const environment = {
  uri: '',
  keycloak: {
    config: {
      url: 'https://sso.ovyn.be',
      realm: 'formation',
      clientId: 'angular',
      credentials: { secret: '' },
      backEndUri: 'http://localhost:3000',
    },
    redirectUri: 'http://localhost:4200',
    sessionTimeout: 0,
    manager: {
      client_id: '',
      secret: '',
    },
  },
};
