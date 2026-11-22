"use client"

import * as React from "react"
import {
  createToaster as createToasterPrimitive,
  Toast as ToastPrimitive,
  ToastAction as ToastActionPrimitive,
  ToastClose as ToastClosePrimitive,
  ToastDescription as ToastDescriptionPrimitive,
  ToastRegion as ToastRegionPrimitive,
  ToastTitle as ToastTitlePrimitive,
  type ToastData,
  type Toaster as ToasterQueue,
  type ToastOptions,
  type ToastRegionProps,
} from "@ui-sdk/react/toast"
import { cn } from "cn"

import { Button } from "@acme/ui/components/button"
import { CircleCheck, Info, Loader, OctagonX, TriangleAlert, X } from "@acme/ui/icons"
import { slot } from "@acme/ui/lib/slot"
import { strings } from "@acme/ui/strings"

type ToastContentNode = React.ReactNode

/**
 * Base UI 의 toast.add 가 받던 모양이다. 호출부가 그대로 컴파일되도록 받고 UI SDK 의 옵션으로 옮긴다.
 * timeout 0 은 닫히지 않는 토스트이고, actionProps.children 이 행동 단추의 글자다.
 */
type ToastAddOptions = Omit<ToastOptions<ToastContentNode>, "priority"> & {
  timeout?: number
  priority?: "low" | "high" | "polite" | "assertive"
  actionProps?: {
    children?: ToastContentNode
    onClick?: (event: Event | undefined) => unknown
  }
  onClose?: () => void
}

type ToastManager = ToasterQueue<ToastContentNode> & {
  /** Base UI 의 이름이다. 토스트 하나를 더하고 그 id 를 돌려준다 */
  add: (options: ToastAddOptions) => string
  /** Base UI 의 이름이다. id 가 없으면 모두 닫는다(UI SDK 의 dismiss) */
  close: (id?: string) => void
  update: (id: string, options: ToastContentNode | ToastAddOptions) => boolean
}

const isOptions = (value: unknown): value is ToastAddOptions =>
  typeof value === "object" && value !== null && !React.isValidElement(value) && !Array.isArray(value)

function fromBase({ timeout, priority, actionProps, onClose, onDismiss, ...options }: ToastAddOptions): ToastOptions<ToastContentNode> {
  return {
    ...options,
    ...(timeout !== undefined && { duration: timeout === 0 ? Infinity : timeout }),
    ...(priority && { priority: priority === "high" || priority === "assertive" ? "assertive" : "polite" }),
    ...(actionProps && {
      action: { label: actionProps.children, onAction: actionProps.onClick },
    }),
    ...((onClose || onDismiss) && {
      onDismiss: (details) => {
        onDismiss?.(details)
        onClose?.()
      },
    }),
  }
}

/** UI SDK 의 토스트 줄에 Base UI 의 이름(add · close)을 더한다. 줄은 여기서 만든 것이라 바꿔도 남의 것을 건드리지 않는다 */
function createToastManager(options?: Parameters<typeof createToasterPrimitive>[0]): ToastManager {
  const queue = createToasterPrimitive<ToastContentNode>(options)
  const update = queue.update

  return Object.assign(queue, {
    add: (toastOptions: ToastAddOptions) => queue(fromBase(toastOptions)),
    close: (id?: string) => queue.dismiss(id),
    update: (id: string, toastOptions: ToastContentNode | ToastAddOptions) =>
      update(id, isOptions(toastOptions) ? fromBase(toastOptions) : toastOptions),
  })
}

const toast = createToastManager()

const ToastManagerContext = React.createContext<ToastManager>(toast)

function ToastProvider({
  toastManager = toast,
  children,
}: {
  toastManager?: ToastManager
  children?: React.ReactNode
}) {
  return (
    <ToastManagerContext.Provider value={toastManager}>
      {children}
    </ToastManagerContext.Provider>
  )
}

/** Base UI 와 같은 모양으로 지금의 토스트와 다루는 함수를 돌려준다 */
function useToastManager() {
  const manager = React.useContext(ToastManagerContext)
  const toasts = React.useSyncExternalStore(manager.subscribe, manager.toasts, manager.toasts)

  return {
    toasts,
    add: manager.add,
    close: manager.close,
    update: manager.update,
    promise: manager.promise,
  }
}

/** UI SDK 의 토스트 영역은 스스로 맨 위 층(popover)에 뜬다. Base UI 시절의 조합이 그대로 그려지도록 이름만 남긴다 */
function ToastPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

/**
 * UI SDK 의 영역이다. data-slot 은 UI SDK 의 이름(toast-region)을 그대로 둔다. UI SDK 가 그 이름으로 popover 의
 * 기본 모양을 지우고 자리를 잡는다. Base UI 의 뷰포트(toast-viewport)와 같은 자리에 같은 모양으로 선다.
 */
function ToastViewport({ className, toaster, ...props }: ToastRegionProps) {
  const manager = React.useContext(ToastManagerContext)

  return (
    <ToastRegionPrimitive
      toaster={toaster ?? manager}
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className
      )}
      {...props}
    />
  )
}

function Toast({ className, render, ...props }: React.ComponentProps<typeof ToastPrimitive>) {
  return (
    <ToastPrimitive
      render={slot("toast", render, "li")}
      className={cn(
        "cn-toast group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom border bg-popover text-popover-foreground shadow-lg will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-front-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset,0px)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-y,0px))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-x,0px))_translateY(calc(var(--toast-swipe-y,0px)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-x,0px))_translateY(var(--offset-y))]",
        "data-starting-style:[transform:translateY(150%)]",
        "[&[data-ending-style]:not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-y,0px)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-x,0px)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-x,0px)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-y,0px)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-y,0px)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-x,0px)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-x,0px)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-y,0px)-150%))]",
        className
      )}
      {...props}
    />
  )
}

/** Base UI 의 Content 부분이다. UI SDK 에는 없는 겹이라 div 로 둔다. 뒤에 깔린 토스트(맨 앞이 아니고 펼치지 않은 때)의 내용은 숨긴다 */
function ToastContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toast-content"
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] [[data-slot=toast]:not([data-front],[data-expanded])>&]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function ToastTitle({ className, render, ...props }: React.ComponentProps<typeof ToastTitlePrimitive>) {
  return (
    <ToastTitlePrimitive
      render={slot("toast-title", render)}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  )
}

function ToastDescription({
  className,
  render,
  ...props
}: React.ComponentProps<typeof ToastDescriptionPrimitive>) {
  return (
    <ToastDescriptionPrimitive
      render={slot("toast-description", render)}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function ToastAction({
  className,
  render = <Button variant="outline" size="sm" />,
  ...props
}: React.ComponentProps<typeof ToastActionPrimitive>) {
  return (
    <ToastActionPrimitive
      render={slot("toast-action", render, "button")}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: React.ComponentProps<typeof ToastClosePrimitive>) {
  return (
    <ToastClosePrimitive
      aria-label={strings.toast.close}
      render={slot("toast-close", render, "button")}
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className
      )}
      {...props}
    >
      {children ?? (
        <X aria-hidden="true" />
      )}
    </ToastClosePrimitive>
  )
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null

  if (type === "success") {
    icon = (
      <CircleCheck aria-hidden="true" />
    )
  }

  if (type === "info") {
    icon = (
      <Info aria-hidden="true" />
    )
  }

  if (type === "warning") {
    icon = (
      <TriangleAlert aria-hidden="true" />
    )
  }

  if (type === "error") {
    icon = (
      <OctagonX className="text-destructive" aria-hidden="true" />
    )
  }

  if (type === "loading") {
    icon = (
      <Loader className="animate-spin" aria-hidden="true" />
    )
  }

  if (!icon) {
    return null
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  )
}

function renderToast(toastItem: ToastData<ToastContentNode>) {
  return (
    <Toast>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  )
}

function Toaster({
  children,
  toastManager = toast,
  limit,
  ...props
}: Omit<ToastRegionProps, "children" | "toaster"> & {
  children?: React.ReactNode
  toastManager?: ToastManager
  /** Base UI 의 이름이다. 한 번에 보이는 토스트 수(UI SDK 의 maxVisible) */
  limit?: number
}) {
  return (
    <ToastProvider toastManager={toastManager}>
      {children}
      <ToastViewport maxVisible={limit} {...props}>
        {renderToast}
      </ToastViewport>
    </ToastProvider>
  )
}

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
  type ToastManager,
}
