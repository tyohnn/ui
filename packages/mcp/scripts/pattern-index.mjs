// Writes the screen-rules skill's fallback pattern index from registry/blocks. The patterns test fails when the
// file and the registry differ, so run this after adding, removing or redescribing a pattern.

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { patternIndex, readPatterns } from "../src/patterns.ts";

const root = fileURLToPath(new URL("../../..", import.meta.url));

writeFileSync(`${root}/plugin/skills/screen-rules/references/patterns-index.md`, patternIndex(readPatterns(root)));
