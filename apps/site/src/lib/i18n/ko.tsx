// 사이트의 한국어 문구다. 화면에 보이는 문장은 해요체로 쓰고, 버튼은 동사로 맺고, 용어는 한국어 사용자가 이미 쓰는 말을
// 따른다(레이아웃의 gutter 는 「가장자리 여백」, token 은 「토큰」, layer 는 코드 주석이 쓰는 「층」). 코드 식별자, 명령어,
// 컴포넌트 이름은 번역하지 않는다. 구조는 en.tsx 의 `Messages` 와 같아야 한다.

import type { Messages, SystemText } from "./en";

export const ko: Messages = {
    htmlLang: "ko",

    site: {
        title: "tyohnn · 색 놀음은 이제 그만, 나만의 취향을 만드세요",
        titleTemplate: "%s · tyohnn",
        description: "색 테마만으로는 모든 shadcn 앱이 비슷해 보여요. tyohnn은 밀도, 깊이, 질감을 컴포넌트에서 꺼내 직접 가질 수 있는 토큰으로 만들었어요. 모든 디자인 시스템을 실제 화면으로 둘러보고, npx tyohnn@latest init 명령으로 설치해 보세요.",
    },

    mode: { light: "라이트", dark: "다크" },
    modeTag: { light: "라이트", dark: "다크" },

    chrome: {
        navLabel: "사이트 메뉴",
        nav: { systems: "시스템", components: "컴포넌트", create: "만들기", compare: "비교", docs: "문서", github: "GitHub" },
        footerNote: "shadcn · Base UI · MIT",
        language: { label: "언어", other: "English", otherLang: "en" },
    },

    copy: {
        copy: "복사",
        copied: "복사했어요",
        aria: (command) => `복사: ${command}`,
    },

    hero: {
        titleFirst: "색 놀음은 이제 그만,",
        titleSecond: "나만의 취향을 만드세요",
        body: <>다들 색에서 멈춰요.<br /><b>밀도, 깊이, 질감</b>까지 내 토큰으로 바꿔 보세요.</>,
        browse: "시스템 둘러보기",
        play: "▶ 재생",
        pause: "❚❚ 일시정지",
        frameTitle: (name) => `${name} CRM 대시보드`,
        compareAny: "아무 시스템이나 둘 비교하기 →",
    },

    gallery: {
        titleFirst: "화면을 고르면",
        titleSecond: "모든 시스템이 따라 바뀌어요.",
        body: (total, blocks) => `제품 화면 ${total}개를 모았어요. CRM 하나와 shadcn 사이드바 블록으로 만든 ${blocks}개예요. 한 번 누르면 모든 카드가 함께 바뀌어요.`,
        count: (count) => `시스템 ${count}개`,
        orderLabel: "정렬",
        newest: "최신순",
        alphabetical: "이름순",
        chipFoot: (link) => <>컴포넌트, 아이콘, 모든 상태는 {link("컴포넌트 페이지")}에서 볼 수 있어요.</>,
        isNew: "새 시스템",
        open: "열기 →",
        compareTitle: "두 시스템 비교하기 →",
        compareBody: (count) => `시스템 ${count}개 중 아무거나 둘을 나란히 볼 수 있어요`,
    },

    taste: {
        note: "모든 카드가 실제 시스템이에요. 색도 토큰도 그 시스템 그대로예요.",
        density: {
            title: "밀도",
            body: "화면이 얼마나 촘촘한지 정해요. 컨트롤 높이, 안쪽 여백, 행 간격이 여기에 속해요.",
            captions: { mira: "컨트롤 28px · 글자 12px", nova: "컨트롤 32px · 여백 16px", sera: "컨트롤 40px · 여백 24px" },
        },
        depth: {
            title: "깊이",
            body: "면이 바닥에서 얼마나 떠 있는지 정해요. 평평하게, 살짝, 그림자로 뜨게.",
            captions: { nocturne: "바닥에 붙은 면", rhea: "옅은 그림자로 살짝 뜬 면", luma: "테두리 없이 그림자로 뜬 면" },
        },
        texture: {
            title: "질감",
            body: "면이 무엇으로 만들어졌는지 정해요. 광택, 빚은 점토, 연기 낀 유리.",
            captions: { loam: "흰 베일 · 광택", graphite: "점토 컨트롤", halo: "연기 낀 유리" },
        },
        type: {
            title: "타이포",
            body: "목소리를 정해요. 어떤 글꼴을, 얼마나 조여서, 라벨은 어떻게 말하는지.",
            captions: { vellum: "Source Serif 제목", lyra: "모두 JetBrains Mono", maia: "Figtree · 둥근 형태" },
        },
    },

    home: {
        layers: [
            { num: "1", title: "색", body: "라이트와 다크 팔레트를 시맨틱 토큰으로 담아요.", file: "styles/globals.css" },
            { num: "2", title: "토큰", body: "밀도, 깊이, 질감을 담아요. 컨트롤 높이, 모서리 반경, 그림자, 표면이 여기에 있어요.", file: "styles/tokens.css" },
            { num: "3", title: "컴포넌트 규칙", body: <>컴포넌트마다 파일 하나로 <span className="mono">cn-*</span> 훅의 스타일을 정해요. TSX는 바뀌지 않아요.</>, file: "styles/components/*.css" },
        ],
        above: [
            { num: "4", title: "블록", body: "컴포넌트를 조합해 만든 화면 조각이에요. 페이지 제목, 카드 안의 표, 칸반 보드가 여기에 해당해요. 시스템의 토큰만 읽기 때문에 시스템이 바뀌면 블록도 함께 바뀌어요.", file: "blocks/*.tsx" },
            { num: "5", title: "프레임", body: "블록이 놓이는 자리를 정해요. 가장자리 여백, 블록 사이 간격, 스크롤되는 영역, 페이지가 좁아질 때 보조 패널이 하는 일이 여기에 속해요. 화면은 단계를 고르고, 토큰이 그 크기를 정해요.", file: "blocks/page.tsx" },
        ],
        installTitle: "시스템을 통째로 복사하세요.",
        installBody: "컴포넌트, 세 층, 글꼴, 아이콘, DESIGN.md를 Next.js, Vite, Turborepo 모노레포 프로젝트로 복사해요.",
    },

    system: {
        crumbsLabel: "현재 위치",
        crumbsRoot: "시스템",
        specs: { sans: "본문 글꼴", heading: "제목 글꼴", icons: "아이콘", hangul: "한글 글꼴", default: "기본 모드" },
    },

    systemView: {
        install: "설치",
        previewMode: "미리보기 모드",
        palette: "팔레트",
        paletteLabel: (mode) => `${mode} 팔레트`,
        categoriesLabel: "화면 분류",
        screens: (count) => `화면 ${count}개`,
        fullScreen: "전체 화면 ↗",
        sidePanel: "레이아웃과 색상",
        compare: "비교",
    },

    theme: {
        trigger: "색상",
        edited: "수정됨",
        title: "색상",
        close: "닫기",
        intro: (name) => `${name}에 원하는 팔레트를 적용해 볼 수 있어요. 바꾸면 바로 프레임에 반영돼요.`,
        themes: "테마",
        themesHint: "시스템마다 하나씩 있는 완성된 팔레트",
        bases: "기본 팔레트",
        basesHint: "shadcn의 중성 색 단계",
        palette: "팔레트",
        accent: "강조색",
        chart: "차트 색",
        chartDefault: "기본값",
        search: "색 찾기…",
        none: "없음",
        every: "모든 색",
        clear: (count) => `직접 바꾼 색 ${count}개 지우기`,
        groups: {
            base: "기본",
            chart: "차트",
            sidebar: "사이드바",
            status: "상태",
            tag: "태그 색조",
            avatar: "아바타 색조",
            state: "체크 · 선택 · 링크",
        },
        pick: (name, mode) => `--${name} 색 고르기 (${mode})`,
        fieldLabel: (name, mode) => `--${name} (${mode})`,
        undo: (name) => `--${name} 되돌리기`,
        undoTitle: (original) => `원래 값: ${original ?? "테마의 값"}`,
        tailwind: "Tailwind",
        custom: "OKLCH",
        value: "값",
        moreInCreate: "차트 색, 색 하나하나, 레이아웃, 프리셋 코드는 만들기에서 바꿀 수 있어요.",
        continueInCreate: "만들기에서 이어서 →",
        openPreset: "프리셋 열기",
        open: "열기",
        notACode: "프리셋 코드가 아니에요.",
        shuffle: "섞기",
        getCode: "코드 받기",
        getCodeTitle: "이대로 설치하기",
        getCodeHint: "시스템과 지금 색을 한 줄 명령으로 설치해요. 직접 바꾼 색은 코드의 점 뒤에 실려서 어디에도 저장하지 않아요.",
        copyCss: "CSS 복사",
        download: "theme.json 내려받기",
        copyShare: "공유 링크 복사",
        resetAll: "모두 되돌리기",
        resetTitle: "시스템의 원래 색으로 되돌려요",
    },

    frames: {
        edited: "수정됨",
        title: "레이아웃",
        intro: "간격과 폭을 조절해요. 슬라이더를 움직이면 이 페이지의 모든 화면이 바로 바뀌어요.",
        copyCss: "CSS 복사",
        resetAll: "모두 되돌리기",
        resetTitle: "기본값으로 되돌려요",
    },

    components: {
        eyebrow: (components, sections) => `컴포넌트 ${components}개 · 섹션 ${sections}개`,
        title: "컴포넌트",
        body: "레지스트리의 모든 컴포넌트를 한 시스템으로 보여 줘요. 변형, 크기, 상태(비활성, 오류, 체크, 선택, 열림)를 모두 볼 수 있어요. 시스템을 바꾸면 시트 전체가 새 스타일로 바뀌어요.",
        navLabel: "컴포넌트",
        filter: "컴포넌트 검색",
        empty: (query) => `“${query}”에 맞는 컴포넌트가 없어요.`,
        sections: (count) => `섹션 ${count}개`,
        openPopup: "팝업 열림",
    },

    create: {
        eyebrow: "만들기",
        title: "내 것으로 만들기",
        body: <>느낌은 시스템으로 고르고, 팔레트, 강조색, 차트 색을 바꿔 보세요. <b>코드 받기</b>를 누르면 보이는 그대로 설치돼요. 프리셋 코드 자체가 레시피라서 어디에도 저장하지 않아요.</>,
        system: "시스템",
        systemSearch: "시스템 찾기…",
    },

    compare: {
        eyebrow: "나란히 보기",
        title: "비교",
        body: <>시스템 둘을 한 화면에서 비교해요. <b>양쪽이 같은 팔레트를 쓰기 때문에</b> 간격, 모서리, 깊이, 글꼴의 차이만 보여요. 색을 바꾸면 양쪽이 함께 바뀌어요.</>,
        metaDescription: "같은 화면에서 tyohnn 디자인 시스템 두 개를 나란히 보여 줘요. 가운데 구분선을 끌어서 경계를 옮길 수 있어요.",
        pair: (a, b) => `${a}, ${b}`,
        swap: "⇄ 서로 바꾸기",
        divider: (a, b) => `${a} 대 ${b} 구분선`,
        rows: { sans: "본문 글꼴", heading: "제목 글꼴", icons: "아이콘", mode: "기본 모드", character: "성격" },
    },

    pickers: {
        system: "시스템",
        systemSearch: "시스템 검색…",
        systemSide: (side) => `시스템 ${side}`,
        screen: "화면",
        screenSearch: "화면 검색…",
        modeLabel: "미리보기 모드",
    },

    combobox: { noMatch: "일치하는 항목이 없어요" },

    meta: {
        components: { title: "컴포넌트", description: "tyohnn의 모든 컴포넌트를 변형, 크기, 상태와 함께 보여 줘요. 고른 디자인 시스템으로 실시간 렌더링돼요." },
        compare: { title: "비교" },
        create: { title: "만들기", description: "tyohnn 시스템을 고르고 팔레트, 강조색, 차트 색을 바꾼 다음, 프리셋 코드 하나로 그대로 설치해요." },
        docs: {
            title: "문서",
            description: "tyohnn CLI의 init, add, use, icons, fonts, blocks, doctor, diff 명령과 파일 위치, 글꼴과 아이콘, 블록과 프레임, 모노레포에서 여러 시스템 쓰기를 설명해요.",
        },
    },

    docs: {
        tocLabel: "이 페이지의 내용",
        sections: [
            { id: "start", label: "시작하기" },
            { id: "commands", label: "명령어" },
            { id: "options", label: "옵션" },
            { id: "files", label: "파일이 놓이는 위치" },
            { id: "fonts", label: "글꼴" },
            { id: "icons", label: "아이콘" },
            { id: "blocks", label: "블록" },
            { id: "frames", label: "프레임" },
            { id: "monorepo", label: "시스템 여러 개 쓰기" },
            { id: "source", label: "버전과 소스" },
            { id: "ownership", label: "파일 소유권" },
        ],
        eyebrow: "문서",
        title: "시스템 설치하기.",
        lead: (
            <>
                <code>tyohnn</code> CLI는 컴포넌트 TSX 한 벌과 완성된 디자인 시스템 폴더 하나 이상을 프로젝트에 복사하고 연결해요.
                런타임 패키지는 없어서 <code>init</code> 이후의 코드는 모두 여러분의 것이에요. Node 20 이상, Next.js(App Router), Vite,
                npm · pnpm · yarn · bun 워크스페이스 모노레포를 지원해요.
            </>
        ),

        startTitle: "시작하기",
        startApp: "Next.js 또는 Vite 앱",
        startMonorepo: "모노레포: packages/ui와 앱 하나",
        startPick: (link) => <>시스템은 {link}에서 골라요. 사용할 수 있는 시스템은 다음과 같아요.</>,
        startPickLink: "시스템 페이지",

        commandsTitle: "명령어",
        commandsIntro: <>모든 명령은 <code>tyohnn.json</code>을 먼저 고친 뒤 프로젝트를 그 내용에 맞춰요. 그래서 두 번 실행해도 두 번째에는 바뀌는 것이 없어요.</>,
        commandsHead: ["명령", "하는 일"],
        commands: [
            ["init", <>프로젝트를 감지하고, 시스템을 물어본 뒤(<code>--system</code>으로 미리 지정할 수도 있어요) TSX와 시스템을 복사해요. 그다음 의존성을 추가하고 설치한 뒤 앱에 연결해요. 모노레포에서는 <code>packages/ui</code>를 만들고 <code>--app &lt;path&gt;</code>로 앱을 연결해요.</>],
            ["add <system> --app <path>", <>모노레포용이에요. 기존 UI 패키지에 시스템을 추가하고, 다른 앱을 그 시스템에 연결해요.</>],
            ["use <system> [--app <path>]", <>앱이 쓰는 시스템을 바꿔요. 엔트리 CSS, 글꼴, 모드가 바뀌고 TSX는 그대로예요.</>],
            ["icons <library> [--app <path>]", <>앱의 아이콘 라이브러리(매핑 파일과 패키지)를 바꿔요.</>],
            ["fonts [--sans] [--heading] [--mono] [--reset]", <>앱의 글꼴을 바꿔요. <code>--reset</code>은 시스템 기본 글꼴로 되돌려요.</>],
            ["blocks [remove]", <>블록과 프레임을 컴포넌트 옆에 설치하거나 업데이트해요. <code>remove</code>는 설치한 블록과 프레임을 제거해요.</>],
            ["list", <>시스템, 아이콘 라이브러리, 글꼴을 한 줄씩 보여 줘요.</>],
            ["doctor [--built]", <><code>tyohnn.json</code>을 기준으로 설정을 점검해요. 문제가 있으면 종료 코드 1로 끝나요.</>],
            ["diff [--files]", <>프로젝트의 사본을 소스와 비교해요. 소스에서 바뀐 것, 프로젝트에서 바뀐 것, 양쪽에서 바뀐 것으로 나눠 알려 줘요.</>],
        ],

        optionsTitle: "옵션",
        options: [
            ["--yes", "묻지 않고 기본값을 써요."],
            ["--force", "이미 있거나 수정한 파일을 덮어써요."],
            ["--no-install", "패키지 설치를 건너뛰어요."],
            ["--mode light|dark", "시스템의 기본 모드를 바꿔요."],
            ["--icons <library>", "init: 다른 아이콘 라이브러리를 써요."],
            ["--font · --font-heading · --font-mono", "init: 카탈로그의 다른 글꼴을 써요."],
            ["--app · --ui · --scope", "모노레포: 연결할 앱, UI 패키지 폴더, 패키지 스코프를 정해요."],
            ["--ref · --source · --offline", "읽을 레지스트리 버전, 로컬 체크아웃, 캐시만 쓰기 중에서 골라요."],
        ],

        filesTitle: "파일이 놓이는 위치",
        filesIntro: <>모노레포에는 UI 패키지가 하나 있어요. TSX는 한 벌만 두고, 시스템마다 폴더가 하나씩 있어요. <b>앱 하나는 시스템 하나만 가져와요.</b></>,
        filesMonorepoTree: [
            "packages/ui/src/components · hooks · lib       TSX, @acme/ui/components/… 로 가져와요",
            "packages/ui/src/icons/libraries/<library>.tsx  앱이 쓰는 아이콘 라이브러리",
            "packages/ui/src/systems/<system>/              색 · 토큰 · 글자 설정 · 규칙 · DESIGN.md",
            "apps/<app>/src/app/globals.css                 시스템을 정확히 하나만 가져와요",
            "apps/<app>/tsconfig.json                       paths \"@acme/ui/icons\" → 그 앱의 라이브러리",
            "tyohnn.json                                    모노레포 루트에 있어요",
        ],
        filesSingleIntro: <>Next.js나 Vite 앱 하나에서는 같은 파일이 <code>src/</code> 아래에 놓이고, <code>@/</code> 별칭으로 가져와요. 별칭이 없으면 추가해요.</>,
        filesSingleTree: [
            "src/components/ui/*.tsx       @/components/ui/… 로 가져와요",
            "src/hooks · src/lib           훅과 유틸리티",
            "src/components/icons/         index.ts · names.ts · libraries/<library>.tsx",
            "src/styles/tyohnn/<system>/   시스템 폴더",
        ],
        filesOrder: (
            <>
                엔트리 CSS는 시스템을 정해진 순서로 가져와요. tailwindcss, 1층 색, 2층 토큰, 글자 설정, <code>layer(base)</code> 안의 3층 규칙
                순서예요. 그래서 <code>className</code>으로 넘기는 유틸리티가 항상 우선해요.
            </>
        ),

        fontsTitle: "글꼴",
        fontsIntro: (
            <>
                글꼴은 항상 직접 호스팅하고, Google 글꼴 CDN은 쓰지 않아요. Next.js 앱은 루트 레이아웃에서 <code>next/font/google</code>(Pretendard는{" "}
                <code>next/font/local</code>)을 쓰고, Vite 앱은 fontsource 또는 npm 패키지와 <code>@import</code>를 써요. 시스템마다 본문, 제목,
                고정폭 글꼴과 한글 대체 글꼴이 정해져 있고, 앱마다 바꿀 수 있어요.
            </>
        ),
        fontsInit: "init에서 다른 글꼴 쓰기",
        fontsReset: "시스템 기본 글꼴로 되돌리기",
        fontsHead: ["Id", "글꼴 이름", "분류", "라이선스"],

        iconsTitle: "아이콘",
        iconsIntro: (count) => (
            <>
                컴포넌트는 아이콘 패키지가 아니라 한 모듈에서 의미로 아이콘을 가져와요(<code>ChevronDown</code>, <code>SelectIndicator</code>).
                모듈이 모든 이름을 {count}개 라이브러리 중 하나에 연결해요. 시스템마다 기본 라이브러리가 있고, <code>init</code> 때나 나중에
                바꿀 수 있어요.
            </>
        ),
        iconsInit: "init에서 다른 라이브러리 쓰기",
        iconsLater: "나중에 앱 하나만 바꾸기",

        blocksTitle: "블록",
        blocksIntro: (
            <>
                블록은 컴포넌트를 조합해 만든 화면 조각이에요. 페이지 제목, 지표 카드 한 줄, 탭과 일괄 작업이 있는 카드 안의 표, 칸반 보드가 그 예예요.
                블록은 시스템의 토큰만 읽고 색, 크기, 반경을 스스로 정하지 않아요. 그래서 시스템이 바뀔 때만 함께 바뀌어요. 데이터와 문구는 블록을
                쓰는 화면이 정해요.
            </>
        ),
        blocksNew: "새 프로젝트와 함께",
        blocksExisting: "컴포넌트가 있는 프로젝트에",
        blocksOwned: (
            <>
                블록은 컴포넌트 옆(<code>blocks/</code>)에 CLI가 소유하는 파일로 들어와요. <code>doctor</code>가 점검하고, <code>diff</code>가 소스에서
                바뀐 내용을 보여 주고, <code>tyohnn blocks</code>가 업데이트하고, <code>tyohnn blocks remove</code>가 제거해요. 갤러리의 모든 화면이 이
                블록으로 만들어졌어요.
            </>
        ),

        framesTitle: "프레임",
        framesIntro: (
            <>
                프레임은 자기 내용이 없는 블록이에요. 다른 블록을 담고, 그 블록이 놓이는 자리만 정해요. 가장자리와의 거리, 블록 사이의 거리,
                스크롤되는 부분, 나란히 놓이는 배치가 그 대상이에요. <code>Page</code>는 바 아래의 내용 영역이고, <code>PageContent</code>는
                스크롤되는 영역 안의 한 열이고, <code>PageSplit</code>은 메인 패널과 보조 패널을 나란히 놓아요.
            </>
        ),
        framesTree: [
            '<Page scroll="regions">                    고정: 안쪽 어딘가가 스크롤돼요',
            "    <PageHeading … />",
            "    <PageSplit narrow=\"stack\">",
            "        <DataTableCard … />                   메인 패널이 남는 공간을 차지해요",
            '        <PageAside width="md">…</PageAside>   옆에 20rem',
            "    </PageSplit>",
            "</Page>",
        ],
        framesStep: (
            <>
                <b>화면은 단계를 고르고, 토큰이 그 크기를 정해요.</b> <code>gutter=&quot;sm&quot;</code>은 화면이 한 선택이고,{" "}
                <code>--page-gutter-sm</code>은 시스템이나 직접 쓴 CSS가 달리 정하지 않으면 1rem이에요. 시스템 스타일 뒤에 <code>:root</code>로
                토큰 하나를 선언하면 그 단계를 쓰는 모든 페이지가 함께 바뀌어요.
            </>
        ),
        framesTokensHead: ["토큰", "기본값", "적용되는 곳"],
        framesNarrow: (minRem) => (
            <>
                <b>좁은 페이지.</b> 분할 화면은 페이지 폭이 {minRem}rem 이상일 때 나란히 놓여요. 기준은 창이 아니라 페이지 자체의 폭이라서,
                사이드바를 닫으면 공간이 돌아와요. 그보다 좁으면 보조 패널은 세 가지 중 하나로 동작해요. 화면이 <code>PageSplit</code>의{" "}
                <code>narrow</code>로 고르고, 네 번째는 없어요. 너비를 유지하는 보조 패널은 메인 패널을 거의 보이지 않을 만큼 좁히기 때문이에요.
            </>
        ),
        framesNarrowHead: ["narrow", "보조 패널", "쓰는 경우"],
        narrow: [
            ["stack", "메인 패널 아래로 내려가고, 페이지가 하나로 스크롤돼요.", "메인 패널과 함께 읽는 내용: 팀 페이지의 좌석 카드와 초대 카드."],
            ["sheet", "페이지에서 빠지고, PageAsideTrigger를 누르면 페이지 위로 열려요. 메인 패널의 높이는 그대로예요.", "메인 패널을 다루는 도구: 플레이그라운드의 실행 설정, 리뷰의 체크 목록."],
            ["hide", "그려지지 않아요.", "없어도 페이지가 동작하는 보조 요소: 목차."],
        ],
        framesTry: (systemLink) => (
            <>
                값을 직접 바꿔 보려면 아무 {systemLink}에서 화면 옆의 <b>레이아웃</b> 탭을 써요. 슬라이더 하나가 페이지의 모든 화면을
                한 번에 움직여요.
            </>
        ),
        framesTryLink: "시스템 페이지",

        monorepoTitle: "모노레포에서 시스템 여러 개 쓰기",
        monorepoIntro: (
            <>
                한 모노레포의 앱들은 UI 패키지 하나에서 서로 다른 시스템과 서로 다른 아이콘 라이브러리를 쓸 수 있어요. 한 앱에 시스템 둘을 가져오면
                안 돼요. 모든 시스템이 같은 <code>cn-*</code> 규칙과 토큰 이름을 전역으로 정의하기 때문에, 나중에 가져온 쪽이 아무 알림 없이 이겨요.
            </>
        ),
        monorepoTree: [
            "npx tyohnn@latest init --system graphite --app apps/crm --scope @acme",
            "npx tyohnn@latest add mira --app apps/admin --icons hugeicons",
            "npx tyohnn@latest use nova --app apps/admin          # 그 앱의 시스템만 바꿔요. TSX는 그대로예요",
            "npx tyohnn@latest doctor --built                     # 빌드된 CSS에 다른 시스템의 토큰이 섞였는지도 점검해요",
        ],
        monorepoDoctor: (
            <>
                <code>doctor</code>는 다음 경우에 실패해요. 한 앱에 시스템이 둘이거나, 가져오는 순서나 <code>layer(base)</code>가 틀렸거나,{" "}
                <code>@source</code>가 없거나, 레이아웃이 선언하지 않은 글꼴 변수가 있거나, 아이콘 경로가 <code>tyohnn.json</code>과 다르거나,
                모드 클래스가 <code>tyohnn.json</code>과 다를 때예요. 아이콘 라이브러리가 서로 다르거나 CLI 소유 파일을 수정했을 때는 경고해요.
            </>
        ),

        sourceTitle: "버전과 소스",
        sourceIntro: (
            <>
                npm 패키지에는 CLI만 들어 있어요. 컴포넌트와 시스템은 실행할 때 tyohnn 저장소(기본은 <code>main</code> 브랜치)에서 읽고, 커밋별로
                캐시하고, 그 커밋을 <code>tyohnn.json</code>에 기록해요. 이후 명령은 기록된 커밋을 읽기 때문에, 프로젝트가 모르는 사이에 새 버전으로
                바뀌는 일은 없어요.
            </>
        ),
        sourcePin: "버전 고정하기",
        sourceDiff: "그 뒤로 바뀐 내용 보기",

        ownershipTitle: "파일 소유권",
        ownershipHead: ["종류", "파일", "CLI가 하는 일"],
        ownership: [
            ["CLI 소유", "TSX, 아이콘 매핑, 시스템 폴더", "해시를 기록하며 통째로 써요. 바뀌지 않은 동안에만 덮어쓰고, 수정한 파일은 그대로 두고 알려 줘요."],
            ["관리 구간", "엔트리 CSS, 레이아웃, next/vite 설정", <><code>tyohnn:begin</code>과 <code>tyohnn:end</code> 주석 사이의 텍스트만 다시 써요.</>],
            ["병합", "tsconfig paths, package.json, index.html 클래스", "tyohnn에 필요한 항목만 바꾸고, 주석과 서식은 그대로 둬요."],
            ["내 파일", "그 밖의 모든 파일", "손대지 않아요."],
        ],
    },

    labels: {
        categories: {
            dashboards: "대시보드",
            workspace: "작업 공간",
            planning: "메일과 일정",
            content: "문서와 콘텐츠",
        },
        screens: {
            "crm-dashboard": "CRM",
            "block-orders": "주문",
            "block-analytics": "분석",
            "block-roadmap": "로드맵",
            "block-team": "팀",
            "block-project": "프로젝트",
            "block-code-review": "코드 리뷰",
            "block-ai-playground": "AI 플레이그라운드",
            "block-settings-dialog": "설정 대화상자",
            "block-inbox": "받은편지함",
            "block-editor": "에디터",
            "block-calendar": "캘린더",
            "block-meeting-notes": "회의록",
            "block-docs": "문서",
            "block-api-reference": "API 레퍼런스",
            "block-help-center": "도움말 센터",
            "block-changelog": "변경 내역",
        },
        coverageGroups: {
            basics: "기본",
            forms: "입력 양식",
            display: "표시",
            data: "데이터",
            overlays: "오버레이",
            menus: "메뉴",
            chat: "채팅",
        },
        sections: {
            button: "버튼", badge: "배지", kbd: "키보드 키", spinner: "스피너", separator: "구분선", skeleton: "스켈레톤", label: "라벨",
            "aspect-ratio": "가로세로 비율", toggle: "토글", "toggle-group": "토글 그룹", "button-group": "버튼 그룹", direction: "글자 방향",
            input: "입력창", textarea: "여러 줄 입력창", checkbox: "체크박스", "radio-group": "라디오 그룹", switch: "스위치", slider: "슬라이더",
            progress: "진행률", field: "필드", "input-group": "입력창 그룹", "input-otp": "인증번호 입력", "native-select": "기본 셀렉트", select: "셀렉트",
            alert: "알림 배너", avatar: "아바타", card: "카드", empty: "빈 상태", item: "항목", marker: "마커", table: "표", "scroll-area": "스크롤 영역",
            accordion: "아코디언", collapsible: "접고 펼치기", tabs: "탭", breadcrumb: "브레드크럼", pagination: "페이지 이동",
            calendar: "캘린더", chart: "차트", carousel: "캐러셀", resizable: "크기 조절 패널", sidebar: "사이드바",
            dialog: "대화상자", "alert-dialog": "확인 대화상자", "alert-dialog-sm": "확인 대화상자(작게)", sheet: "시트", "sheet-left": "시트(왼쪽)",
            "sheet-top": "시트(위쪽)", "sheet-bottom": "시트(아래쪽)", drawer: "드로어", "drawer-right": "드로어(오른쪽)", popover: "팝오버",
            "hover-card": "호버 카드", tooltip: "툴팁",
            "dropdown-menu": "드롭다운 메뉴", "context-menu": "컨텍스트 메뉴", menubar: "메뉴바", combobox: "콤보박스", "combobox-groups": "콤보박스(그룹)",
            "combobox-chips": "콤보박스(칩)", command: "명령 팔레트", "command-dialog": "명령 팔레트 대화상자", "navigation-menu": "내비게이션 메뉴",
            bubble: "말풍선", message: "메시지", "message-scroller": "메시지 스크롤러", attachment: "첨부 파일", questionnaire: "설문", toast: "토스트",
        },
        frameGroups: {
            gutter: { title: "페이지 여백", hint: "페이지 내용과 가장자리 사이의 공간이에요." },
            gap: { title: "블록 사이 간격", hint: "제목과 표처럼 페이지 위 항목들 사이의 간격이에요." },
            measure: { title: "읽기 폭", hint: "글 열이 얼마나 넓어질 수 있는지 정해요. 긴 줄도 읽기 편하게 해 줘요." },
            aside: { title: "보조 패널 폭", hint: "페이지가 둘로 나뉠 때 옆의 좁은 패널 폭이에요. 목차 같은 패널이 여기에 해당해요." },
            document: { title: "문서 여백", hint: "문서 내용의 위와 아래 공간이에요." },
        },
        frameSteps: { xs: "아주 작게", sm: "작게", md: "보통", lg: "크게", xl: "아주 크게", start: "위", end: "아래" },
    },

    systems: {
        cirrus: {
            description: "한낮의 햇빛과 유리 같은 시스템이에요. 차가운 흰색에 가까운 페이지 위에 넓고 부드러운 그림자의 흰 카드가 놓이고, 버튼은 알약 모양이에요. 메뉴, 팝오버, 대화상자, 시트처럼 떠 있는 층은 모두 블러 처리된 반투명 유리 질감이에요. 어두운 남색이 행동 색이고, 하늘색 하나가 신호 색이며, 차트에서는 민트가 하늘색 옆에 놓여요.",
            tagline: "Pretendard · 블러 레이어 · 알약 버튼",
            character: "한낮의 햇빛과 유리",
        },
        clover: {
            description: "밝고 정돈된 백오피스예요. 흰 종이, 차가운 회색 잉크, 그리고 행동, 포커스, 체크 상태를 모두 나타내는 선명한 초록 하나로 이뤄져요. 컨트롤은 높이 36px에 14px 글자이고, 윤곽선 컨트롤은 헤어라인 위의 흰 칩처럼 놓여요. 기본 버튼은 초록에서 청록으로 이어지는 그러데이션이에요. 작은 라벨은 옅게 물들고 같은 색조의 굵은 글자를 쓰며, 아바타는 둥근 사각형이고 표 행은 가장 옅은 선으로 나뉜 48px이에요.",
            tagline: "Inter · 흰 칩 · 초록에서 청록으로",
            character: "밝고 정돈된 백오피스",
        },
        graphite: {
            description: "어둡고 촘촘해요. 한 단계씩 밝아지는 거의 검은 면, 헤어라인 구분선, 컴팩트한 행, 옅게 물든 태그, 말랑한 클레이 컨트롤, 선명한 파랑과 노랑 강조색을 써요.",
            tagline: "Pretendard · 촘촘함 · 클레이 컨트롤",
            character: "어둡고 촘촘한 화면",
        },
        halo: {
            description: "살아 있는 배경 위에 뜬 HUD예요. 창은 짙은 스모크 유리라서 뒤의 장면이 은은하게 비쳐요. 미디어는 카드 맨 위에 가장자리까지 꽉 차게 놓이고, 그 아래에 굵은 제목과 조용한 메타 줄이 와요. 신호 색은 하늘색 하나뿐이에요. 모든 면이 떠 있으므로 모든 면이 유리이지만, 글자 대비를 지키려고 채움은 72%보다 얇아지지 않아요.",
            tagline: "Pretendard · 스모크 유리 · 미디어 카드",
            character: "배경 위에 뜬 HUD",
        },
        loam: {
            description: "밤의 정원 같은 다크 시스템이에요. 거의 검은 바닥에 한 단계 밝은 패널이 놓이고, 덜 중요한 면은 모두 흰색 얇은 막을 덮은 모양이에요. 버튼은 알약 모양이고 기본 버튼은 흰색이에요. 사이드바 행은 높이 30px에 모서리 12px이며, 진행, 포커스, 표시는 세이지 그린 하나로 나타내요. 제목을 포함해 모든 글자가 Geist예요.",
            tagline: "Geist · 흰 막 · 세이지 신호색 하나",
            character: "밤의 정원 같은 다크",
        },
        luma: {
            description: "부드럽고 여유로워요. 중성 회색을 테두리 없이 그려요. 옅은 채움, 헤어라인 링, 실제 그림자만 쓰고, 컨트롤은 높이 36px에 14px 글자, 카드와 버튼은 모서리 26px예요.",
            tagline: "Inter · 테두리 없음 · 모서리 26px",
            character: "부드럽고 여유로운 화면",
        },
        lyra: {
            description: "터미널처럼 담백해요. 모든 곳에 JetBrains Mono를 쓰고, 모든 면의 모서리는 각져 있어요. 다른 시스템이라면 그림자가 하는 일을 1px 링이 맡아요.",
            tagline: "JetBrains Mono · 각진 모서리 · 링",
            character: "터미널처럼 담백한 화면",
        },
        maia: {
            description: "둥글고 넉넉해요. 중성 회색, 높이 36px에 14px 글자의 컨트롤, 모서리 26px의 버튼과 입력창, 모서리 18px의 카드, 두께 3px의 포커스 링을 써요.",
            tagline: "Figtree · 컨트롤 36px · 둥근 모서리",
            character: "둥글고 넉넉한 화면",
        },
        mira: {
            description: "조용하고 작고 정확해요. 중성 회색, 높이 28px에 12px 글자의 컨트롤, 그림자 없는 평평한 면, 그림자 대신 헤어라인 링을 써요.",
            tagline: "Inter · 컨트롤 28px · 헤어라인 링",
            character: "조용하고 정확한 화면",
        },
        nocturne: {
            description: "전시장 같은 다크예요. 거의 검은 면, 옅은 색 알약 버튼, Bricolage Grotesque 제목, 대문자 모노 라벨을 쓰고, 포커스와 선택은 라벤더 신호색 하나로 나타내요.",
            tagline: "Geist · 알약 컨트롤 · 라벤더 신호색 하나",
            character: "전시장 같은 다크",
        },
        nova: {
            description: "neutral 색 단계 위에 Geist를 올렸어요. 모서리는 부드러운 10px, 컨트롤은 14px 글자에 높이 32px로 넉넉하고, 깊이는 헤어라인 링과 옅은 푸터 띠로 표현해요.",
            tagline: "Geist · 컨트롤 32px · 모서리 10px",
            character: "Geist와 neutral 색의 조합",
        },
        rhea: {
            description: "부드럽고 넉넉해요. 모서리 16px, 테두리 없이 채워진 입력창, 모든 카드 아래의 옅은 그림자를 써요.",
            tagline: "Inter · 채워진 입력창 · 모서리 16px",
            character: "부드럽고 넉넉한 화면",
        },
        sera: {
            description: "에디토리얼 톤의 중성 회색이에요. 각진 모서리, 대문자 라벨, 모든 제목에 쓰는 Playfair Display 세리프가 특징이에요.",
            tagline: "Playfair Display · 각진 모서리 · 대문자 라벨",
            character: "에디토리얼 중성 회색",
        },
        vega: {
            description: "차분하고 고전적이고 편안해요. 중성 회색, 높이 36px에 14px 글자의 컨트롤, 윤곽선 컨트롤 아래의 옅은 shadow-xs, 헤어라인 링으로 그린 모서리 14px 카드를 써요.",
            tagline: "Inter · 컨트롤 36px · shadow-xs",
            character: "차분하고 편안한 고전",
        },
        vellum: {
            description: "따뜻한 기록 문서의 느낌이에요. 양피지 색 셸이 하얀 문서 면을 감싸고, 모든 제목은 세리프로 써요. 그림자 대신 헤어라인 구분선을 쓰고, 표는 백 행을 한눈에 읽을 만큼 촘촘해요. 잉크 색이 행동 색이고, 깊은 청록 하나가 신호 색이에요.",
            tagline: "Source Serif 4 · 양피지 셸 · 촘촘한 표",
            character: "따뜻한 기록 문서",
        },
    } satisfies Record<string, SystemText>,
};
