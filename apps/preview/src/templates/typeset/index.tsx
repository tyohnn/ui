import type { ReactNode } from "react";

import { Prose } from "@tyohnn/blocks/prose";

/**
 * The started system's long-form typesetting (`?template=typeset`): one text set twice, on the document preset
 * (`.typeset`) and on the tool preset (`.typeset.typeset-tool`). Each column stops at its own preset's measure, so
 * size, leading, measure, heading steps and tracking all read off the system's `--typeset-*` tokens. The text mixes
 * Korean and Latin on purpose: `keep-all` and the tracking are only visible with both.
 */
const Text = () => (
    <>
        <h1>Writing a release note people read</h1>
        <p>
            A release note is read once, quickly, by someone deciding whether the change matters to them. 첫 문단에서 무엇이
            바뀌었고 누구에게 영향이 있는지 말하면, 나머지는 필요한 사람만 읽는다.
        </p>
        <h2>Lead with the change</h2>
        <p>
            Name what moved before why it moved. 「결제 화면이 한 단계 줄었다」가 「전환율 개선을 위해 노력했다」보다 먼저 온다.
            Link the details — the <a href="#typeset">migration guide</a>, the <code>checkout.v2</code> flag — instead of
            pasting them in.
        </p>
        <ul>
            <li>One change per paragraph, in the order a reader meets them.</li>
            <li>숫자는 단위와 함께: 4.2초에서 1.8초로.</li>
            <li>Breaking changes first, marked as breaking.</li>
        </ul>
        <blockquote>
            <p>읽는 사람이 다음에 무엇을 해야 하는지 모르면, 그 글은 아직 끝나지 않았다.</p>
        </blockquote>
        <h3>When a step is required</h3>
        <ol>
            <li>Say who has to act and by when.</li>
            <li>Give the one command that does it.</li>
        </ol>
        <pre>
            <code>npx tyohnn sync</code>
        </pre>
        <p>
            Everything else — the reasoning, the alternatives we dropped — belongs in the design doc. 릴리스 노트는 결정의
            기록이 아니라 결과의 안내다.
        </p>
    </>
);

const Column = ({ label, preset }: { label: ReactNode; preset: "document" | "tool" }) => (
    <section className="flex min-w-0 flex-col gap-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Prose as="article" preset={preset} className="max-w-[var(--typeset-measure)]">
            <Text />
        </Prose>
    </section>
);

export const TypesetSheet = () => (
    <main data-template="typeset" className="mx-auto grid min-h-dvh max-w-[1440px] grid-cols-1 gap-x-16 gap-y-12 px-10 py-12 lg:grid-cols-2">
        <Column label="Document · .typeset" preset="document" />
        <Column label="Tool · .typeset.typeset-tool" preset="tool" />
    </main>
);
