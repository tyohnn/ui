declare module "virtual:tyohnn-fonts" {}

declare module "virtual:tyohnn-system" {
    /** The system this dev server or build was started for (SYSTEM=<name> or --system=<name>) */
    export const system: string;
    /** The icon library @tyohnn/icons resolves to (system.json icons.library, or ICONS=<library>) */
    export const iconLibrary: string;
}
