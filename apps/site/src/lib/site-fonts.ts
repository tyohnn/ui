/**
 * The catalog fonts the site self-hosts (imported in src/app/layout.tsx): its own three (Bricolage Grotesque,
 * Geist, Geist Mono) plus every font a system's name is set in. registry.ts fails the build when a system names
 * a font that is missing here, so a new system cannot render its name in a fallback face.
 */
export const SITE_FONTS: readonly string[] = [
    "bricolage-grotesque",
    "figtree",
    "geist",
    "geist-mono",
    "inter",
    "jetbrains-mono",
    "noto-sans",
    "playfair-display",
    "pretendard",
];
