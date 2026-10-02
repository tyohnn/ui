/**
 * `?loading` shows a template's waiting face: every block that waits for data is drawn `loading`, in the frame it
 * has with the data. A template passes this to its blocks (`loading={LOADING}`); the fixed data is still passed,
 * the blocks set it aside.
 */
export const LOADING = new URLSearchParams(location.search).has("loading");
