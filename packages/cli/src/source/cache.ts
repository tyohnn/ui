// The user cache: extracted sources per commit, and the commit each ref last resolved to.
//
//   <cache>/sources/<commit>/          registry/ · apps/preview/package.json · apps/preview/src/templates/
//   <cache>/sources/<commit>/.tyohnn-source.json
//   <cache>/refs/<owner>/<repo>/<ref>.json     { commit, fetchedAt }

import { homedir } from "node:os";
import { join } from "node:path";

export const cacheDir = (): string =>
{
    if (process.env.TYOHNN_CACHE_DIR) return process.env.TYOHNN_CACHE_DIR;

    if (process.platform === "darwin") return join(homedir(), "Library/Caches/tyohnn");
    if (process.platform === "win32") return join(process.env.LOCALAPPDATA ?? join(homedir(), "AppData/Local"), "tyohnn/Cache");

    return join(process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"), "tyohnn");
};

export const sourceCacheDir = (key: string): string => join(cacheDir(), "sources", key);

export const refCacheFile = (repo: string, ref: string): string => join(cacheDir(), "refs", ...repo.split("/"), `${encodeURIComponent(ref)}.json`);
