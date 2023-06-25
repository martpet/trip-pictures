import type { ApiOptions } from '../types';

export const apiOptions = {
  '/login': {
    cookies: ['oauth'],
    queryStrings: ['provider'],
    methods: {
      GET: {
        isPublic: true,
        envVars: ['authDomain', 'clientId', 'loginCallbackUrl'],
      },
    },
  },

  '/login-callback': {
    cookies: ['oauth'],
    queryStrings: ['code', 'state', 'error', 'error_description'],
    methods: {
      GET: {
        isPublic: true,
        envVars: ['authDomain', 'clientId', 'loginCallbackUrl'],
      },
    },
  },

  '/logout': {
    cookies: ['sessionId'],
    headers: ['referer'],
    methods: {
      GET: {
        isPublic: true,
        envVars: [
          'authDomain',
          'clientId',
          'logoutCallbackUrl',
          'logoutCallbackLocalhostUrl',
        ],
      },
    },
  },

  '/me': {
    methods: {
      GET: {},
    },
  },

  '/settings': {
    methods: {
      PATCH: {},
    },
  },
  '/upload-urls': {
    methods: {
      POST: {
        envVars: ['photoBucket'],
        handlerProps: {
          memorySize: 256,
        },
      },
    },
  },
  '/photos': {
    methods: {
      POST: {
        handlerProps: {
          memorySize: 256,
        },
      },
    },
  },
  '/photos/:fingerprint': {
    methods: {
      GET: {
        isPublic: true,
      },
    },
  },
  '/photo-points': {
    methods: {
      GET: {
        isPublic: true,
      },
    },
  },
  '/images/:fingerprint': {
    queryStrings: ['quality', 'width', 'height'],
    cacheProps: {
      maxTtl: 100 * 365 * 24 * 60 * 60,
    },
    methods: {
      GET: {
        isPublic: true,
        envVars: ['photoBucket'],
        handlerProps: {
          memorySize: 512,
          bundling: {
            forceDockerBundling: true,
            nodeModules: ['sharp'],
          },
        },
      },
    },
  },
} as const satisfies ApiOptions;
