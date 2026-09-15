import { Specimen } from "./Specimen";

/**
 * The component sheet. The page frame mirrors the original app's landing (max-w-6xl · px-6 · py-12) so the
 * sheet lays out at the same width as the app it was verified against.
 */
export const ComponentSheet = () => (
    <main className="mx-auto flex min-h-dvh max-w-6xl flex-col justify-center py-12 gap-6 px-6">
        <Specimen />
    </main>
);
