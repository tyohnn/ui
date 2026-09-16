import { ChartLine, Download, Info, LayoutGrid, Plus, Search, Users } from "@tyohnn/icons";

import { Button } from "@tyohnn/components/button";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
    ComboboxValue,
    useComboboxAnchor,
} from "@tyohnn/components/combobox";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@tyohnn/components/command";
import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuGroup,
    ContextMenuItem,
    ContextMenuLabel,
    ContextMenuRadioGroup,
    ContextMenuRadioItem,
    ContextMenuSeparator,
    ContextMenuShortcut,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@tyohnn/components/context-menu";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@tyohnn/components/dropdown-menu";
import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarGroup,
    MenubarItem,
    MenubarLabel,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@tyohnn/components/menubar";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@tyohnn/components/navigation-menu";

import type { CoverageSection } from "./frame";

const FRAMEWORKS = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"];

const DOCS = [
    { title: "Introduction", description: "Re-usable components built with Tailwind CSS." },
    { title: "Installation", description: "How to install dependencies and structure your app." },
    { title: "Typography", description: "Styles for headings, paragraphs and lists." },
];

export const menuSections: CoverageSection[] = [
    {
        name: "dropdown-menu",
        components: ["dropdown-menu"],
        portals: ['[data-slot="dropdown-menu-content"]', '[data-slot="dropdown-menu-sub-content"]'],
        render: (open) => (
            <div className="flex h-96 items-start">
                <DropdownMenu defaultOpen={open}>
                    <DropdownMenuTrigger render={<Button variant="outline" />}>Open menu</DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuItem><Users />Profile<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
                            <DropdownMenuItem>Billing<DropdownMenuShortcut>⌘B</DropdownMenuShortcut></DropdownMenuItem>
                            <DropdownMenuItem disabled>Disabled</DropdownMenuItem>
                            <DropdownMenuItem inset>Inset item</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuLabel inset>Appearance</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem defaultChecked>Status bar</DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem>Activity bar</DropdownMenuCheckboxItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup defaultValue="bottom">
                            <DropdownMenuRadioItem value="top">Top</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="bottom">Bottom</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub defaultOpen={open}>
                            <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Email</DropdownMenuItem>
                                <DropdownMenuItem>Message</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">Log out<DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
    },
    {
        name: "context-menu",
        components: ["context-menu"],
        portals: ['[data-slot="context-menu-content"]', '[data-slot="context-menu-sub-content"]'],
        render: (open) => (
            <div className="h-96">
                <ContextMenu defaultOpen={open}>
                    <ContextMenuTrigger className="flex h-40 w-72 items-center justify-center rounded-md border border-dashed text-sm">
                        Right click here
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-52">
                        <ContextMenuGroup>
                            <ContextMenuItem>Back<ContextMenuShortcut>⌘[</ContextMenuShortcut></ContextMenuItem>
                            <ContextMenuItem disabled>Forward<ContextMenuShortcut>⌘]</ContextMenuShortcut></ContextMenuItem>
                            <ContextMenuItem inset>Reload</ContextMenuItem>
                        </ContextMenuGroup>
                        <ContextMenuSub defaultOpen={open}>
                            <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
                            <ContextMenuSubContent>
                                <ContextMenuItem>Save page</ContextMenuItem>
                                <ContextMenuItem>Developer tools</ContextMenuItem>
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                        <ContextMenuGroup>
                            <ContextMenuCheckboxItem defaultChecked>Show bookmarks</ContextMenuCheckboxItem>
                            <ContextMenuCheckboxItem>Show full URLs</ContextMenuCheckboxItem>
                        </ContextMenuGroup>
                        <ContextMenuSeparator />
                        <ContextMenuRadioGroup defaultValue="pedro">
                            <ContextMenuLabel inset>People</ContextMenuLabel>
                            <ContextMenuRadioItem value="pedro">Pedro Duarte</ContextMenuRadioItem>
                            <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
                        </ContextMenuRadioGroup>
                        <ContextMenuSeparator />
                        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </div>
        ),
    },
    {
        name: "menubar",
        components: ["menubar"],
        portals: ['[data-slot="menubar-content"]', '[data-slot="menubar-sub-content"]'],
        render: (open) => (
            <div className="h-96">
                <Menubar className="w-fit">
                    <MenubarMenu defaultOpen={open}>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                            <MenubarGroup>
                                <MenubarItem>New Tab<MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
                                <MenubarItem disabled>New Incognito Window</MenubarItem>
                                <MenubarItem inset>Print</MenubarItem>
                            </MenubarGroup>
                            <MenubarSeparator />
                            <MenubarSub defaultOpen={open}>
                                <MenubarSubTrigger>Share</MenubarSubTrigger>
                                <MenubarSubContent>
                                    <MenubarItem>Email link</MenubarItem>
                                    <MenubarItem>Messages</MenubarItem>
                                </MenubarSubContent>
                            </MenubarSub>
                            <MenubarSeparator />
                            <MenubarGroup>
                                <MenubarLabel>View</MenubarLabel>
                                <MenubarCheckboxItem defaultChecked>Always Show Bookmarks Bar</MenubarCheckboxItem>
                                <MenubarCheckboxItem>Always Show Full URLs</MenubarCheckboxItem>
                            </MenubarGroup>
                            <MenubarSeparator />
                            <MenubarRadioGroup defaultValue="benoit">
                                <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
                                <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
                            </MenubarRadioGroup>
                            <MenubarSeparator />
                            <MenubarItem variant="destructive">Quit</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>Edit</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>Undo</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger disabled>View</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>Zoom</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
        ),
    },
    {
        name: "combobox",
        components: ["combobox"],
        portals: ['[data-slot="combobox-content"]'],
        render: (open) => (
            <div className="flex h-80 items-start gap-6">
                <Combobox items={FRAMEWORKS} defaultValue="Remix" defaultOpen={open}>
                    <ComboboxInput placeholder="Select a framework" showClear />
                    <ComboboxContent>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                        <ComboboxList>
                            {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
                        </ComboboxList>
                    </ComboboxContent>
                </Combobox>
                <div className="flex flex-col gap-3">
                    <Combobox items={FRAMEWORKS}>
                        <ComboboxInput placeholder="Closed" />
                        <ComboboxContent>
                            <ComboboxList>
                                {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                    <Combobox items={FRAMEWORKS}>
                        <ComboboxInput placeholder="Disabled" disabled />
                        <ComboboxContent>
                            <ComboboxList>
                                {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                    <Combobox items={FRAMEWORKS}>
                        <ComboboxInput placeholder="Invalid" aria-invalid />
                        <ComboboxContent>
                            <ComboboxList>
                                {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                </div>
            </div>
        ),
    },
    {
        name: "combobox-groups",
        components: ["combobox"],
        portals: ['[data-slot="combobox-content"]'],
        render: (open) => (
            <div className="flex h-96 items-start">
                <Combobox items={FRAMEWORKS} defaultOpen={open}>
                    <ComboboxInput placeholder="Grouped" showTrigger={false} />
                    <ComboboxContent>
                        <ComboboxGroup>
                            <ComboboxLabel>Frameworks</ComboboxLabel>
                            <ComboboxItem value="Next.js">Next.js</ComboboxItem>
                            <ComboboxItem value="Remix">Remix</ComboboxItem>
                        </ComboboxGroup>
                        <ComboboxSeparator />
                        <ComboboxGroup>
                            <ComboboxLabel>Other</ComboboxLabel>
                            <ComboboxItem value="Astro" disabled>Astro</ComboboxItem>
                        </ComboboxGroup>
                        <ComboboxEmpty>No items found.</ComboboxEmpty>
                    </ComboboxContent>
                </Combobox>
            </div>
        ),
    },
    {
        name: "combobox-chips",
        components: ["combobox"],
        portals: ['[data-slot="combobox-content"]'],
        render: (open) => <ComboboxChipsDemo open={open} />,
    },
    {
        name: "command",
        components: ["command"],
        render: () => (
            <div className="flex items-start gap-6">
                <Command className="w-96 border">
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            <CommandItem><LayoutGrid />Calendar</CommandItem>
                            <CommandItem><Search />Search Emoji</CommandItem>
                            <CommandItem disabled><ChartLine />Calculator</CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Settings">
                            <CommandItem><Users />Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
                            <CommandItem><Download />Billing<CommandShortcut>⌘B</CommandShortcut></CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
                <Command className="w-72 border" filter={() => 0}>
                    <CommandInput placeholder="Nothing matches" />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Hidden">
                            <CommandItem>Hidden item</CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
        ),
    },
    {
        name: "command-dialog",
        components: ["command"],
        portals: ['[data-slot="dialog-overlay"]', '[data-slot="dialog-content"]'],
        render: (open) => (
            <CommandDialog defaultOpen={open}>
                <Command>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            <CommandItem><Plus />New file</CommandItem>
                            <CommandItem><Info />Help<CommandShortcut>⌘H</CommandShortcut></CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        ),
    },
    {
        name: "navigation-menu",
        components: ["navigation-menu"],
        // The popup surface carries no data-slot on either side, so it is reached as the content's
        // grandparent (Popup > Viewport > Content).
        portals: ['[data-slot="navigation-menu-content"]^2'],
        render: (open) => (
            <div className="h-80">
                <NavigationMenu defaultValue={open ? "getting-started" : null}>
                    <NavigationMenuList>
                        <NavigationMenuItem value="getting-started">
                            <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-96 gap-1">
                                    {DOCS.map((doc) => (
                                        <li key={doc.title}>
                                            <NavigationMenuLink href="#coverage">
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="leading-none font-medium">{doc.title}</div>
                                                    <div className="line-clamp-2 text-muted-foreground">{doc.description}</div>
                                                </div>
                                            </NavigationMenuLink>
                                        </li>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem value="components">
                            <NavigationMenuTrigger>Components</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-72 gap-1">
                                    <li><NavigationMenuLink href="#coverage">Alert Dialog</NavigationMenuLink></li>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem value="docs">
                            <NavigationMenuLink href="#coverage" className={navigationMenuTriggerStyle()}>Docs</NavigationMenuLink>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>
        ),
    },
];

function ComboboxChipsDemo({ open }: { open: boolean })
{
    const anchor = useComboboxAnchor();

    return (
        <div className="flex h-80 w-96 items-start">
            <Combobox multiple items={FRAMEWORKS} defaultValue={["Next.js", "Astro"]} defaultOpen={open}>
                <ComboboxChips ref={anchor}>
                    <ComboboxValue>
                        {(values: string[]) => (
                            <>
                                {values.map((value) => <ComboboxChip key={value}>{value}</ComboboxChip>)}
                                <ComboboxChipsInput placeholder="Add framework" />
                            </>
                        )}
                    </ComboboxValue>
                </ComboboxChips>
                <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>No items found.</ComboboxEmpty>
                    <ComboboxList>
                        {(item: string) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
                    </ComboboxList>
                </ComboboxContent>
            </Combobox>
        </div>
    );
}
