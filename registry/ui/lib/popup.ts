/**
 * shadcn(Base UI) 의 계약은 글 방향을 따르는 옆을 "inline-start" · "inline-end" 로 쓰고, UI SDK 는 "start" · "end" 로 쓴다.
 * 호출부가 쓰던 이름을 그대로 받아 UI SDK 의 이름으로 바꾼다. UI SDK 는 data-side 에 실제로 열린 쪽(left · right)을 적는다.
 */
type ContractSide = "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"

const sideOf = (side: ContractSide | "start" | "end" | undefined) =>
  side === "inline-start" ? "start" : side === "inline-end" ? "end" : side

export { sideOf, type ContractSide }
