"use client"

import * as React from "react"

type TextDirection = "ltr" | "rtl"

/**
 * UI SDK 의 부분은 방향을 맥락이 아니라 요소의 계산된 direction(dir 속성)에서 읽는다. 그래서 이 제공자는 UI SDK 에
 * 무엇을 넘기지 않고, 방향을 직접 읽어야 하는 앱 코드를 위해 shadcn 의 이름(DirectionProvider · useDirection)만 잇는다.
 * 화면이 실제로 뒤집히려면 감싼 요소에 dir 을 단다.
 */
const DirectionContext = React.createContext<TextDirection>("ltr")

function DirectionProvider({
  direction = "ltr",
  children,
}: {
  direction?: TextDirection
  children?: React.ReactNode
}) {
  return (
    <DirectionContext.Provider value={direction}>
      {children}
    </DirectionContext.Provider>
  )
}

function useDirection() {
  return React.useContext(DirectionContext)
}

export { DirectionProvider, useDirection, type TextDirection }
