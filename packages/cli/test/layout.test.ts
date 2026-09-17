import { describe, expect, it } from "vitest";

import { applyLayout, layoutBlock } from "../src/codemods/layout.js";

const block = layoutBlock(['import { Inter } from "next/font/google";', "", 'const fontInter = Inter({ variable: "--font-sans-inter" });'], ['"dark"', '"font-sans"', "fontInter.variable"]);

const createNextApp = `import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={\`\${geistSans.variable} antialiased\`}>
        {children}
      </body>
    </html>
  );
}
`;

describe("root layout codemod", () =>
{
    it("inserts the block after the imports and puts className on <html>", () =>
    {
        const { code, manual } = applyLayout(createNextApp, block, "./globals.css");

        expect(manual).toBeUndefined();
        expect(code).toContain('import "./globals.css";\n\n// tyohnn:begin fonts\nimport { Inter } from "next/font/google";');
        expect(code).toContain('const tyohnnHtmlClassName = ["dark", "font-sans", fontInter.variable].join(" ");\n// tyohnn:end fonts\n\nconst geistSans');
        expect(code).toContain('<html className={tyohnnHtmlClassName} lang="en">');
        expect(code).toContain("<body className={`${geistSans.variable} antialiased`}>");
    });

    it("is idempotent and rewrites only the block on a second run", () =>
    {
        const once = applyLayout(createNextApp, block, "./globals.css").code;

        expect(applyLayout(once, block, "./globals.css").code).toBe(once);

        const light = layoutBlock(['import { Inter } from "next/font/google";'], ['"font-sans"']);
        const switched = applyLayout(once, light, "./globals.css").code;

        expect(switched).not.toContain('"dark"');
        expect(switched.match(/tyohnnHtmlClassName/g)).toHaveLength(2);
    });

    it("merges an existing className string or expression", () =>
    {
        const literal = applyLayout('export default function L({ children }) {\n  return <html lang="en" className="scroll-smooth"><body>{children}</body></html>;\n}\n', block, null).code;

        expect(literal).toContain("className={`${tyohnnHtmlClassName} scroll-smooth`}");
        expect(applyLayout(literal, block, null).code).toBe(literal);

        const expression = applyLayout('import { cn } from "./cn";\nexport default function L({ children }) {\n  return <html className={cn("a", "b")}><body>{children}</body></html>;\n}\n', block, null).code;

        expect(expression).toContain('className={[tyohnnHtmlClassName, cn("a", "b")].join(" ")}');
    });

    it("imports the entry CSS inside the block when the layout does not", () =>
    {
        const code = applyLayout('export default function L({ children }) {\n  return <html><body>{children}</body></html>;\n}\n', block, "./globals.css").code;

        expect(code.startsWith('// tyohnn:begin fonts\nimport "./globals.css";\nimport { Inter }')).toBe(true);
        expect(applyLayout(code, block, "./globals.css").code).toBe(code);
    });

    it("asks for a hand edit when there is no <html>", () =>
    {
        expect(applyLayout("export default function L({ children }) { return children; }\n", block, null).manual).toContain("<html>");
    });
});
