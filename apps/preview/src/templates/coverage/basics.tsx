import { Bell, ChevronDown, ChevronLeft, ChevronRight, Download, Info, Loader, MoreHorizontal, Plus, Search } from "@tyohnn/icons";

import { AspectRatio } from "@tyohnn/components/aspect-ratio";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@tyohnn/components/button-group";
import { Checkbox } from "@tyohnn/components/checkbox";
import { DirectionProvider } from "@tyohnn/components/direction";
import { Input } from "@tyohnn/components/input";
import { Kbd, KbdGroup } from "@tyohnn/components/kbd";
import { Label } from "@tyohnn/components/label";
import { Separator } from "@tyohnn/components/separator";
import { Skeleton } from "@tyohnn/components/skeleton";
import { Spinner } from "@tyohnn/components/spinner";
import { Toggle } from "@tyohnn/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@tyohnn/components/toggle-group";

import { type CoverageSection, Row } from "./frame";

const BUTTON_VARIANTS = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;
const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;
const BADGE_VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;

export const basicSections: CoverageSection[] = [
    {
        name: "button",
        components: ["button"],
        render: () => (
            <>
                <Row label="Variants">
                    {BUTTON_VARIANTS.map((variant) => <Button key={variant} variant={variant}>Button</Button>)}
                </Row>
                {BUTTON_VARIANTS.map((variant) => (
                    <Row key={variant} label={`Sizes · ${variant}`}>
                        {BUTTON_SIZES.map((size) => (
                            <Button key={size} variant={variant} size={size}><Plus data-icon="inline-start" />Size {size}</Button>
                        ))}
                        {ICON_SIZES.map((size) => (
                            <Button key={size} variant={variant} size={size} aria-label={size}><Search /></Button>
                        ))}
                    </Row>
                ))}
                <Row label="Icon end · disabled · invalid">
                    <Button variant="outline">Next<ChevronRight data-icon="inline-end" /></Button>
                    <Button disabled>Disabled</Button>
                    <Button variant="outline" disabled>Disabled</Button>
                    <Button variant="outline" aria-invalid>Invalid</Button>
                    <Button disabled><Spinner data-icon="inline-start" />Loading</Button>
                </Row>
            </>
        ),
    },
    {
        name: "badge",
        components: ["badge"],
        render: () => (
            <>
                <Row label="Variants">
                    {BADGE_VARIANTS.map((variant) => <Badge key={variant} variant={variant}>Badge</Badge>)}
                </Row>
                <Row label="Icons · link · invalid">
                    {BADGE_VARIANTS.map((variant) => (
                        <Badge key={variant} variant={variant}><Info data-icon="inline-start" />{variant}</Badge>
                    ))}
                    <Badge variant="outline">Verified<ChevronRight data-icon="inline-end" /></Badge>
                    <Badge variant="link" render={<a href="#coverage" />}>Link badge</Badge>
                    <Badge variant="outline" aria-invalid>Invalid</Badge>
                    <Badge variant="secondary"><Spinner data-icon="inline-start" />Syncing</Badge>
                </Row>
            </>
        ),
    },
    {
        name: "kbd-spinner-separator",
        components: ["kbd", "spinner", "separator", "skeleton", "label", "aspect-ratio"],
        render: () => (
            <>
                <Row label="Kbd">
                    <Kbd>⌘</Kbd>
                    <Kbd>Enter</Kbd>
                    <KbdGroup>
                        <Kbd>Ctrl</Kbd>
                        <span>+</span>
                        <Kbd>B</Kbd>
                    </KbdGroup>
                    <Button variant="outline">Search<Kbd>⌘K</Kbd></Button>
                </Row>
                <Row label="Spinner">
                    <Spinner />
                    <Spinner className="size-6" />
                    <Badge><Spinner data-icon="inline-start" />Pending</Badge>
                </Row>
                <Row label="Separator · horizontal · vertical" className="flex flex-col gap-3">
                    <div className="w-80">
                        <div className="text-sm">Section above</div>
                        <Separator className="my-2" />
                        <div className="flex h-5 items-center gap-3 text-sm">
                            <span>Blog</span>
                            <Separator orientation="vertical" />
                            <span>Docs</span>
                            <Separator orientation="vertical" />
                            <span>Source</span>
                        </div>
                    </div>
                </Row>
                <Row label="Skeleton">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex w-60 flex-col gap-2">
                        <Skeleton className="h-4 w-60" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </Row>
                <Row label="Label · with control · disabled">
                    <Label htmlFor="coverage-label-input">Email</Label>
                    <Label>
                        <Checkbox defaultChecked />
                        Accept terms
                    </Label>
                    <div className="group flex items-center gap-2" data-disabled="true">
                        <Checkbox id="coverage-label-disabled" disabled />
                        <Label htmlFor="coverage-label-disabled">Disabled</Label>
                    </div>
                    <Input id="coverage-label-input" className="w-48" placeholder="name@example.com" />
                </Row>
                <Row label="Aspect ratio 16 / 9">
                    <div className="w-72">
                        <AspectRatio ratio={16 / 9} className="rounded-lg bg-muted" />
                    </div>
                </Row>
            </>
        ),
    },
    {
        name: "toggle",
        components: ["toggle", "toggle-group"],
        render: () => (
            <>
                {(["default", "outline"] as const).map((variant) => (
                    <Row key={variant} label={`Toggle · ${variant}`}>
                        {(["sm", "default", "lg"] as const).map((size) => (
                            <Toggle key={size} variant={variant} size={size} aria-label={size}><Bell />{size}</Toggle>
                        ))}
                        <Toggle variant={variant} defaultPressed aria-label="pressed"><Bell />Pressed</Toggle>
                        <Toggle variant={variant} disabled aria-label="disabled"><Bell />Disabled</Toggle>
                        <Toggle variant={variant} aria-label="icon"><Bell /></Toggle>
                    </Row>
                ))}
                <Row label="Toggle group · default · outline · sm · lg · spacing 0 · vertical">
                    <ToggleGroup defaultValue={["bold"]} multiple>
                        <ToggleGroupItem value="bold" aria-label="Bold">B</ToggleGroupItem>
                        <ToggleGroupItem value="italic" aria-label="Italic">I</ToggleGroupItem>
                        <ToggleGroupItem value="underline" aria-label="Underline">U</ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup variant="outline" defaultValue={["center"]}>
                        <ToggleGroupItem value="left">Left</ToggleGroupItem>
                        <ToggleGroupItem value="center">Center</ToggleGroupItem>
                        <ToggleGroupItem value="right">Right</ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup variant="outline" size="sm" spacing={0} defaultValue={["week"]}>
                        <ToggleGroupItem value="day">Day</ToggleGroupItem>
                        <ToggleGroupItem value="week">Week</ToggleGroupItem>
                        <ToggleGroupItem value="month">Month</ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup size="lg" defaultValue={["grid"]}>
                        <ToggleGroupItem value="grid" aria-label="Grid"><Search /></ToggleGroupItem>
                        <ToggleGroupItem value="list" aria-label="List"><MoreHorizontal /></ToggleGroupItem>
                        <ToggleGroupItem value="off" aria-label="Disabled" disabled><Bell /></ToggleGroupItem>
                    </ToggleGroup>
                    <ToggleGroup variant="outline" orientation="vertical" spacing={0} defaultValue={["top"]}>
                        <ToggleGroupItem value="top">Top</ToggleGroupItem>
                        <ToggleGroupItem value="middle">Middle</ToggleGroupItem>
                        <ToggleGroupItem value="bottom">Bottom</ToggleGroupItem>
                    </ToggleGroup>
                </Row>
            </>
        ),
    },
    {
        name: "button-group",
        components: ["button-group"],
        render: () => (
            <>
                <Row label="Horizontal · separator · text · input">
                    <ButtonGroup>
                        <Button variant="outline">Archive</Button>
                        <Button variant="outline">Report</Button>
                        <Button variant="outline" size="icon" aria-label="More"><MoreHorizontal /></Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <Button variant="secondary">Copy</Button>
                        <ButtonGroupSeparator />
                        <Button variant="secondary">Paste</Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <ButtonGroupText>https://</ButtonGroupText>
                        <Input className="w-40" placeholder="example.com" />
                        <Button variant="outline" aria-label="Download"><Download /></Button>
                    </ButtonGroup>
                    <ButtonGroup>
                        <ButtonGroup>
                            <Button variant="outline" size="sm">1</Button>
                            <Button variant="outline" size="sm">2</Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button variant="outline" size="icon-sm" aria-label="Previous"><ChevronLeft /></Button>
                            <Button variant="outline" size="icon-sm" aria-label="Next"><ChevronRight /></Button>
                        </ButtonGroup>
                    </ButtonGroup>
                </Row>
                <Row label="Vertical">
                    <ButtonGroup orientation="vertical">
                        <Button variant="outline" size="icon" aria-label="Up"><Plus /></Button>
                        <Button variant="outline" size="icon" aria-label="Down"><ChevronDown /></Button>
                    </ButtonGroup>
                    <ButtonGroup orientation="vertical">
                        <Button variant="outline">Top</Button>
                        <ButtonGroupSeparator orientation="horizontal" />
                        <Button variant="outline">Bottom</Button>
                    </ButtonGroup>
                </Row>
            </>
        ),
    },
    {
        name: "direction",
        components: ["direction"],
        render: () => (
            <DirectionProvider direction="rtl">
                <div dir="rtl" className="flex items-center gap-3">
                    <Button variant="outline"><ChevronLeft data-icon="inline-start" />Back</Button>
                    <Badge><Loader data-icon="inline-start" />Right to left</Badge>
                    <ButtonGroup>
                        <Button variant="outline">One</Button>
                        <Button variant="outline">Two</Button>
                    </ButtonGroup>
                </div>
            </DirectionProvider>
        ),
    },
];
