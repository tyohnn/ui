import type * as React from "react"
import { renderElement, type RenderProp } from "@ui-sdk/react/primitive"

/**
 * UI SDK 는 부분마다 data-slot 을 자기 이름으로 쓴다(Tabs 의 탭은 "tabs-tab", 패널은 "tabs-panel").
 * tyohnn 의 3층 규칙과 앱의 선택자는 shadcn 의 이름("tabs-trigger", "tabs-content")과, 컴포넌트를 조합한
 * 쪽이 붙인 이름("sidebar-trigger")을 읽는다. 이 render 함수가 UI SDK 가 만든 속성 위에 그 이름을 다시 쓴다.
 *
 * `attrs` 는 상태 속성의 이름이 shadcn 계약과 다른 자리를 잇는다. 예를 들어 UI SDK 의 고른 탭은
 * data-selected 이고 계약은 data-active 라, 탭은 `(state) => ({ "data-active": state.selected ? "" : undefined })`
 * 를 넘긴다. 두 번째 인자로 UI SDK 가 만든 속성을 받으므로 인라인 스타일을 고쳐 쓸 수도 있다.
 *
 * 호출부가 넘긴 render(링크 등)는 그대로 이어서 그린다. UI SDK 안에서 data-slot 을 읽는 자리는
 * 그 요소 자신의 값을 읽으므로 이름을 바꿔도 동작은 같다.
 */
function slot<State>(
  name: string,
  render?: RenderProp<State>,
  tag = "div",
  attrs?: (state: State, props: Record<string, unknown>) => Record<string, unknown>
): RenderProp<State> {
  return (props: Record<string, unknown>, state: State) =>
    renderElement(
      tag,
      { ...props, ...attrs?.(state, props), "data-slot": name },
      render,
      state
    )
}

/** 참이면 빈 문자열(속성이 있다), 거짓이면 undefined(속성이 없다) */
const flag = (value: unknown) => (value ? "" : undefined)

/** 동작 없이 render 를 받는 부분의 props. 태그의 props 에 render 하나를 더한다 */
type RenderableProps<Tag extends keyof React.JSX.IntrinsicElements, State = Record<string, unknown>> =
  React.ComponentProps<Tag> & { render?: RenderProp<State> }

/**
 * 상태를 data-* 로 펼쳐 태그나 render 로 그린다. shadcn 의 Base UI 판이 useRender 에 맡기던 일이다.
 * 참은 빈 값, 문자열과 숫자는 그 값, 거짓과 undefined 는 속성이 없다. 넘긴 props 가 상태의 속성을 이긴다.
 * 훅을 쓰지 않아 서버 컴포넌트에서도 부른다.
 */
function renderPart<State extends Record<string, unknown>>(
  tag: string,
  props: Record<string, unknown>,
  render: RenderProp<State> | undefined,
  state: State
) {
  const attrs: Record<string, string> = {}

  for (const [key, value] of Object.entries(state)) {
    if (value === true) attrs[`data-${key.toLowerCase()}`] = ""
    else if (value) attrs[`data-${key.toLowerCase()}`] = String(value)
  }

  // Base UI 의 useRender 는 태그 그대로 그린 button 에 type="button" 을 달았다(폼 안에서 제출하지 않게).
  const native = tag === "button" && !render ? { type: "button" } : {}

  return renderElement(tag, { ...native, ...attrs, ...props }, render, state)
}

export { flag, renderPart, slot, type RenderableProps }
