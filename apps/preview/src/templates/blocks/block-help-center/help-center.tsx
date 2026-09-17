import {
    ArrowRight,
    Building,
    ChevronRight,
    CircleCheck,
    Clock,
    CreditCard,
    FileText,
    Headset,
    Mail,
    MessageCircle,
    PieChart,
    Receipt,
    Search,
    ShieldCheck,
    TriangleAlert,
    Users,
} from "@tyohnn/icons";
import type { ComponentType } from "react";

import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@tyohnn/components/card";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@tyohnn/components/input-group";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@tyohnn/components/item";
import { Kbd } from "@tyohnn/components/kbd";
import { Separator } from "@tyohnn/components/separator";

import { POPULAR_SEARCHES, RECENT_ARTICLES, SERVICES, TICKETS, TOPICS } from "./data";

/**
 * The body of the help center template: Tallyworks Help's home — search, system status, topic cards, recently
 * updated articles, open tickets and contact options. Fixed data, no time and no randomness. Layout utilities only;
 * the hero band, small text and status dots read tokens in HELP_CENTER_STYLE.
 */

const TOPIC_ICONS: Record<(typeof TOPICS)[number]["icon"], ComponentType> = {
    receipt: Receipt,
    card: CreditCard,
    bank: Building,
    reports: PieChart,
    users: Users,
    shield: ShieldCheck,
};

const Hero = () => (
    <section className="hlp-hero flex flex-col items-center gap-4 px-6 py-10">
        <Badge variant="outline">
            <CircleCheck data-icon="inline-start" />
            All core systems operational
        </Badge>
        <h1 className="hlp-title">How can we help, Priya?</h1>
        <p className="hlp-muted">Search 176 articles, or ask the support team. Most chats get a reply in under 4 minutes.</p>
        <InputGroup className="hlp-search h-12 w-full">
            <InputGroupAddon>
                <Search />
            </InputGroupAddon>
            <InputGroupInput aria-label="Search the help center" placeholder="Search for articles, e.g. recurring invoices" />
            <InputGroupAddon align="inline-end">
                <InputGroupText><Kbd>⌘ K</Kbd></InputGroupText>
                <InputGroupButton variant="default" size="sm">Search</InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
        <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="hlp-small">Popular:</span>
            {POPULAR_SEARCHES.map((term) => <Badge key={term} variant="outline">{term}</Badge>)}
        </div>
    </section>
);

const Topics = () => (
    <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="flex flex-col gap-1">
                <h2 className="hlp-h2">Popular topics</h2>
                <p className="hlp-muted">Guides grouped by what you are trying to do</p>
            </div>
            <Button variant="ghost" size="sm">All 12 topics<ArrowRight data-icon="inline-end" /></Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {TOPICS.map((topic) => {
                const Icon = TOPIC_ICONS[topic.icon];

                return (
                    <Card key={topic.id} size="sm">
                        <CardHeader>
                            <div className="hlp-topic-icon mb-2 flex size-9 items-center justify-center"><Icon /></div>
                            <CardTitle>{topic.title}</CardTitle>
                            <CardDescription>{topic.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="justify-between gap-2">
                            <span className="hlp-small flex items-center gap-1.5"><FileText />{topic.articles} articles</span>
                            <ChevronRight className="hlp-chevron" />
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    </section>
);

const RecentArticles = () => (
    <Card className="min-w-0">
        <CardHeader>
            <CardTitle>Recently updated</CardTitle>
            <CardDescription>Articles changed in the last two weeks</CardDescription>
            <CardAction>
                <Button variant="outline" size="sm">View all</Button>
            </CardAction>
        </CardHeader>
        <CardContent>
            <ItemGroup className="gap-2">
                {RECENT_ARTICLES.map((article) => (
                    <Item key={article.id} size="sm" variant="outline" render={<a href="#" />}>
                        <ItemMedia variant="icon"><FileText /></ItemMedia>
                        <ItemContent>
                            <ItemTitle>
                                {article.title}
                                {article.tag ? <Badge variant={article.tag === "New" ? "default" : "secondary"}>{article.tag}</Badge> : null}
                            </ItemTitle>
                            <ItemDescription>{article.topic} · {article.minutes} min read · {article.updated}</ItemDescription>
                        </ItemContent>
                        <ItemActions><ChevronRight className="hlp-chevron" /></ItemActions>
                    </Item>
                ))}
            </ItemGroup>
        </CardContent>
        <CardFooter className="mt-auto justify-between gap-2">
            <span className="hlp-small">Showing 7 of 38 articles updated since Jan 1</span>
            <Button variant="ghost" size="sm">Subscribe to updates</Button>
        </CardFooter>
    </Card>
);

const Contact = () => (
    <Card>
        <CardHeader>
            <CardTitle>Still need help?</CardTitle>
            <CardDescription>Our support team works Monday to Friday, 08:00–20:00 CET.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
            <Item variant="outline" size="sm">
                <ItemMedia variant="icon"><MessageCircle /></ItemMedia>
                <ItemContent>
                    <ItemTitle>Live chat</ItemTitle>
                    <ItemDescription>Typical reply in 4 minutes</ItemDescription>
                </ItemContent>
                <ItemActions><Button size="sm">Start chat</Button></ItemActions>
            </Item>
            <Item variant="outline" size="sm">
                <ItemMedia variant="icon"><Mail /></ItemMedia>
                <ItemContent>
                    <ItemTitle>Email</ItemTitle>
                    <ItemDescription>Replies within one business day</ItemDescription>
                </ItemContent>
                <ItemActions><Button variant="outline" size="sm">Send email</Button></ItemActions>
            </Item>
        </CardContent>
        <CardFooter className="gap-2">
            <Headset className="hlp-footer-icon" />
            <span className="hlp-small">Premium plan: call +44 20 7946 0321</span>
        </CardFooter>
    </Card>
);

const Tickets = () => (
    <Card size="sm">
        <CardHeader>
            <CardTitle>Your open requests</CardTitle>
            <CardAction><Badge variant="secondary">2</Badge></CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
            {TICKETS.map((ticket, index) => (
                <div key={ticket.id} className="flex flex-col gap-3">
                    {index > 0 ? <Separator /> : null}
                    <div className="flex flex-col gap-1">
                        <span className="hlp-ticket-title">{ticket.title}</span>
                        <span className="hlp-small flex flex-wrap items-center gap-x-2 gap-y-1">
                            {ticket.id}
                            <Badge variant={ticket.status === "Waiting on you" ? "default" : "outline"}>{ticket.status}</Badge>
                            <span className="flex items-center gap-1"><Clock />{ticket.updated}</span>
                        </span>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const Status = () => (
    <Card size="sm">
        <CardHeader>
            <CardTitle>System status</CardTitle>
            <CardAction><Badge variant="outline">Updated 09:40</Badge></CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
            {SERVICES.map((service) => (
                <div key={service.name} className="flex items-center justify-between gap-2">
                    <span className="hlp-service">{service.name}</span>
                    <span className="hlp-small flex items-center gap-1.5" data-state={service.state === "Operational" ? "ok" : "degraded"}>
                        {service.state === "Operational" ? <CircleCheck /> : <TriangleAlert />}
                        {service.state}
                    </span>
                </div>
            ))}
        </CardContent>
    </Card>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const HelpCenter = () => (
    <div className="h-[calc(100svh-4rem)] min-h-0 overflow-y-auto [contain:inline-size]">
        <Hero />
        <div className="flex flex-col gap-8 px-8 pt-8 pb-12">
            <Topics />
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
                <RecentArticles />
                <div className="flex min-w-0 flex-col gap-6">
                    <Contact />
                    <Tickets />
                    <Status />
                </div>
            </div>
        </div>
    </div>
);

/** The template's own stylesheet, tokens only: the hero band, headings, small text, topic icon tiles and status tones. */
export const HELP_CENTER_STYLE = `
[data-template="block-help-center"] .hlp-hero { border-bottom: 1px solid var(--border); background-color: var(--muted); text-align: center; }
[data-template="block-help-center"] .hlp-title { margin: 0; font-family: var(--font-heading); font-size: calc(var(--ui-text-lg) * 1.75); line-height: 1.2; font-weight: 600; }
[data-template="block-help-center"] .hlp-search { max-width: 40rem; background-color: var(--background); }
[data-template="block-help-center"] .hlp-h2 { margin: 0; font-size: var(--ui-text-lg); line-height: var(--ui-line-height-lg); font-weight: 600; }
[data-template="block-help-center"] .hlp-muted { margin: 0; font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); color: var(--muted-foreground); }
[data-template="block-help-center"] .hlp-small { font-size: var(--ui-text-sm); line-height: var(--ui-line-height-sm); color: var(--muted-foreground); }
[data-template="block-help-center"] .hlp-small svg { width: 14px; height: 14px; flex-shrink: 0; }
[data-template="block-help-center"] .hlp-chevron { width: 16px; height: 16px; flex-shrink: 0; color: var(--muted-foreground); }
[data-template="block-help-center"] .hlp-footer-icon { width: 16px; height: 16px; flex-shrink: 0; color: var(--muted-foreground); }
[data-template="block-help-center"] .hlp-topic-icon { border: 1px solid var(--border); border-radius: var(--radius-lg); background-color: var(--muted); color: var(--foreground); }
[data-template="block-help-center"] .hlp-topic-icon svg { width: 18px; height: 18px; }
[data-template="block-help-center"] .hlp-ticket-title,
[data-template="block-help-center"] .hlp-service { font-size: var(--ui-text-md); line-height: var(--ui-line-height-md); font-weight: 500; }
[data-template="block-help-center"] [data-state="degraded"] { color: var(--destructive); }
`;
