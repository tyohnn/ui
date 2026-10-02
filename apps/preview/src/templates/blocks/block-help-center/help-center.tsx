import {
    ArrowRight,
    Building,
    CircleCheck,
    Clock,
    CreditCard,
    FileText,
    Headset,
    Mail,
    MessageCircle,
    PieChart,
    Receipt,
    ShieldCheck,
    Users,
} from "@tyohnn/icons";
import type { ComponentType } from "react";

import { ContactOptions } from "@tyohnn/blocks/contact-options";
import { InfoCard } from "@tyohnn/blocks/info-card";
import { LinkItemList } from "@tyohnn/blocks/link-item-list";
import { Page, PageContent } from "@tyohnn/blocks/page";
import { PageAside, PageSplit } from "@tyohnn/blocks/page-split";
import { SearchHero } from "@tyohnn/blocks/search-hero";
import { SectionCard } from "@tyohnn/blocks/section-card";
import { SectionHeading } from "@tyohnn/blocks/section-heading";
import { ServiceStatus } from "@tyohnn/blocks/service-status";
import { TicketList } from "@tyohnn/blocks/ticket-list";
import { TopicCards } from "@tyohnn/blocks/topic-cards";
import { Badge } from "@tyohnn/components/badge";
import { Button } from "@tyohnn/components/button";

import { POPULAR_SEARCHES, RECENT_ARTICLES, SERVICES, TICKETS, TOPICS } from "./data";

/**
 * The body of the help center template: Tallyworks Help's home — search, system status, topic cards, recently
 * updated articles, open tickets and contact options. Fixed data, no time and no randomness. The screen is
 * composed from blocks (registry/blocks); the topics, the articles, the tickets and the words are the help
 * center's own and stay here.
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
    <SearchHero
        status={(
            <Badge variant="outline">
                <CircleCheck data-icon="inline-start" />
                All core systems operational
            </Badge>
        )}
        title="How can we help, Priya?"
        description="Search 176 articles, or ask the support team. Most chats get a reply in under 4 minutes."
        searchLabel="Search the help center"
        placeholder="Search for articles, e.g. recurring invoices"
        shortcut="⌘ K"
        suggestionsLabel="Popular:"
        suggestions={POPULAR_SEARCHES}
    />
);

const Topics = () => (
    <section className="flex flex-col gap-4">
        <SectionHeading
            title="Popular topics"
            description="Guides grouped by what you are trying to do"
            action={<Button variant="ghost" size="sm">All 12 topics<ArrowRight data-icon="inline-end" /></Button>}
        />
        <TopicCards
            topics={TOPICS.map((topic) =>
            {
                const Icon = TOPIC_ICONS[topic.icon];

                return { id: topic.id, icon: <Icon />, title: topic.title, description: topic.description, metaIcon: <FileText />, meta: <>{topic.articles} articles</> };
            })}
        />
    </section>
);

const RecentArticles = () => (
    <SectionCard
        className="min-w-0 flex-1"
        title="Recently updated"
        description="Articles changed in the last two weeks"
        action={<Button variant="outline" size="sm">View all</Button>}
        footerNote="Showing 7 of 38 articles updated since Jan 1"
        footerAction={<Button variant="ghost" size="sm">Subscribe to updates</Button>}
    >
        <LinkItemList
            items={RECENT_ARTICLES.map((article) => ({
                id: article.id,
                href: "#",
                icon: <FileText />,
                title: article.title,
                badge: article.tag ? <Badge variant={article.tag === "New" ? "default" : "secondary"}>{article.tag}</Badge> : null,
                description: <>{article.topic} · {article.minutes} min read · {article.updated}</>,
            }))}
        />
    </SectionCard>
);

const Contact = () => (
    <SectionCard
        title="Still need help?"
        description="Our support team works Monday to Friday, 08:00–20:00 CET."
        footerIcon={<Headset />}
        footerNote="Premium plan: call +44 20 7946 0321"
    >
        <ContactOptions
            options={[
                { id: "chat", icon: <MessageCircle />, title: "Live chat", description: "Typical reply in 4 minutes", action: <Button size="sm">Start chat</Button> },
                { id: "email", icon: <Mail />, title: "Email", description: "Replies within one business day", action: <Button variant="outline" size="sm">Send email</Button> },
            ]}
        />
    </SectionCard>
);

const Tickets = () => (
    <InfoCard title="Your open requests" action={<Badge variant="secondary">2</Badge>}>
        <TicketList
            tickets={TICKETS.map((ticket) => ({
                id: ticket.id,
                title: ticket.title,
                reference: ticket.id,
                status: <Badge variant={ticket.status === "Waiting on you" ? "default" : "outline"}>{ticket.status}</Badge>,
                detailIcon: <Clock />,
                detail: ticket.updated,
            }))}
        />
    </InfoCard>
);

const Status = () => (
    <InfoCard title="System status" action={<Badge variant="outline">Updated 09:40</Badge>}>
        <ServiceStatus services={SERVICES.map((service) => ({ name: service.name, state: service.state === "Operational" ? "ok" : "degraded", label: service.state }))} />
    </InfoCard>
);

// [contain:inline-size]: the body never widens SidebarInset (upstream markup, no min-w-0) past the viewport.
export const HelpCenter = () => (
    <Page gutter="none" gap="none">
        <Hero />
        <PageContent gutter="lg" gap="lg" document>
            <Topics />
            <PageSplit gap="md">
                <RecentArticles />
                <PageAside width="lg" gap="md">
                    <Contact />
                    <Tickets />
                    <Status />
                </PageAside>
            </PageSplit>
        </PageContent>
    </Page>
);
