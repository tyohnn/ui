import type { Strings } from "../names"

/** BCP 47 tag for Intl formatting (chart values, the calendar's month and weekday names) */
export const locale = "en-US"

export const strings = {
  close: "Close",
  loading: "Loading",
  toast: {
    close: "Close toast",
  },
  breadcrumb: {
    label: "breadcrumb",
  },
  pagination: {
    label: "pagination",
    previous: "Previous",
    previousLabel: "Go to previous page",
    next: "Next",
    nextLabel: "Go to next page",
  },
  carousel: {
    role: "carousel",
    slideRole: "slide",
    previous: "Previous slide",
    next: "Next slide",
  },
  calendar: {
    nav: "Navigation bar",
    previous: "Go to the Previous Month",
    next: "Go to the Next Month",
    month: "Choose the Month",
    year: "Choose the Year",
    weekNumber: "Week Number",
    week: (weekNumber: number) => `Week ${weekNumber}`,
  },
  combobox: {
    removeChip: "Remove",
  },
  command: {
    title: "Command Palette",
    search: "Search commands",
  },
  sidebar: {
    toggle: "Toggle Sidebar",
    title: "Sidebar",
  },
  messageScroller: {
    toEnd: "Scroll to end",
    toStart: "Scroll to start",
  },
  table: {
    scrollRegion: "Scrollable table",
  },
  questionnaire: {
    previous: "Previous",
    skip: "Skip",
    next: "Next",
    submit: "Submit",
  },
  blocks: {
    dataTable: {
      selectAll: "Select all rows",
      selectRow: "Select row",
    },
    rowMenu: {
      label: "Row actions",
    },
    search: {
      label: "Search",
      submit: "Search",
    },
    calendar: {
      today: "Today",
      previous: "Previous",
      next: "Next",
      views: "View",
      allDay: "All day",
      now: "Now",
    },
    comments: {
      reply: "Reply",
    },
    diff: {
      collapse: "Collapse file",
      expand: "Expand file",
      viewed: "Viewed",
      label: "Diff",
    },
    kanban: {
      add: "Add card",
    },
    onThisPage: {
      title: "On this page",
    },
    pager: {
      previous: "Previous",
      next: "Next",
    },
    prompt: {
      label: "Message",
      send: "Send",
    },
    reply: {
      label: "Reply",
    },
    parameters: {
      name: "Name",
      type: "Type",
      required: "Required",
      description: "Description",
      requiredBadge: "Required",
      optionalBadge: "Optional",
    },
  },
} satisfies Strings
