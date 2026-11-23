import type * as React from "react"
import { Button as ButtonPrimitive } from "@ui-sdk/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

import { slotElement } from "@tyohnn/lib/slot"

const buttonVariants = cva(
  "cn-button group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "cn-button-variant-default",
        outline: "cn-button-variant-outline",
        secondary: "cn-button-variant-secondary",
        ghost: "cn-button-variant-ghost",
        destructive: "cn-button-variant-destructive",
        link: "cn-button-variant-link",
      },
      size: {
        default: "cn-button-size-default",
        xs: "cn-button-size-xs",
        sm: "cn-button-size-sm",
        lg: "cn-button-size-lg",
        icon: "cn-button-size-icon",
        "icon-xs": "cn-button-size-icon-xs",
        "icon-sm": "cn-button-size-icon-sm",
        "icon-lg": "cn-button-size-icon-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = Omit<React.ComponentProps<typeof ButtonPrimitive>, "onClick"> &
  VariantProps<typeof buttonVariants> & {
    /**
     * 누르면 부른다. Promise 를 돌려주면 끝날 때까지 단추가 기다리는 상태가 된다(aria-busy, data-pending).
     * 받는 이벤트의 요소는 render 가 그린 요소다(링크면 a).
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => unknown
    /** UI SDK 는 그린 요소를 보고 단추인지 스스로 안다. Base UI 시절의 호출부가 그대로 컴파일되도록 받기만 한다 */
    nativeButton?: boolean
    "data-slot"?: string
  }

function Button({
  className,
  variant = "default",
  size = "default",
  onClick,
  nativeButton: _nativeButton,
  render,
  "data-slot": dataSlot = "button",
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={onClick as React.ComponentProps<typeof ButtonPrimitive>["onClick"]}
      // 서버 컴포넌트에서도 그리도록 함수가 아닌 요소로 넘긴다(buttonVariants 를 서버에서 쓰게 이 파일은 "use client" 가 아니다)
      render={slotElement(dataSlot, render, "button")}
      {...props}
    />
  )
}

export { Button, buttonVariants }
