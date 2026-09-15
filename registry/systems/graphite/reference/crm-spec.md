# 참조 디자인 명세 — "Sales CRM / Companies" 다크 대시보드

참조는 2000×1511 PNG 스크린샷이다. 배율은 약 1.4286 이므로 **CSS 픽셀 = 이미지 픽셀 ÷ 1.4286**,
뷰포트 1400×1058 에 해당한다. 아래 수치는 모두 CSS px 로 환산한 값(±1~2px 오차)이다.
글꼴은 Inter 계열 산세리프로 보이며, 우리는 Pretendard 를 유지한다.

## 0. 캔버스와 창

- 페이지 바탕(창 바깥): 회색 `#3d3d3d` 근처.
- 앱 창: left 31, top 31, bottom 여백 31 (높이 ≈ 996). 창 너비는 뷰포트 오른쪽 밖으로 넘친다(오른쪽이 잘려 있음,
  창 너비는 1406 으로 둔다 — 메인 오른쪽 여백 16 가정, Actions 열은 "⋯" 아이콘 하나). 모서리 반경 ≈ 12, 테두리 1px `#2a2a2a` 근처.
  캔버스 대지에서는 **창 자체(1406×996)가 루트**이고, 바깥 31px 회색 여백은 비교 스크립트의 `--frame` 이 붙인다.
- 창 안 = 왼쪽 사이드바(너비 ≈ 246) + 오른쪽 메인. 사이드바와 메인 사이 세로 경계선 1px.
- 사이드바 바탕 `#1a1a1a` 근처, 메인 바탕 `#151515` 근처 (사이드바가 아주 조금 밝다).
- 경계선/구분선 색 `#262626` 근처. 1차 글자 `#f2f2f2`, 보조 글자 `#8c8c8c`, 더 흐린 라벨 `#5e5e5e`.

## 1. 사이드바

- 머리(높이 ≈ 64, 아래 구분선 1px): 좌측 여백 11. 로고 박스 32×32 반경 8, 바탕 `#262626`
  테두리 살짝, 흰 로고 아이콘(lucide 에서 비슷한 것, 예: `Aperture`/`Command`). 오른쪽에 두 줄:
  "Sales CRM" 14px medium 흰색, "Company pipeline" 12px 보조색.
- 내비 목록(머리 아래 여백 ≈ 12): 항목 높이 ≈ 30, 간격 0. 좌우 안쪽 여백 11(박스), 아이콘 14px +
  간격 8 + 라벨 14px. 비활성 글자 `#a3a3a3`, 아이콘 같은 색.
  - Companies(활성, 카운트 241): 바탕 `#262626`, 1px 테두리 `#303030`, 반경 8, 높이 32, 흰 글자.
  - Deals Board, Forecast(9), Activities, Contacts(38), Email Sequences.
  - 카운트 배지: 오른쪽 끝, 높이 ≈ 17, 좌우 여백 6, 반경 6~8, 바탕 `#262626`(활성 항목 안에서는 `#1a1a1a`), 글자 11~12px `#d4d4d4`.
- 섹션 사이 가로 구분선 1px(사이드바 전폭), 위아래 여백 ≈ 12.
- 섹션 라벨 "TEAM", "REPORTING", "PIPELINES": 11px, 대문자, 자간 ≈ 0.08em, 색 `#5e5e5e`, 높이 ≈ 24.
  - TEAM: Strategic AEs, Mid Market, SDR Team (아이콘).
  - REPORTING: Q1 Forecast, Slipping Deals.
  - PIPELINES: 아이콘 대신 8px 원점 — 노랑 `#facc15` North America, 분홍 `#f43f5e` EMEA Enterprise, 보라 `#8b5cf6` APAC Expansion.
- 아래쪽: Invite teammates, Help (같은 내비 항목 모양).
- 사이드바 발(높이 ≈ 65, 위 구분선 1px): 왼쪽 "14 Days" 14px medium 흰색 / "Left on trials" 12px 보조색.
  오른쪽 "Add Billings" 버튼: 높이 ≈ 29, 반경 ≈ 14(알약에 가까움), 바탕 `#262626`, 테두리 `#333`, 달력/카드 아이콘 + 14px 흰 글자.

## 2. 메인 머리

- 높이 ≈ 52, 좌측 여백 16. "Companies" 16px semibold 흰색 + 간격 10 + 상태 배지 "Active":
  높이 ≈ 20, 반경 6~8, 바탕 `#1f1f1f` 테두리 `#2e2e2e`, 6px 초록 점 `#22c55e` + 12~13px 흰 글자.
- 오른쪽: 원형 아이콘 버튼 둘(검색, 종) 30×30 원형, 테두리 1px `#2e2e2e`, 바탕 `#151515`, 아이콘 15px.
  간격 8. 그 옆 사용자 칩: 높이 30 알약, 테두리 같은 색, 아바타 20px + "Robin Hale" 13px(잘려 있음).

## 3. 탭

- 머리 아래. 탭 줄 높이 ≈ 44, 아래 전폭 구분선 1px. 탭: "Companies"(활성), "Deals", "Forecast".
  글자 12~13px. 활성: 흰색 + 글자 폭만큼 2px 흰 밑줄이 구분선 위에 붙음. 비활성: 보조색 `#8c8c8c`. 탭 간격 ≈ 16. 바탕 없음(line 스타일).

## 4. 필터 줄

- 높이 ≈ 60 (위아래 여백 ≈ 16), 좌측 여백 16, 아래에 구분선 없음(표 머리 윗선이 경계).
- 필터 알약 4개, 간격 8: 높이 28, 반경 8, 바탕 `#1a1a1a`, 테두리 1px `#2c2c2c`, 좌우 여백 10.
  안에 [보조색 라벨 12~13px] 간격 16~18 [흰 값 12~13px medium] 간격 6 [chevron-down 12px].
  - Sort by / Pipeline Value, Filter / All Owners, Stage / Any, Last Activity / 90 Days.
- 오른쪽 끝: "Export" 버튼(아웃라인: 높이 28, 반경 8, 바탕 `#151515`, 테두리 `#2c2c2c`, 업로드 아이콘 + 흰 글자 13px),
  간격 6, "New Company" 주 버튼(높이 28, 반경 8, 바탕 선명한 파랑 `#3d4ef5` 근처, 테두리 조금 더 밝은 파랑, 흰 + 아이콘과 흰 글자 13px medium).

## 5. 표

- 전폭. 머리 행 높이 ≈ 36, 위아래 1px 구분선. 머리 글자 12~13px regular 보조색 `#8c8c8c`, 머리 바탕 없음.
- 본문 행 높이 ≈ 41 (40 + 1px 아래 구분선 `#232323`). 본문 글자 14px 흰색.
- 열 시작 x (메인 왼쪽 가장자리 기준): 체크박스 중심 18 · Companies 47 · Segment & Stage 202 · Account Owner 413 ·
  Open Deals 549 · Pipeline Value 636 · Win Probability 736 · Activity Trend 866 · Last Interaction 964 · Actions 1106(잘림).
- 체크박스 14×14, 반경 3~4, 테두리 1px `#3a3a3a`, 바탕 없음. 머리 체크박스는 indeterminate: 노랑 `#facc15` 채움 + 검은 가로선.
  선택된 행(Adventure Works)의 체크박스: 노랑 채움 + 검은 체크. **선택 행 바탕 `#1e1e1e`**.
- Segment & Stage: 태그 칩들, 간격 4. 칩 높이 ≈ 21, 좌우 여백 7~8, 반경 ≈ 7~8(거의 알약), 1px 테두리, 글자 13~14px.
  색조(바탕 / 테두리 / 글자):
  - blue — Enterprise: `#16213a` / `#26395f` / `#8fb2ff`
  - purple — Upsell: `#231a3d` / `#3b2b66` / `#b69cff`
  - green — New Logo, Renewal, Expansion, Mid-Market, Land & Expand: `#11281a` / `#1e4a2d` / `#7fd99a`
  - orange — Pilot, Co-Sell: `#2e1d12` / `#5a3419` / `#f0a26a`
  - red — Strategic: `#2e1515` / `#5a2323` / `#f28b8b`
  - yellow — SMB: `#2a2410` / `#54461a` / `#f2cf5b`
  - gray — "+2": `#262626` / `#333333` / `#bdbdbd`
- Account Owner: 원형 아바타 20px(사진 대신 이니셜 폴백 가능) + 간격 8 + 이름 14px 흰색.
- Open Deals: 숫자 14px 흰색.
- Pipeline Value: "$" 보조색 + 간격 6 + 값 흰색, tabular-nums.
- Win Probability: 틱 막대 폭 ≈ 70, 높이 ≈ 11: 세로 틱 20개(폭 ≈ 2, 간격 ≈ 1.5).
  채워진 틱 수 = 확률×20. 채워진 틱은 앞에서부터 빨강 `#ef4444` → 주황 `#f97316` → 노랑 `#eab308` → 초록 `#22c55e` 로 넘어가는 순서(위치 기준 색),
  빈 틱은 `#3a3a3a`. 막대 뒤 간격 ≈ 10, 퍼센트 14px 흰색 오른쪽 정렬(열 끝 x ≈ 845).
- Activity Trend: 폭 ≈ 68, 높이 ≈ 12 막대 스파크라인. 막대 ≈ 12개, 폭 2~3, 높이는 행마다 다양, 초록 `#22c55e`; 낮은 값은 흐린 초록 점 `#2f5a3a`.
- Last Interaction: 달력 아이콘 13px 흰색 + 간격 6 + 날짜 14px 흰색("Feb 21") + 간격 6 + 1px×12 세로 막대 보조색 + 간격 6 + 라벨 14px 흰색("QBR Call").
- 데이터 20행 (회사 / 태그들 / 담당자 / 딜 / 파이프라인 / 확률 / 최근 날짜 | 라벨):
  1. Northwind Traders / Enterprise, Upsell, +2 / Mara Ellison / 7 / 420,000 / 70% / Feb 21 | QBR Call
  2. Fabrikam / Enterprise, New Logo / Theo Brandt / 4 / 311,242 / 51% / Feb 22 | Demo
  3. Woodgrove Bank / Enterprise / Priya Okafor / 5 / 124,232 / 22% / Mar 12 | Security
  4. Blue Yonder Air / Renewal / Lena Voss / 2 / 221,231 / 77% / Mar 17 | Legal
  5. Contoso / Pilot / Rafael Quinn / 6 / 530,111 / 82% / Mar 12 | Exec
  6. Adventure Works (선택) / Strategic, Expansion / Iris Holloway / 8 / 320,222 / 86% / Mar 15 | Pilot
  7. Margie's Travel / Upsell, Expansion, +2 / Dev Marlow / 3 / 122,230 / 51% / Mar 18 | Pricing
  8. Litware / Enterprise, Mid-Market / Nora Kade / 5 / 230,112 / 61% / Mar 28 | Product
  9. Proseware / Mid-Market, Upsell, +2 / Felix Arden / 2 / 420,222 / 38% / Jun 14 | Pricing
  10. Tailspin Toys / SMB, Enterprise, +2 / Hana Sorel / 8 / 112,277 / 24% / Jun 7 | Renewal
  11. Fourth Coffee / Mid-Market / Owen Tate / 3 / 221,221 / 72% / Jun 18 | Pilot
  12. Wingtip Toys / Land & Expand, +2 / Clara Wynn / 5 / 170,991 / 55% / Jul 1 | Expansion
  13. Alpine Ski House / Co-Sell, Expansion / Jonah Pike / 9 / 139,007 / 45% / Jul 18 | Renewal
  14. Coho Winery / Expansion, +2 / Maya Lund / 8 / 289,921 / 38% / Aug 8 | Partner
  15. Lamna Health / Mid-Market, Co-Sell / Eli Varga / 4 / 333,221 / 23% / Aug 12 | Discovery
  16. Trey Research / Expansion, SMB, +2 / Sofia Crane / 3 / 442,231 / 44% / Sept 09 | Demo
  17. Relecloud / Enterprise, Mid-Market / Leo Hart / 6 / 520,000 / 24% / Sept 11 | Pricing
  18. VanArsdel / Expansion, Co-Sell, +2 / Ada Finch / 2 / 210,123 / 52% / Sept 18 | QBR Call
  (이미지에는 18행이 보이고 발에 "20 Companies in view" 라고 적혀 있다. 18행을 그린다.)

## 6. 표 발

- 표 바로 아래, 높이 ≈ 35, 위아래 구분선 1px. 네 칸이 세로 구분선 1px 로 나뉨(칸 폭 ≈ 288, 경계 x ≈ 290 · 578 · 866).
- 첫 칸: "20" 흰색 13px + 간격 8 + "Companies in view" 보조색 13px, 좌측 여백 12.
- 나머지: "+" 아이콘 12px 보조색 + 간격 10 + "Sum of pipeline" / "Avg win probality" / "Add Calculation" 보조색 13px, 좌측 여백 12.
