import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createAgent } from "@ui-sdk/react/agent";
import { describe, expect, it, vi } from "vitest";

import { FrostAlarm } from "./frost-alarm";

const lcd = () => screen.getByRole("img").getAttribute("aria-label");

describe("the frost alarm", () =>
{
    it("is a switch named by its legend, off at first, and the LCD says so", () =>
    {
        render(<FrostAlarm />);

        const toggle = screen.getByRole("switch", { name: "Frost alarm" });

        expect(toggle.getAttribute("aria-checked")).toBe("false");
        expect(toggle.hasAttribute("aria-disabled")).toBe(false);
        expect(lcd()).toContain("Frost alarm off");
    });

    it("arms with Space and with a click on its legend, and the LCD reads the alarm level", async () =>
    {
        const user = userEvent.setup();

        render(<FrostAlarm />);

        const toggle = screen.getByRole("switch", { name: "Frost alarm" });

        toggle.focus();
        await user.keyboard(" ");
        expect(toggle.getAttribute("aria-checked")).toBe("true");
        expect(lcd()).toContain("Frost alarm on, at 34.0 degrees");

        await user.click(screen.getByText("Frost", { exact: false }));
        expect(toggle.getAttribute("aria-checked")).toBe("false");
    });

    it("takes the product's words", () =>
    {
        render(<FrostAlarm labels={{ legend: ["서리", "알람"], reading: () => "바깥 1.4도" }} />);

        expect(screen.getByRole("switch", { name: "서리 알람" })).toBeTruthy();
        expect(lcd()).toBe("바깥 1.4도");
    });

    it("skips the boot sequence and stops the blink with reduced motion", async () =>
    {
        const user = userEvent.setup();
        const media = vi.spyOn(window, "matchMedia").mockImplementation((query) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList);
        const timers = vi.spyOn(window, "setInterval");

        render(<FrostAlarm />);
        await user.click(screen.getByRole("switch", { name: "Frost alarm" }));

        expect(timers.mock.calls.filter(([, delay]) => delay === 500)).toEqual([]);
        expect(lcd()).toContain("on, at 34.0");

        media.mockRestore();
        timers.mockRestore();
    });

    it("lets an agent find the switch by name and arm it", async () =>
    {
        const agent = createAgent();

        render(<FrostAlarm />);

        const components = agent.snapshot().filter((entry) => !entry.offPage && entry.component !== "more");

        for (const entry of components) expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
        expect(components.map((entry) => entry.label)).toContain("Frost alarm");

        const steps = components.find((entry) => entry.label === "Frost alarm")!;
        let result: Awaited<ReturnType<typeof agent.act>> | undefined;

        await act(async () =>
        {
            result = await agent.act({ steps: [{ ref: "Frost alarm", action: steps.actions.includes("setChecked") ? "setChecked" : "toggle", args: steps.actions.includes("setChecked") ? [true] : [] }] });
        });

        expect(result?.ok, result?.error?.message).toBe(true);
        expect(screen.getByRole("switch", { name: "Frost alarm" }).getAttribute("aria-checked")).toBe("true");
    });
});
