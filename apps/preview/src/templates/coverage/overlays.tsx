import { Info, TriangleAlert } from "@tyohnn/icons";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@tyohnn/components/alert-dialog";
import { Button } from "@tyohnn/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@tyohnn/components/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@tyohnn/components/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@tyohnn/components/hover-card";
import { Input } from "@tyohnn/components/input";
import { Kbd } from "@tyohnn/components/kbd";
import { Label } from "@tyohnn/components/label";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@tyohnn/components/popover";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@tyohnn/components/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@tyohnn/components/tooltip";

import type { CoverageSection } from "./frame";

const SIDES = ["right", "left", "top", "bottom"] as const;

const sheetSection = (side: (typeof SIDES)[number]): CoverageSection => ({
    name: side === "right" ? "sheet" : `sheet-${side}`,
    components: ["sheet"],
    portals: ['[data-slot="sheet-overlay"]', '[data-slot="sheet-content"]'],
    render: (open) => (
        <Sheet defaultOpen={open}>
            <SheetTrigger render={<Button variant="outline" />}>Open {side} sheet</SheetTrigger>
            <SheetContent side={side}>
                <SheetHeader>
                    <SheetTitle>Edit profile</SheetTitle>
                    <SheetDescription>Make changes to your profile here. Click save when you are done.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-3 px-4">
                    <Label htmlFor={`coverage-sheet-${side}`}>Name</Label>
                    <Input id={`coverage-sheet-${side}`} defaultValue="Pedro Duarte" />
                </div>
                <SheetFooter>
                    <Button>Save changes</Button>
                    <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    ),
});

export const overlaySections: CoverageSection[] = [
    {
        name: "dialog",
        components: ["dialog"],
        portals: ['[data-slot="dialog-overlay"]', '[data-slot="dialog-content"]'],
        render: (open) => (
            <Dialog defaultOpen={open}>
                <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share link</DialogTitle>
                        <DialogDescription>Anyone who has this link will be able to view this.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="coverage-dialog-link">Link</Label>
                        <Input id="coverage-dialog-link" defaultValue="https://ui.shadcn.com/docs/installation" readOnly />
                    </div>
                    <DialogFooter showCloseButton>
                        <DialogClose render={<Button />}>Copy</DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        ),
    },
    {
        name: "alert-dialog",
        components: ["alert-dialog"],
        portals: ['[data-slot="alert-dialog-overlay"]', '[data-slot="alert-dialog-content"]'],
        render: (open) => (
            <AlertDialog defaultOpen={open}>
                <AlertDialogTrigger render={<Button variant="outline" />}>Open alert dialog</AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogMedia><TriangleAlert /></AlertDialogMedia>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete your account.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        ),
    },
    {
        name: "alert-dialog-sm",
        components: ["alert-dialog"],
        portals: ['[data-slot="alert-dialog-overlay"]', '[data-slot="alert-dialog-content"]'],
        render: (open) => (
            <AlertDialog defaultOpen={open}>
                <AlertDialogTrigger render={<Button variant="outline" />}>Open small alert dialog</AlertDialogTrigger>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                        <AlertDialogDescription>Do you want to allow the USB accessory to connect to this device?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                        <AlertDialogAction>Allow</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        ),
    },
    ...SIDES.map(sheetSection),
    {
        name: "drawer",
        components: ["drawer"],
        portals: ['[data-slot="drawer-overlay"]', '[data-slot="drawer-popup"]'],
        render: (open) => (
            <Drawer defaultOpen={open} showSwipeHandle>
                <DrawerTrigger render={<Button variant="outline" />}>Open drawer</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Move goal</DrawerTitle>
                        <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 text-sm">350 calories per day</div>
                    <DrawerFooter>
                        <Button>Submit</Button>
                        <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        ),
    },
    {
        name: "drawer-right",
        components: ["drawer"],
        portals: ['[data-slot="drawer-overlay"]', '[data-slot="drawer-popup"]'],
        render: (open) => (
            <Drawer defaultOpen={open} swipeDirection="right">
                <DrawerTrigger render={<Button variant="outline" />}>Open right drawer</DrawerTrigger>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Settings</DrawerTitle>
                        <DrawerDescription>A drawer that swipes to the right.</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        ),
    },
    {
        name: "popover",
        components: ["popover"],
        portals: ['[data-slot="popover-content"]'],
        render: (open) => (
            <div className="flex h-72 items-start">
                <Popover defaultOpen={open}>
                    <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
                    <PopoverContent>
                        <PopoverHeader>
                            <PopoverTitle>Dimensions</PopoverTitle>
                            <PopoverDescription>Set the dimensions for the layer.</PopoverDescription>
                        </PopoverHeader>
                        <div className="grid gap-2">
                            <Label htmlFor="coverage-popover-width">Width</Label>
                            <Input id="coverage-popover-width" defaultValue="100%" />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        ),
    },
    {
        name: "hover-card",
        components: ["hover-card"],
        portals: ['[data-slot="hover-card-content"]'],
        render: (open) => (
            <div className="flex h-56 items-start">
                <HoverCard defaultOpen={open}>
                    <HoverCardTrigger render={<Button variant="link" />}>@nextjs</HoverCardTrigger>
                    <HoverCardContent>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-sm font-semibold">@nextjs</h4>
                            <p className="text-sm">The React Framework, created and maintained by @vercel.</p>
                            <span className="text-xs text-muted-foreground">Joined December 2021</span>
                        </div>
                    </HoverCardContent>
                </HoverCard>
            </div>
        ),
    },
    {
        name: "tooltip",
        components: ["tooltip"],
        portals: ['[data-slot="tooltip-content"]'],
        render: (open) => (
            <TooltipProvider>
                <div className="flex h-32 items-end gap-24 px-24">
                    <Tooltip defaultOpen={open}>
                        <TooltipTrigger render={<Button variant="outline" />}>Top</TooltipTrigger>
                        <TooltipContent>Add to library</TooltipContent>
                    </Tooltip>
                    <Tooltip defaultOpen={open}>
                        <TooltipTrigger render={<Button variant="outline" size="icon" aria-label="Info" />}><Info /></TooltipTrigger>
                        <TooltipContent side="right">Save<Kbd>⌘S</Kbd></TooltipContent>
                    </Tooltip>
                </div>
            </TooltipProvider>
        ),
    },
];
