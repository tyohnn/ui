"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

import { CircleCheck, Info, Loader, OctagonX, TriangleAlert } from "@tyohnn/icons"

/* 면은 중립이고 타입은 아이콘 색으로만 말한다(2026-09-09 사용자 결정).
   richColors 를 켜면 바탕·테두리·글자가 한꺼번에 상태색이 되는데, 토스트가 쌓이면
   화면 구석이 알록달록해지고 눈이 아프다. sonner 에는 그 중간이 없다 — [data-title]
   이 color:inherit 이라 제목만 색을 줄 수 없다. 그래서 색을 아이콘에만 둔다.
   ⚠ 아이콘 색이 클래스로 먹는 것은 sonner 가 [data-icon] 에 color 를 선언하지
     않기 때문이다(실측). 상류가 선언을 더하면 레이어 규칙상 우리가 지므로
     (사유는 styles/components/sonner.css), 판을 올릴 때 이 자리를 다시 확인할 것. */
const Toaster = ({ ...props }: ToasterProps) => {
  /* ⚠ 기본값은 system 이 아니라 light 다. 이 저장소에는 next-themes 의 ThemeProvider 가
     없어 useTheme 이 늘 undefined 를 돌려준다. system 이면 sonner 가 OS 설정을 보고
     다크 테마 규칙을 켜는데, 앱은 밝은 채라 닫기 버튼 hover 가 sonner 의 다크 값
     (hsl 0 0% 12%)으로 까맣게 칠해졌다(2026-09-11). 앱 테마를 따라가려면 Provider 를
     세우면 되고, 그러면 이 기본값은 쓰이지 않는다. */
  const { theme = "light" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="size-4 text-success" />,
        info: <Info className="size-4 text-info" />,
        warning: <TriangleAlert className="size-4 text-warning" />,
        error: <OctagonX className="size-4 text-destructive" />,
        loading: <Loader className="size-4 animate-spin text-muted-foreground" />,
      }}
      closeButton
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--surface-radius)",
          "--normal-bg-hover": "var(--muted)",
          "--normal-border-hover": "var(--border-strong)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
