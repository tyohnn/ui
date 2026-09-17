import { Bell, ChartLine, Download, LayoutGrid, MoreHorizontal, Plus, Search, Users } from "@acme/ui/icons";

import { Alert, AlertDescription, AlertTitle } from "@acme/ui/components/alert";
import { Avatar, AvatarFallback } from "@acme/ui/components/avatar";
import { Badge } from "@acme/ui/components/badge";
import { Button } from "@acme/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@acme/ui/components/card";
import { Checkbox } from "@acme/ui/components/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@acme/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@acme/ui/components/dropdown-menu";
import { Input } from "@acme/ui/components/input";
import { Kbd, KbdGroup } from "@acme/ui/components/kbd";
import { Label } from "@acme/ui/components/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@acme/ui/components/select";
import {
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@acme/ui/components/sidebar";
import { Switch } from "@acme/ui/components/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@acme/ui/components/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@acme/ui/components/tabs";

/**
 * 디자인 시스템 표본. 기능이 아니라 **3층 규칙이 캔버스와 같은 모양으로 붙었는지**를 눈으로 보는 자리다.
 * 위쪽 `CanvasSheet` 는 graphite 의 원본 캔버스(sales-crm 디자인 캔버스의 DesignSystem 시트, 2026-09-15)와 같은 구역을 같은 순서로 세운다
 * — 버튼 · 체크박스 · 태그 · 아바타 · 밑줄 탭 · 표 · 사이드바 항목. 아래 카드는 나머지 컴포넌트의 밀도를 본다.
 * 화면이 붙기 시작하면 이 파일과 랜딩의 호출을 함께 지운다.
 *
 * ⚠ 색 · 크기 · 그림자는 전부 tyohnn 디자인 시스템의 3층이 정한다. 여기서는 조립과 레이아웃 유틸리티만 쓴다.
 */
/** 셀렉트가 고른 값 대신 라벨을 보이려면 Base UI Select 에 items 를 넘겨야 한다 */
const STATES = [
    { value: "draft", label: "초안" },
    { value: "review", label: "검토" },
    { value: "done", label: "완료" },
];


const TONES = ["blue", "purple", "green", "orange", "red", "yellow", "gray"] as const;
const TONE_LABELS: Record<(typeof TONES)[number], string> = {
    blue: "Enterprise",
    purple: "Upsell",
    green: "Expansion",
    orange: "Co-Sell",
    red: "Strategic",
    yellow: "SMB",
    gray: "+2",
};

const OWNERS = [
    { initials: "ME", name: "Mara Ellison", tone: "navy" },
    { initials: "TB", name: "Theo Brandt", tone: "olive" },
    { initials: "PO", name: "Priya Okafor", tone: "teal" },
    { initials: "IH", name: "Iris Holloway", tone: "rust" },
];

/** 캔버스 시트의 한 칸 — 무대와 설명 한 줄 */
const Spec = ({ caption, children }: { caption: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">{children}</div>
        <span className="text-muted-foreground text-xs">{caption}</span>
    </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="flex flex-col gap-5 border-t pt-5">
        <h2 className="text-muted-foreground text-xs uppercase">{title}</h2>
        <div className="flex flex-wrap items-start gap-8">{children}</div>
    </section>
);

const Owner = ({ initials, name, tone }: { initials: string; name: string; tone: string }) => (
    <span className="inline-flex items-center gap-[7px]">
        <Avatar size="sm">
            <AvatarFallback data-tone={tone}>{initials}</AvatarFallback>
        </Avatar>
        <span>{name}</span>
    </span>
);

/** 사이드바 판. Sidebar 컴포넌트 없이 메뉴만 세우려고 Provider 로 감싸고, 판의 틀은 레이아웃 유틸리티로 준다 */
const SidebarPanel = ({ children }: { children: React.ReactNode }) => (
    <SidebarProvider className="min-h-0 w-auto">
        <div className="bg-sidebar w-[230px] rounded-[10px] border px-[11px] py-2">
            {children}
        </div>
    </SidebarProvider>
);

const CanvasSheet = () => (
    <div data-specimen="canvas" className="flex flex-col gap-11">
        <Section title="Sidebar">
            <Spec caption="Nav item · default">
                <SidebarPanel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton><LayoutGrid /><span>Deals Board</span></SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarPanel>
            </Spec>
            <Spec caption="Nav item · count">
                <SidebarPanel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton><ChartLine /><span>Forecast</span></SidebarMenuButton>
                            <SidebarMenuBadge>9</SidebarMenuBadge>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarPanel>
            </Spec>
            <Spec caption="Nav item · active + count">
                <SidebarPanel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton isActive><Users /><span>Companies</span></SidebarMenuButton>
                            <SidebarMenuBadge>241</SidebarMenuBadge>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarPanel>
            </Spec>
            <Spec caption="Section label">
                <SidebarPanel>
                    <SidebarGroupLabel>Reporting</SidebarGroupLabel>
                </SidebarPanel>
            </Spec>
        </Section>

        <Section title="Buttons">
            <Spec caption="Outline">
                <Button variant="outline"><Download data-icon="inline-start" />Export</Button>
            </Spec>
            <Spec caption="Primary">
                <Button><Plus data-icon="inline-start" />New Company</Button>
            </Spec>
            <Spec caption="Round icon">
                <Button variant="outline" size="icon" data-shape="round" aria-label="Search"><Search /></Button>
                <Button variant="outline" size="icon" data-shape="round" aria-label="Notifications"><Bell /></Button>
            </Spec>
            <Spec caption="Pill · secondary">
                <Button variant="secondary" data-shape="pill"><Plus data-icon="inline-start" />Add Billings</Button>
            </Spec>
            <Spec caption="Select trigger (user chip)">
                <Select items={OWNERS.map((owner) => ({ value: owner.initials, label: owner.name }))} defaultValue="ME">
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {OWNERS.map((owner) => (
                            <SelectItem key={owner.initials} value={owner.initials}>{owner.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Spec>
            <Spec caption="Ghost · icon-sm">
                <Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button>
            </Spec>
        </Section>

        <Section title="Badge · Tabs">
            <Spec caption="Tabs · line">
                <div className="w-[345px]">
                    <Tabs defaultValue="companies">
                        <TabsList variant="line">
                            <TabsTrigger value="companies">Companies</TabsTrigger>
                            <TabsTrigger value="deals">Deals</TabsTrigger>
                            <TabsTrigger value="forecast">Forecast</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </Spec>
        </Section>

        <Section title="Checkbox · Tag · Avatar">
            <Spec caption="Checkbox · unchecked · checked · indeterminate">
                <Checkbox aria-label="unchecked" />
                <Checkbox aria-label="checked" defaultChecked />
                <Checkbox aria-label="indeterminate" indeterminate />
            </Spec>
            <Spec caption="Tag · blue · purple · green · orange · red · yellow · gray">
                <div className="flex items-center gap-1">
                    {TONES.map((tone) => (
                        <Badge key={tone} variant="outline" data-tone={tone}>{TONE_LABELS[tone]}</Badge>
                    ))}
                </div>
            </Spec>
            <Spec caption="Avatar + name">
                <div className="flex flex-col items-start gap-2.5">
                    {OWNERS.map((owner) => <Owner key={owner.initials} {...owner} />)}
                </div>
            </Spec>
        </Section>

        <section className="flex flex-col gap-5 border-t pt-5">
            <h2 className="text-muted-foreground text-xs uppercase">Table · header + row default + row selected</h2>
            <div className="overflow-hidden rounded-lg border">
                <Table className="table-fixed">
                    <colgroup>
                        <col className="w-10" />
                        <col className="w-[155px]" />
                        <col className="w-[210px]" />
                        <col className="w-[160px]" />
                        <col />
                        <col className="w-12" />
                    </colgroup>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Checkbox aria-label="select all" indeterminate /></TableHead>
                            <TableHead>Companies</TableHead>
                            <TableHead>Segment &amp; Stage</TableHead>
                            <TableHead>Account Owner</TableHead>
                            <TableHead>Open Deals</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell><Checkbox aria-label="Northwind Traders" /></TableCell>
                            <TableCell>Northwind Traders</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <Badge variant="outline" data-tone="blue">Enterprise</Badge>
                                    <Badge variant="outline" data-tone="purple">Upsell</Badge>
                                    <Badge variant="outline" data-tone="gray">+2</Badge>
                                </div>
                            </TableCell>
                            <TableCell><Owner {...OWNERS[0]} /></TableCell>
                            <TableCell>7</TableCell>
                            <TableCell><Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button></TableCell>
                        </TableRow>
                        <TableRow data-state="selected">
                            <TableCell><Checkbox aria-label="Adventure Works" defaultChecked /></TableCell>
                            <TableCell>Adventure Works</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <Badge variant="outline" data-tone="red">Strategic</Badge>
                                    <Badge variant="outline" data-tone="green">Expansion</Badge>
                                </div>
                            </TableCell>
                            <TableCell><Owner {...OWNERS[3]} /></TableCell>
                            <TableCell>12</TableCell>
                            <TableCell><Button variant="ghost" size="icon-sm" aria-label="Actions"><MoreHorizontal /></Button></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </section>
    </div>
);

export const Specimen = () => (
    <div className="flex flex-col gap-11">
        <CanvasSheet />
        <Card>
            <CardHeader>
                <CardTitle>디자인 시스템 표본</CardTitle>
                <CardDescription>Checks that the three tyohnn CSS layers are wired to the components.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Button size="xs">아주 작게</Button>
                    <Button size="sm">작게</Button>
                    <Button>기본</Button>
                    <Button size="lg">크게</Button>
                    <Button variant="outline">아웃라인</Button>
                    <Button variant="secondary">세컨더리</Button>
                    <Button variant="ghost">고스트</Button>
                    <Button variant="destructive">삭제</Button>
                    <Button variant="link">링크</Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge>기본</Badge>
                    <Badge variant="secondary">세컨더리</Badge>
                    <Badge variant="outline">아웃라인</Badge>
                    <Badge variant="destructive">위험</Badge>
                    <KbdGroup>
                        <Kbd>⌘</Kbd>
                        <Kbd>K</Kbd>
                    </KbdGroup>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="specimen-title">제목</Label>
                        <Input id="specimen-title" placeholder="한 줄로 적습니다" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label>상태</Label>
                        <Select items={STATES} defaultValue="draft">
                            <SelectTrigger>
                                <SelectValue placeholder="상태를 고릅니다" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATES.map((state) => (
                                    <SelectItem key={state.value} value={state.value}>{state.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <Label className="flex items-center gap-2">
                        <Checkbox defaultChecked /> 검토를 기다립니다
                    </Label>
                    <Label className="flex items-center gap-2">
                        <Switch defaultChecked /> 알림
                    </Label>
                    <Label className="flex items-center gap-2">
                        <Switch size="sm" /> 작은 스위치
                    </Label>
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline" />}>메뉴 열기</DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {/* ⚠ Label(Menu.GroupLabel)은 Group 안에서만 선다. 밖에 두면 Base UI 가 화면 전체를 죽인다 */}
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>항목</DropdownMenuLabel>
                                <DropdownMenuItem>
                                    검토로 옮기기
                                    <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                                </DropdownMenuItem>
                                <DropdownMenuItem>복제하기</DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive">삭제하기</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog>
                        <DialogTrigger render={<Button variant="outline" />}>대화 상자 열기</DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>항목을 삭제합니까</DialogTitle>
                                <DialogDescription>
                                    삭제한 항목은 되돌릴 수 없습니다.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline">취소</Button>
                                <Button variant="destructive">삭제</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Alert>
                    <AlertTitle>알림 제목</AlertTitle>
                    <AlertDescription>
                        알림 본문은 면의 여백과 글자 크기가 mira 와 같은지 보는 자리입니다.
                    </AlertDescription>
                </Alert>

                <Tabs defaultValue="table">
                    <TabsList>
                        <TabsTrigger value="table">표</TabsTrigger>
                        <TabsTrigger value="empty">빈 상태</TabsTrigger>
                    </TabsList>
                    <TabsContent value="table">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>제목</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead>담당</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>첫 번째 항목</TableCell>
                                    <TableCell><Badge variant="outline">초안</Badge></TableCell>
                                    <TableCell>—</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>두 번째 항목</TableCell>
                                    <TableCell><Badge variant="outline">완료</Badge></TableCell>
                                    <TableCell>—</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TabsContent>
                    <TabsContent value="empty">
                        <p className="text-muted-foreground">아직 행이 없습니다.</p>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    </div>
);
