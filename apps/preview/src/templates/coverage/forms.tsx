import { Check, Info, Minus, Search, X } from "@tyohnn/icons";

import { Checkbox } from "@tyohnn/components/checkbox";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSeparator,
    FieldSet,
    FieldTitle,
} from "@tyohnn/components/field";
import { Input } from "@tyohnn/components/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@tyohnn/components/input-group";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@tyohnn/components/input-otp";
import { Kbd } from "@tyohnn/components/kbd";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@tyohnn/components/native-select";
import { Progress, ProgressLabel, ProgressValue } from "@tyohnn/components/progress";
import { RadioGroup, RadioGroupItem } from "@tyohnn/components/radio-group";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@tyohnn/components/select";
import { Slider } from "@tyohnn/components/slider";
import { Spinner } from "@tyohnn/components/spinner";
import { Switch } from "@tyohnn/components/switch";
import { Textarea } from "@tyohnn/components/textarea";

import { type CoverageSection, Row } from "./frame";

const FRUITS = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "grapes", label: "Grapes" },
];

const VEGETABLES = [
    { value: "carrot", label: "Carrot" },
    { value: "leek", label: "Leek", disabled: true },
];

export const formSections: CoverageSection[] = [
    {
        name: "input-textarea",
        components: ["input", "textarea"],
        render: () => (
            <>
                <Row label="Input · default · value · disabled · invalid · file" className="grid w-[900px] grid-cols-3 gap-3">
                    <Input placeholder="Placeholder" />
                    <Input defaultValue="Filled value" />
                    <Input type="password" defaultValue="secret" />
                    <Input placeholder="Disabled" disabled />
                    <Input defaultValue="Invalid" aria-invalid />
                    <Input type="file" />
                </Row>
                <Row label="Textarea · default · disabled · invalid" className="grid w-[900px] grid-cols-3 gap-3">
                    <Textarea placeholder="Type your message here." />
                    <Textarea placeholder="Disabled" disabled />
                    <Textarea defaultValue="Invalid" aria-invalid />
                </Row>
            </>
        ),
    },
    {
        name: "checkbox-radio-switch",
        components: ["checkbox", "radio-group", "switch", "slider", "progress"],
        render: () => (
            <>
                <Row label="Checkbox · unchecked · checked · indeterminate · disabled · invalid">
                    <Checkbox aria-label="unchecked" />
                    <Checkbox aria-label="checked" defaultChecked />
                    <Checkbox aria-label="indeterminate" indeterminate />
                    <Checkbox aria-label="disabled" disabled />
                    <Checkbox aria-label="disabled checked" disabled defaultChecked />
                    <Checkbox aria-label="invalid" aria-invalid />
                    <Checkbox aria-label="invalid checked" aria-invalid defaultChecked />
                </Row>
                <Row label="Radio group · vertical · horizontal · disabled · invalid">
                    <RadioGroup defaultValue="comfortable">
                        <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="default" />Default</label>
                        <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="comfortable" />Comfortable</label>
                        <label className="flex items-center gap-2 text-sm"><RadioGroupItem value="compact" disabled />Compact</label>
                    </RadioGroup>
                    <RadioGroup defaultValue="b" className="flex">
                        <RadioGroupItem value="a" aria-label="a" />
                        <RadioGroupItem value="b" aria-label="b" />
                        <RadioGroupItem value="c" aria-label="c" aria-invalid />
                    </RadioGroup>
                    <RadioGroup defaultValue="x" disabled>
                        <RadioGroupItem value="x" aria-label="x" />
                    </RadioGroup>
                </Row>
                <Row label="Switch · sizes · checked · disabled · invalid">
                    <Switch aria-label="off" />
                    <Switch aria-label="on" defaultChecked />
                    <Switch size="sm" aria-label="small off" />
                    <Switch size="sm" aria-label="small on" defaultChecked />
                    <Switch aria-label="disabled" disabled />
                    <Switch aria-label="disabled on" disabled defaultChecked />
                    <Switch aria-label="invalid" aria-invalid />
                </Row>
                <Row label="Slider · single · range · disabled · vertical" className="flex items-center gap-8">
                    <div className="w-48"><Slider defaultValue={[40]} aria-label="single" /></div>
                    <div className="w-48"><Slider defaultValue={[20, 70]} aria-label="range" /></div>
                    <div className="w-48"><Slider defaultValue={[50]} disabled aria-label="disabled" /></div>
                    <div className="h-32"><Slider defaultValue={[30]} orientation="vertical" aria-label="vertical" /></div>
                </Row>
                <Row label="Progress · plain · with label and value" className="flex w-[600px] flex-col gap-4">
                    <Progress value={33} aria-label="Plain" />
                    <Progress value={66}>
                        <ProgressLabel>Upload</ProgressLabel>
                        <ProgressValue />
                    </Progress>
                </Row>
            </>
        ),
    },
    {
        name: "field",
        components: ["field"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 gap-10">
                <FieldSet>
                    <FieldLegend>Payment method</FieldLegend>
                    <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="coverage-card-name">Name on card</FieldLabel>
                            <Input id="coverage-card-name" placeholder="Evil Rabbit" />
                        </Field>
                        <Field data-invalid>
                            <FieldLabel htmlFor="coverage-card-number">Card number</FieldLabel>
                            <Input id="coverage-card-number" aria-invalid defaultValue="1234" />
                            <FieldDescription>Enter your 16-digit number.</FieldDescription>
                            <FieldError>Card number is too short.</FieldError>
                        </Field>
                        <FieldSeparator>Or continue with</FieldSeparator>
                        <Field orientation="horizontal">
                            <Checkbox id="coverage-same-address" defaultChecked />
                            <FieldLabel htmlFor="coverage-same-address">Same as shipping address</FieldLabel>
                        </Field>
                        <Field orientation="horizontal" data-disabled>
                            <Switch id="coverage-disabled-switch" disabled />
                            <FieldContent>
                                <FieldLabel htmlFor="coverage-disabled-switch">Disabled setting</FieldLabel>
                                <FieldDescription>Unavailable on this plan.</FieldDescription>
                            </FieldContent>
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend variant="label">Notifications</FieldLegend>
                        <RadioGroup defaultValue="all">
                            <FieldLabel htmlFor="coverage-radio-all">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>All messages</FieldTitle>
                                        <FieldDescription>Every new message.</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="all" id="coverage-radio-all" />
                                </Field>
                            </FieldLabel>
                            <FieldLabel htmlFor="coverage-radio-none">
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>Nothing</FieldTitle>
                                        <FieldDescription>Only direct mentions.</FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value="none" id="coverage-radio-none" />
                                </Field>
                            </FieldLabel>
                        </RadioGroup>
                    </FieldSet>
                    <FieldSeparator />
                    <Field orientation="responsive">
                        <FieldContent>
                            <FieldLabel htmlFor="coverage-responsive">Responsive</FieldLabel>
                            <FieldDescription>Row from the md container width.</FieldDescription>
                        </FieldContent>
                        <Input id="coverage-responsive" placeholder="Value" />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="coverage-errors">Errors list</FieldLabel>
                        <Textarea id="coverage-errors" aria-invalid defaultValue="x" />
                        <FieldError errors={[{ message: "Too short." }, { message: "Must contain a digit." }]} />
                    </Field>
                </FieldGroup>
            </div>
        ),
    },
    {
        name: "input-group",
        components: ["input-group"],
        render: () => (
            <div className="grid w-[1000px] grid-cols-2 gap-6">
                <InputGroup>
                    <InputGroupInput placeholder="Search..." />
                    <InputGroupAddon><Search /></InputGroupAddon>
                    <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
                    <InputGroupInput placeholder="example.com" />
                    <InputGroupAddon align="inline-end"><InputGroupText>.com</InputGroupText></InputGroupAddon>
                </InputGroup>
                <InputGroup>
                    <InputGroupInput placeholder="Buttons" />
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton size="xs">Xs</InputGroupButton>
                        <InputGroupButton size="sm" variant="secondary">Sm</InputGroupButton>
                        <InputGroupButton size="icon-xs" aria-label="Clear"><X /></InputGroupButton>
                        <InputGroupButton size="icon-sm" variant="outline" aria-label="Info"><Info /></InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
                <InputGroup data-disabled>
                    <InputGroupInput placeholder="Disabled" disabled />
                    <InputGroupAddon align="inline-end"><Spinner /></InputGroupAddon>
                </InputGroup>
                <InputGroup>
                    <InputGroupInput defaultValue="Invalid" aria-invalid />
                    <InputGroupAddon align="inline-end"><Kbd>⌘K</Kbd></InputGroupAddon>
                </InputGroup>
                <InputGroup>
                    <InputGroupTextarea placeholder="Ask anything" />
                    <InputGroupAddon align="block-start"><InputGroupText>Prompt</InputGroupText></InputGroupAddon>
                    <InputGroupAddon align="block-end">
                        <InputGroupText>0 / 280</InputGroupText>
                        <InputGroupButton size="icon-xs" variant="default" className="ml-auto" aria-label="Send"><Check /></InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        ),
    },
    {
        name: "input-otp",
        components: ["input-otp"],
        render: () => (
            <>
                <Row label="Groups with separator · filled">
                    <InputOTP maxLength={6} value="123" onChange={() => undefined}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </Row>
                <Row label="Disabled · invalid">
                    <InputOTP maxLength={4} disabled>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                        </InputOTPGroup>
                    </InputOTP>
                    <InputOTP maxLength={4} value="12" onChange={() => undefined}>
                        <InputOTPGroup>
                            <InputOTPSlot index={0} aria-invalid />
                            <InputOTPSlot index={1} aria-invalid />
                            <InputOTPSlot index={2} aria-invalid />
                            <InputOTPSlot index={3} aria-invalid />
                        </InputOTPGroup>
                    </InputOTP>
                    <Minus className="size-4" />
                </Row>
            </>
        ),
    },
    {
        name: "native-select",
        components: ["native-select"],
        render: () => (
            <Row label="Default · sm · groups · disabled · invalid">
                <NativeSelect defaultValue="apple" aria-label="default">
                    {FRUITS.map((fruit) => <NativeSelectOption key={fruit.value} value={fruit.value}>{fruit.label}</NativeSelectOption>)}
                </NativeSelect>
                <NativeSelect size="sm" defaultValue="banana" aria-label="small">
                    {FRUITS.map((fruit) => <NativeSelectOption key={fruit.value} value={fruit.value}>{fruit.label}</NativeSelectOption>)}
                </NativeSelect>
                <NativeSelect defaultValue="carrot" aria-label="groups">
                    <NativeSelectOptGroup label="Fruits">
                        {FRUITS.map((fruit) => <NativeSelectOption key={fruit.value} value={fruit.value}>{fruit.label}</NativeSelectOption>)}
                    </NativeSelectOptGroup>
                    <NativeSelectOptGroup label="Vegetables">
                        {VEGETABLES.map((item) => <NativeSelectOption key={item.value} value={item.value} disabled={item.disabled}>{item.label}</NativeSelectOption>)}
                    </NativeSelectOptGroup>
                </NativeSelect>
                <NativeSelect disabled aria-label="disabled">
                    <NativeSelectOption value="">Disabled</NativeSelectOption>
                </NativeSelect>
                <NativeSelect aria-invalid aria-label="invalid">
                    <NativeSelectOption value="">Invalid</NativeSelectOption>
                </NativeSelect>
            </Row>
        ),
    },
    {
        name: "select",
        components: ["select"],
        portals: ['[data-slot="select-content"]'],
        render: (open) => (
            <>
                <Row label="Triggers · default · sm · placeholder · disabled · invalid">
                    <Select items={FRUITS} defaultValue="apple">
                        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {FRUITS.map((fruit) => <SelectItem key={fruit.value} value={fruit.value}>{fruit.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select items={FRUITS} defaultValue="banana">
                        <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {FRUITS.map((fruit) => <SelectItem key={fruit.value} value={fruit.value}>{fruit.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select items={FRUITS}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Pick a fruit" /></SelectTrigger>
                        <SelectContent>
                            {FRUITS.map((fruit) => <SelectItem key={fruit.value} value={fruit.value}>{fruit.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select items={FRUITS} disabled>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Disabled" /></SelectTrigger>
                        <SelectContent>
                            {FRUITS.map((fruit) => <SelectItem key={fruit.value} value={fruit.value}>{fruit.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select items={FRUITS}>
                        <SelectTrigger className="w-40" aria-invalid><SelectValue placeholder="Invalid" /></SelectTrigger>
                        <SelectContent>
                            {FRUITS.map((fruit) => <SelectItem key={fruit.value} value={fruit.value}>{fruit.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Row>
                <Row label="Open · groups · label · separator · disabled item">
                    <Select items={[...FRUITS, ...VEGETABLES]} defaultValue="blueberry" defaultOpen={open}>
                        <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                        <SelectContent alignItemWithTrigger={false}>
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                {FRUITS.map((fruit) => <SelectItem key={fruit.value} value={fruit.value}>{fruit.label}</SelectItem>)}
                            </SelectGroup>
                            <SelectSeparator />
                            <SelectGroup>
                                <SelectLabel>Vegetables</SelectLabel>
                                {VEGETABLES.map((item) => <SelectItem key={item.value} value={item.value} disabled={item.disabled}>{item.label}</SelectItem>)}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Row>
            </>
        ),
    },
];
