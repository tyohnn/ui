// @tyohnn/icons — the icon library of the project. The CLI writes the chosen library here
// (system.json icons.library); the repository keeps lucide so `tsc` resolves the alias. The preview
// does not read this file: its Vite alias points @tyohnn/icons at libraries/<library>.tsx directly.
export * from "./libraries/lucide";
