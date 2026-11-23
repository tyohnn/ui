"use client"

import * as React from "react"
import { cn } from "cn"
import {
  OTPInput as OTPInputPrimitive,
  OTPInputGroup as OTPInputGroupPrimitive,
  OTPInputSeparator as OTPInputSeparatorPrimitive,
  OTPInputSlot as OTPInputSlotPrimitive,
  type OTPInputPattern,
} from "@ui-sdk/react/otp-input"

import { Minus } from "@acme/ui/icons"
import { slot } from "@acme/ui/lib/slot"

/**
 * input-otp 판의 props 를 그대로 받는다. onChange 는 값만 받고, pattern 은 정규식 문자열(REGEXP_ONLY_DIGITS 등)도 받는다.
 * UI SDK 는 글자 하나씩 pattern 에 맞춰 보므로 `^\d+$` 같은 문자열도 한 글자에 그대로 맞는다.
 * input-otp 는 pattern 이 없으면 어떤 글자든 받았다. UI SDK 의 기본은 숫자만이라 그 차이를 여기서 메운다
 */
function InputOTP({
  className,
  containerClassName,
  onChange,
  onComplete,
  pattern = /[\s\S]/u,
  inputMode = "numeric",
  render,
  ...props
}: Omit<React.ComponentProps<typeof OTPInputPrimitive>, "pattern" | "onChange"> & {
  /** 감싸는 상자의 클래스. UI SDK 판은 감싸는 상자가 루트라 className 과 같은 자리에 붙는다 */
  containerClassName?: string
  onChange?: (value: string) => void
  /** 모든 칸이 찼을 때 */
  onComplete?: (value: string) => void
  pattern?: OTPInputPattern | string
}) {
  return (
    <OTPInputPrimitive
      render={slot("input-otp", render)}
      pattern={typeof pattern === "string" ? new RegExp(pattern) : pattern}
      inputMode={inputMode}
      onValueChange={onChange && ((value) => onChange(value))}
      onValueCommit={onComplete && ((value) => onComplete(value))}
      className={cn(
        "cn-input-otp flex items-center has-disabled:opacity-50 has-disabled:cursor-not-allowed",
        containerClassName,
        className
      )}
      {...props}
    />
  )
}

function InputOTPGroup({
  className,
  render,
  ...props
}: React.ComponentProps<typeof OTPInputGroupPrimitive>) {
  return (
    <OTPInputGroupPrimitive
      render={slot("input-otp-group", render)}
      className={cn("cn-input-otp-group flex items-center", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  render,
  ...props
}: Omit<React.ComponentProps<typeof OTPInputSlotPrimitive>, "children">) {
  return (
    <OTPInputSlotPrimitive
      index={index}
      render={slot("input-otp-slot", render, "div", (state) => ({
        // 3층 규칙은 input-otp 의 계약대로 data-active 를 "true" · "false" 로 읽는다
        "data-active": String(state.active),
      }))}
      className={cn(
        "cn-input-otp-slot relative flex items-center justify-center data-[active=true]:z-10",
        className
      )}
      {...props}
    >
      {(state) => (
        <>
          {state.char}
          {state.hasFakeCaret && (
            <div className="cn-input-otp-caret pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="cn-input-otp-caret-line" />
            </div>
          )}
        </>
      )}
    </OTPInputSlotPrimitive>
  )
}

function InputOTPSeparator({
  render,
  ...props
}: React.ComponentProps<typeof OTPInputSeparatorPrimitive>) {
  return (
    <OTPInputSeparatorPrimitive
      render={slot("input-otp-separator", render)}
      className="cn-input-otp-separator flex items-center"
      {...props}
    >
      <Minus />
    </OTPInputSeparatorPrimitive>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
