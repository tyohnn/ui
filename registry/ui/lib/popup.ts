import * as React from "react"

/**
 * shadcn(Base UI) 의 계약은 글 방향을 따르는 옆을 "inline-start" · "inline-end" 로 쓰고, UI SDK 는 "start" · "end" 로 쓴다.
 * 호출부가 쓰던 이름을 그대로 받아 UI SDK 의 이름으로 바꾼다. UI SDK 는 data-side 에 실제로 열린 쪽(left · right)을 적는다.
 */
type ContractSide = "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"

const sideOf = (side: ContractSide | "start" | "end" | undefined) =>
  side === "inline-start" ? "start" : side === "inline-end" ? "end" : side

const contains = (children: React.ReactNode, type: unknown): boolean =>
  React.Children.toArray(children).some(
    (child) =>
      React.isValidElement<{ children?: React.ReactNode }>(child) &&
      (child.type === type || contains(child.props.children, type))
  )

/** 그리지 않는 자리. 안에 든 요소는 UI SDK 가 children 을 훑을 때만 보인다 */
const Unrendered = (_props: { children?: React.ReactNode }) => null

/**
 * items 를 받은 UI SDK 의 Select · Combobox 는 children 에서 자기 Content 를 찾지 못하면 기본 Content 를 하나 더 그리고,
 * 감싼 Content 가 자리를 알린 뒤(레이아웃 effect)에 지운다. 처음부터 열려 있으면 그 사이에 팝업이 둘 붙었다 하나가 떨어져
 * 위치가 어긋나고 포커스가 트리거로 돌아간다. 감싼 Content 가 children 에 있으면 UI SDK 의 Content 를 그리지 않는 자리에 넣어 알린다.
 */
function claimContent(children: React.ReactNode, wrapper: unknown, primitive: React.ElementType) {
  return contains(children, wrapper)
    ? React.createElement(React.Fragment, null, children, React.createElement(Unrendered, null, React.createElement(primitive)))
    : children
}

export { claimContent, sideOf, type ContractSide }
