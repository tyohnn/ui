import { describe, expect, it } from "vitest";

import { blockBody, hasBlock, removeBlock, renderBlock, replaceBlock } from "../src/lib/markers.js";

describe("managed blocks", () =>
{
    it("renders, replaces with the original indentation, and removes", () =>
    {
        const code = `const config = {\n${renderBlock("ts", "x", "a: 1,", "    ")}\n    b: 2,\n};\n`;

        expect(hasBlock(code, "ts", "x")).toBe(true);
        expect(replaceBlock(code, "ts", "x", "a: 3,")).toBe("const config = {\n    // tyohnn:begin x\n    a: 3,\n    // tyohnn:end x\n    b: 2,\n};\n");
        expect(replaceBlock(code, "ts", "y", "")).toBeNull();
        expect(removeBlock(code, "ts", "x")).toBe("const config = {\n    b: 2,\n};\n");
        expect(blockBody(code, "ts", "x")).toBe("a: 1,");
        expect(renderBlock("css", "system", '@import "a";')).toBe('/* tyohnn:begin system */\n@import "a";\n/* tyohnn:end system */');
    });
});
