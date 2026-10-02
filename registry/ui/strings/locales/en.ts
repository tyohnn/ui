import { enUS } from "react-day-picker/locale"

import type { Strings } from "../names"

/** BCP 47 tag for Intl formatting (chart values, calendar months) */
export const locale = "en-US"

/** react-day-picker's locale: month and weekday names and the calendar's own labels */
export const dateLocale = enUS

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
  combobox: {
    removeChip: "Remove",
  },
  command: {
    title: "Command Palette",
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
} satisfies Strings
