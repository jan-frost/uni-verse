import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    deps: {
      inline: ['rollup', '@rollup/rollup-android-arm64'],
    },
  },
});
