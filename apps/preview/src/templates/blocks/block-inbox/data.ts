/**
 * The inbox's fixed data. Fernhill Studio, its clients and people are fictional. The mail list keeps upstream's
 * ten mails (sidebar-09); the first one is open in the reader. Dates are relative to 2026-01-14.
 */

export const MAILS = [
    {
        name: "Priya Das",
        email: "priya@lumenfield.co",
        subject: "Harbor design review",
        date: "09:34 AM",
        teaser: "Attaching the signed-off flows and the spacing notes from Tuesday.\nCan we lock the handoff for Friday at 11?",
    },
    {
        name: "Tomas Lind",
        email: "tomas@fernhill.studio",
        subject: "Re: Sprint 14 capacity",
        date: "Yesterday",
        teaser: "Two of us are out next week, so I moved the onboarding epic.\nThe billing screens still fit if QA starts on Wednesday.",
    },
    {
        name: "Ada Mbeki",
        email: "ada@quarrylane.com",
        subject: "Invoice FS-2291 paid",
        date: "Yesterday",
        teaser: "Thanks — finance approved the December invoice this morning.\nPayment goes out with the run on January 20.",
    },
    {
        name: "Jonah White",
        email: "jonah@fernhill.studio",
        subject: "Re: Icon licensing",
        date: "2 days ago",
        teaser: "The foundry confirmed the extended licence covers app stores.\nI saved the agreement to the Legal folder.",
    },
    {
        name: "Mei Okafor",
        email: "mei@brightwater.org",
        subject: "Workshop agenda",
        date: "2 days ago",
        teaser: "Here is the draft agenda for the accessibility workshop.\nWould you lead the colour contrast session after lunch?",
    },
    {
        name: "Rafael Duarte",
        email: "rafael@fernhill.studio",
        subject: "Staging is back up",
        date: "4 days ago",
        teaser: "The certificate renewal broke staging for about an hour.\nEverything is green again; the post-mortem is in Notes.",
    },
    {
        name: "Hannah Kovac",
        email: "hannah@tidewell.io",
        subject: "Re: Loyalty proposal",
        date: "1 week ago",
        teaser: "The board liked the phased approach and the smaller pilot.\nCould you send a revised estimate for phase one only?",
    },
    {
        name: "Sam Achter",
        email: "samuel@fernhill.studio",
        subject: "Quarterly all-hands",
        date: "1 week ago",
        teaser: "All-hands moves to Thursday the 29th at 3 PM in the big room.\nSend me your team's highlights by the 26th.",
    },
    {
        name: "Leila Haddad",
        email: "leila@northgate-health.com",
        subject: "Study recruits",
        date: "1 week ago",
        teaser: "We found eight participants for the clinic check-in study.\nSessions run Monday and Tuesday, 45 minutes each.",
    },
    {
        name: "Oscar Bren",
        email: "oscar@fernhill.studio",
        subject: "Team dinner",
        date: "1 week ago",
        teaser: "Booked a table for fourteen at the place by the canal.\nReply with dietary needs so I can pass them on.",
    },
];

export const OPEN_MAIL = {
    subject: "Harbor app — final design review",
    labels: ["Client", "Harbor"],
    from: { name: "Priya Das", email: "priya@lumenfield.co", initials: "PD" },
    to: "Nadia Reyes, Tomas Lind",
    cc: "design@fernhill.studio",
    date: "Wed, Jan 14, 2026 · 09:34 AM",
    paragraphs: [
        "Hi Nadia,",
        "Thanks for walking us through the last round on Tuesday. The team went over the check-in and booking flows again yesterday and we are happy to sign them off, with two small changes noted below.",
        "First, the confirmation sheet should keep the booking reference visible when the keyboard is open — our front-desk staff read it out over the phone. Second, the empty state for past visits can drop the illustration; a single line of text and the “Book again” button is enough.",
        "I have attached the annotated flows and the spacing notes Tomas asked for. If the handoff can happen on Friday at 11, our engineers will start the build on Monday and we keep the March launch.",
        "Best,\nPriya",
    ],
    attachments: [
        { name: "harbor-flows-v7.pdf", meta: "PDF · 4.2 MB" },
        { name: "spacing-notes.fig", meta: "Figure file · 860 KB" },
    ],
};

export const EARLIER_THREAD = [
    { name: "Nadia Reyes", initials: "NR", date: "Jan 12", teaser: "Sharing the revised booking flow before Tuesday — the date picker now opens on the next free slot." },
    { name: "Priya Das", initials: "PD", date: "Jan 9", teaser: "Can we see one more pass on check-in? Staff found the QR step easy to miss." },
];
