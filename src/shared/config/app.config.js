export const appConfig = {
  name: 'ArgBase',
  description: 'Your knowledge platform',
  
  featureFlags: {
    navigation_banner: {
      control: 'ArgBase',
      beta: 'ArgBase (beta)',
      next: 'ArgBase (beta)',
    },
  },
  
  firestore: {
    usersCollection: 'users',
    betaEnabledField: 'beta_enabled',
  },
  
  firebase: {
    stagingProject: 'argbase-staging',
    productionProject: 'argbase-prod',
  },
  
  urls: {
    staging: 'https://argbase-staging.web.app',
    production: 'https://argbase.org',
  },
};
