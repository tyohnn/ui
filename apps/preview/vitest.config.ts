import { defineConfig } from "vitest/config";

/**
 * Component tests for what the preview draws that the registry does not test elsewhere: the objects
 * (registry/objects), in jsdom. Styles are not loaded (`css: false`); a real browser checks how they look.
 */
export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["../../registry/objects/**/*.test.tsx"],
        setupFiles: ["./test/setup.ts"],
        css: false,
    },
});
