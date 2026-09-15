/**
 * `cn` — 조건부 클래스 결합 + Tailwind 충돌 해소.
 *
 * 기본 인스턴스를 그대로 쓴다. 테마가 커스텀 font-size 스텝을 정의하지 않기
 * 때문이다.
 *
 * ⚠ globals.css 의 `@theme` 에 `--text-<이름>` 스텝을 추가하면 이 재수출을
 *    `createCn({ extend: { classGroups: { "font-size": [{ text: [...] }] } } })`
 *    로 바꿔 그 이름을 등록해야 한다. 등록하지 않으면 병합기가 `text-<이름>` 을
 *    **색상 유틸로 오인**해 `cn("text-<이름>", "text-white")` 에서 `text-white`
 *    를 지운다(실측 확인). 2026-09-05 이전에 마케팅 타입 스케일 9스텝이
 *    정확히 그 이유로 등록돼 있었고, 스케일을 걷어내면서 함께 비웠다.
 */
export { cn } from "cn";
