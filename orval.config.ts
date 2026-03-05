import { defineConfig } from 'orval'

/**
 * Orval configuration for generating type-safe API clients from OpenAPI specs.
 *
 * Usage:
 *   npm run generate-api
 *
 * Two API targets are configured:
 *   - api:       Main Tramplin API  (EXPO_PUBLIC_API_URL)
 *   - referrals: Referrals API      (EXPO_PUBLIC_REFERRALS_API_URL)
 *
 * Each target uses its own Axios instance so requests are routed
 * to the correct base URL automatically.
 *
 * @see https://orval.dev/reference/configuration/output
 */
export default defineConfig({
  api: {
    input: {
      target: 'https://develop-api.tramplin.io/api/openapi',
    },
    output: {
      mode: 'split',
      target: './src/lib/api/generated',
      client: 'react-query',
      clean: true,
      override: {
        mutator: {
          path: './src/lib/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'npx prettier --write ./src/lib/api/generated',
    },
  },

  referrals: {
    input: {
      target: 'https://develop-referrals-api.tramplin.io/api/openapi',
    },
    output: {
      mode: 'split',
      target: './src/lib/api/generated-referrals',
      client: 'react-query',
      clean: true,
      override: {
        mutator: {
          path: './src/lib/api/mutator/referrals-instance.ts',
          name: 'referralsInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'npx prettier --write ./src/lib/api/generated-referrals',
    },
  },
})
