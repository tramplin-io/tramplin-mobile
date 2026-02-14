import { defineConfig } from 'orval'

/**
 * Orval configuration for generating type-safe API client from OpenAPI spec.
 *
 * Usage:
 *   npm run generate-api
 *
 * This generates React Query hooks and TypeScript types from your API's
 * OpenAPI specification. The generated code uses a custom Axios instance
 * with auth token injection.
 *
 * @see https://orval.dev/reference/configuration/output
 */
export default defineConfig({
  api: {
    input: {
      /** OpenAPI spec URL or local file path */
      target: process.env.EXPO_PUBLIC_API_URL
        ? `${process.env.EXPO_PUBLIC_API_URL}/openapi`
        : './openapi.json',
    },
    output: {
      /** Generate separate files for hooks and schemas */
      mode: 'split',
      /** Output directory for generated files */
      target: './src/lib/api/generated',
      /** Generate React Query hooks */
      client: 'react-query',
      /** Clean output directory before generating */
      clean: true,
      /** Use custom Axios instance for all requests */
      override: {
        mutator: {
          path: './src/lib/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      /** Format generated files after generation */
      afterAllFilesWrite: 'npx prettier --write ./src/lib/api/generated',
    },
  },
})
