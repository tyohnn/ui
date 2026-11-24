import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

declare global
{
    var __UI_SDK_STRICT__: boolean | undefined;
}

globalThis.__UI_SDK_STRICT__ = true;

// jsdom's gaps, as UI SDK's testing guide lists them (@ui-sdk/core/skills/ui-sdk/references/testing.md)
HTMLElement.prototype.showPopover = function () {};
HTMLElement.prototype.hidePopover = function () {};
Element.prototype.getAnimations = () => [];
Element.prototype.scrollIntoView = function () {};
Element.prototype.checkVisibility = () => true;
Element.prototype.getClientRects = () => [] as unknown as DOMRectList;
document.elementFromPoint = () => null;
document.elementsFromPoint = () => [];
globalThis.ResizeObserver ??= class
{
    observe() {}
    unobserve() {}
    disconnect() {}
};
window.matchMedia ??= (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false,
}) as MediaQueryList;

afterEach(cleanup);
