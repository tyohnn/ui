import { ChartLine, ChevronDown, CircleCheck, Download, Info, LayoutGrid, MoreHorizontal, Plus, TriangleAlert, Users } from "@tyohnn/icons";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@tyohnn/components/accordion";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@tyohnn/components/alert";
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@tyohnn/components/avatar";
import { Badge } from "@tyohnn/components/badge";
import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@tyohnn/components/breadcrumb";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@tyohnn/components/collapsible";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@tyohnn/components/empty";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemFooter,
    ItemGroup,
    ItemHeader,
    ItemMedia,
    ItemSeparator,
    ItemTitle,
} from "@tyohnn/components/item";
import { Marker, MarkerContent, MarkerIcon } from "@tyohnn/components/marker";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@tyohnn/components/pagination";
import { ScrollArea, ScrollBar } from "@tyohnn/components/scroll-area";
import { Separator } from "@tyohnn/components/separator";
import { Spinner } from "@tyohnn/components/spinner";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@tyohnn/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@tyohnn/components/tabs";

import { type CoverageSection, Row } from "./frame";

/** A 1×1 transparent GIF: an image that loads without the network, so AvatarImage renders in both apps. */
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const INVOICES = [
    { invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
    { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
    { invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
];

const TAGS = Array.from({ length: 20 }, (_, index) => `v1.2.0-beta.${20 - index}`);

export const displaySections: CoverageSection[] = [
    {
        name: "alert",
        components: ["alert"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 gap-4">
                <Alert>
                    <CircleCheck />
                    <AlertTitle>Success! Your changes have been saved</AlertTitle>
                    <AlertDescription>This is an alert with icon, title and description.</AlertDescription>
                </Alert>
                <Alert variant="destructive">
                    <TriangleAlert />
                    <AlertTitle>Unable to process your payment.</AlertTitle>
                    <AlertDescription>
                        <p>Please verify your billing information and try again.</p>
                        <ul className="list-inside list-disc text-sm">
                            <li>Check your card details</li>
                            <li>Ensure sufficient funds</li>
                        </ul>
                    </AlertDescription>
                </Alert>
                <Alert>
                    <Info />
                    <AlertTitle>Title only alert with an icon</AlertTitle>
                </Alert>
                <Alert>
                    <AlertTitle>With action</AlertTitle>
                    <AlertDescription>Alert description next to an action.</AlertDescription>
                    <AlertAction><Button size="xs" variant="outline">Undo</Button></AlertAction>
                </Alert>
            </div>
        ),
    },
    {
        name: "avatar",
        components: ["avatar"],
        render: () => (
            <>
                <Row label="Sizes · image · fallback · badge">
                    {(["sm", "default", "lg"] as const).map((size) => (
                        <Avatar key={size} size={size}>
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                    ))}
                    {(["sm", "default", "lg"] as const).map((size) => (
                        <Avatar key={`image-${size}`} size={size}>
                            <AvatarImage src={PIXEL} alt="Pixel" />
                            <AvatarFallback>PX</AvatarFallback>
                        </Avatar>
                    ))}
                    {(["sm", "default", "lg"] as const).map((size) => (
                        <Avatar key={`badge-${size}`} size={size}>
                            <AvatarFallback>ER</AvatarFallback>
                            <AvatarBadge><Plus /></AvatarBadge>
                        </Avatar>
                    ))}
                </Row>
                <Row label="Group · count">
                    <AvatarGroup>
                        <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
                        <Avatar><AvatarFallback>CD</AvatarFallback></Avatar>
                        <Avatar><AvatarFallback>EF</AvatarFallback></Avatar>
                        <AvatarGroupCount>+3</AvatarGroupCount>
                    </AvatarGroup>
                    <AvatarGroup>
                        <Avatar size="sm"><AvatarFallback>AB</AvatarFallback></Avatar>
                        <Avatar size="sm"><AvatarFallback>CD</AvatarFallback></Avatar>
                        <AvatarGroupCount><Users /></AvatarGroupCount>
                    </AvatarGroup>
                    <AvatarGroup>
                        <Avatar size="lg"><AvatarFallback>AB</AvatarFallback></Avatar>
                        <Avatar size="lg"><AvatarFallback>CD</AvatarFallback></Avatar>
                        <AvatarGroupCount>+9</AvatarGroupCount>
                    </AvatarGroup>
                </Row>
            </>
        ),
    },
    {
        name: "card",
        components: ["card"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 items-start gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>Enter your email below to login to your account</CardDescription>
                        <CardAction><Button variant="link">Sign Up</Button></CardAction>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">The card content holds the form.</p>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button className="w-full">Login</Button>
                        <Button variant="outline" className="w-full">Login with Google</Button>
                    </CardFooter>
                </Card>
                <Card size="sm">
                    <CardHeader>
                        <CardTitle>Small card</CardTitle>
                        <CardDescription>size sm tightens the spacing.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">Content of the small card.</p>
                    </CardContent>
                    <CardFooter>
                        <Button size="sm" variant="outline">Action</Button>
                    </CardFooter>
                </Card>
                <Card className="pt-0">
                    <div className="aspect-video w-full bg-muted" />
                    <CardHeader>
                        <CardTitle>Media card</CardTitle>
                        <CardDescription>Image first, then header.</CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardContent>
                        <p className="text-sm">Content only.</p>
                    </CardContent>
                </Card>
            </div>
        ),
    },
    {
        name: "empty",
        components: ["empty"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 gap-6">
                <Empty className="border border-dashed">
                    <EmptyHeader>
                        <EmptyMedia variant="icon"><LayoutGrid /></EmptyMedia>
                        <EmptyTitle>No projects yet</EmptyTitle>
                        <EmptyDescription>
                            You have not created any projects yet. <a href="#coverage">Learn more</a>
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <div className="flex gap-2">
                            <Button>Create project</Button>
                            <Button variant="outline">Import project</Button>
                        </div>
                    </EmptyContent>
                </Empty>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia><Spinner className="size-6" /></EmptyMedia>
                        <EmptyTitle>Default media</EmptyTitle>
                        <EmptyDescription>Media without the icon variant.</EmptyDescription>
                    </EmptyHeader>
                </Empty>
            </div>
        ),
    },
    {
        name: "item",
        components: ["item"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 items-start gap-6">
                <div className="flex flex-col gap-3">
                    {(["default", "outline", "muted"] as const).map((variant) => (
                        <Item key={variant} variant={variant}>
                            <ItemMedia variant="icon"><Info /></ItemMedia>
                            <ItemContent>
                                <ItemTitle>Variant {variant}</ItemTitle>
                                <ItemDescription>A simple item with title and description.</ItemDescription>
                            </ItemContent>
                            <ItemActions><Button size="sm" variant="outline">Action</Button></ItemActions>
                        </Item>
                    ))}
                    {(["sm", "xs"] as const).map((size) => (
                        <Item key={size} variant="outline" size={size}>
                            <ItemMedia><CircleCheck /></ItemMedia>
                            <ItemContent><ItemTitle>Size {size}</ItemTitle></ItemContent>
                            <ItemActions><ChevronDown /></ItemActions>
                        </Item>
                    ))}
                    <Item variant="outline" render={<a href="#coverage" />}>
                        <ItemContent><ItemTitle>Link item</ItemTitle></ItemContent>
                    </Item>
                </div>
                <div className="flex flex-col gap-3">
                    <ItemGroup>
                        {["shadcn", "maxleiter"].map((name, index) => (
                            <div key={name}>
                                {index > 0 && <ItemSeparator />}
                                <Item>
                                    <ItemMedia variant="image">
                                        <Avatar><AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                                    </ItemMedia>
                                    <ItemContent>
                                        <ItemTitle>{name}</ItemTitle>
                                        <ItemDescription>{name}@example.com</ItemDescription>
                                    </ItemContent>
                                    <ItemActions>
                                        <Button variant="ghost" size="icon-sm" aria-label="More"><MoreHorizontal /></Button>
                                    </ItemActions>
                                </Item>
                            </div>
                        ))}
                    </ItemGroup>
                    <Item variant="outline">
                        <ItemHeader>
                            <span className="text-sm">Header</span>
                            <Badge variant="secondary">New</Badge>
                        </ItemHeader>
                        <ItemContent>
                            <ItemTitle>With header and footer</ItemTitle>
                            <ItemDescription>Header and footer take the full row.</ItemDescription>
                        </ItemContent>
                        <ItemFooter>
                            <span className="text-xs">Footer</span>
                            <Download className="size-4" />
                        </ItemFooter>
                    </Item>
                </div>
            </div>
        ),
    },
    {
        name: "marker",
        components: ["marker"],
        render: () => (
            <div className="flex w-[600px] flex-col gap-6">
                <Marker>
                    <MarkerContent>A default marker</MarkerContent>
                </Marker>
                <Marker>
                    <MarkerIcon><ChartLine /></MarkerIcon>
                    <MarkerContent>Marker with icon</MarkerContent>
                </Marker>
                <Marker role="status">
                    <MarkerIcon><Spinner /></MarkerIcon>
                    <MarkerContent>Marker with a spinner</MarkerContent>
                </Marker>
                <Marker variant="separator">
                    <MarkerContent>Separator marker</MarkerContent>
                </Marker>
                <Marker variant="border">
                    <MarkerIcon><Info /></MarkerIcon>
                    <MarkerContent>Border marker</MarkerContent>
                </Marker>
            </div>
        ),
    },
    {
        name: "table",
        components: ["table"],
        render: () => (
            <div className="w-[800px]">
                <Table>
                    <TableCaption>A list of your recent invoices.</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {INVOICES.map((row, index) => (
                            <TableRow key={row.invoice} data-state={index === 1 ? "selected" : undefined}>
                                <TableCell className="font-medium">{row.invoice}</TableCell>
                                <TableCell>{row.status}</TableCell>
                                <TableCell>{row.method}</TableCell>
                                <TableCell className="text-right">{row.amount}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3}>Total</TableCell>
                            <TableCell className="text-right">$750.00</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        ),
    },
    {
        name: "scroll-area",
        components: ["scroll-area"],
        render: () => (
            <Row label="Vertical · horizontal" className="flex items-start gap-8">
                <ScrollArea className="h-48 w-48 rounded-md border">
                    <div className="p-4">
                        <h4 className="mb-4 text-sm leading-none font-medium">Tags</h4>
                        {TAGS.map((tag) => (
                            <div key={tag}>
                                <div className="text-sm">{tag}</div>
                                <Separator className="my-2" />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <ScrollArea className="w-96 rounded-md border whitespace-nowrap">
                    <div className="flex w-max gap-4 p-4">
                        {TAGS.slice(0, 8).map((tag) => (
                            <div key={tag} className="h-24 w-32 rounded-md bg-muted p-2 text-xs">{tag}</div>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </Row>
        ),
    },
    {
        name: "accordion",
        components: ["accordion"],
        render: () => (
            <div className="w-[484px]">
                <Accordion defaultValue={["shipping"]}>
                    <AccordionItem value="shipping">
                        <AccordionTrigger>What are your shipping options?</AccordionTrigger>
                        <AccordionContent>We offer standard (5-7 days), express (2-3 days) and overnight shipping.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="returns">
                        <AccordionTrigger>What is your return policy?</AccordionTrigger>
                        <AccordionContent>Returns are accepted within 30 days.</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="disabled" disabled>
                        <AccordionTrigger>Disabled item</AccordionTrigger>
                        <AccordionContent>Hidden.</AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        ),
    },
    {
        name: "collapsible",
        components: ["collapsible"],
        render: () => (
            <div className="flex w-[484px] flex-col gap-4">
                <Collapsible defaultOpen className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-semibold">Order #4189</h4>
                        <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Toggle" />}>
                            <ChevronDown />
                        </CollapsibleTrigger>
                    </div>
                    <div className="rounded-md border px-4 py-2 text-sm">Status: Shipped</div>
                    <CollapsibleContent className="flex flex-col gap-2">
                        <div className="rounded-md border px-4 py-2 text-sm">Shipping address: 100 Main St</div>
                        <div className="rounded-md border px-4 py-2 text-sm">Items: 2x Studio Headphones</div>
                    </CollapsibleContent>
                </Collapsible>
                <Collapsible>
                    <CollapsibleTrigger render={<Button variant="outline" />}>Closed collapsible</CollapsibleTrigger>
                    <CollapsibleContent>Hidden content</CollapsibleContent>
                </Collapsible>
            </div>
        ),
    },
    {
        name: "tabs",
        components: ["tabs"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 items-start gap-8">
                <Tabs defaultValue="overview">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview"><p className="text-sm">Overview panel.</p></TabsContent>
                </Tabs>
                <Tabs defaultValue="analytics">
                    <TabsList variant="line">
                        <TabsTrigger value="overview"><LayoutGrid />Overview</TabsTrigger>
                        <TabsTrigger value="analytics"><ChartLine />Analytics</TabsTrigger>
                        <TabsTrigger value="reports" disabled>Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="analytics"><p className="text-sm">Analytics panel.</p></TabsContent>
                </Tabs>
                <Tabs defaultValue="account" orientation="vertical">
                    <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account"><p className="text-sm">Vertical tabs.</p></TabsContent>
                </Tabs>
                <Tabs defaultValue="password" orientation="vertical">
                    <TabsList variant="line">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="password"><p className="text-sm">Vertical line tabs.</p></TabsContent>
                </Tabs>
            </div>
        ),
    },
    {
        name: "breadcrumb",
        components: ["breadcrumb"],
        render: () => (
            <Row label="Breadcrumb">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem><BreadcrumbLink href="#coverage">Home</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem><BreadcrumbLink href="#coverage">Components</BreadcrumbLink></BreadcrumbItem>
                        <BreadcrumbSeparator>/</BreadcrumbSeparator>
                        <BreadcrumbItem><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </Row>
        ),
    },
    {
        name: "pagination",
        components: ["pagination"],
        render: () => (
            <Row label="Pagination">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem><PaginationPrevious href="#coverage" /></PaginationItem>
                        <PaginationItem><PaginationLink href="#coverage">1</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationLink href="#coverage" isActive>2</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationLink href="#coverage">3</PaginationLink></PaginationItem>
                        <PaginationItem><PaginationEllipsis /></PaginationItem>
                        <PaginationItem><PaginationNext href="#coverage" /></PaginationItem>
                    </PaginationContent>
                </Pagination>
            </Row>
        ),
    },
];
