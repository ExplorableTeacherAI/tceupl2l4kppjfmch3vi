import React, { useRef, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { SplitLayout, StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp } from "@/lib/motion";
import {
    clozePropsFromDefinition,
    getVariableInfo,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";
import {
    ACCENT,
    ACCENT_RESULT,
    DragHandle,
    EASE_150,
    Halo,
    HandleShadow,
    INK,
    INK_QUIET,
    INK_STRUCTURE,
    fmtAngle,
    fmtLength,
    svgPointFromEvent,
    useHighlightState,
} from "./complexPlaneShared";

const VIEW_W = 400;
const VIEW_H = 300;
const ORIGIN_X = 200;
const ORIGIN_Y = 150;
const UNIT = 30;

const RADIUS_MIN = 0.6;
const RADIUS_MAX = 2;
const ANGLE_MAX = 120;

const HIGHLIGHT = "polarHighlight";
const DEFAULTS = { zRadius: 1.8, zAngle: 30, wRadius: 1.4, wAngle: 45 };

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const arcPath = (radius: number, from: number, to: number) => {
    const start = {
        x: ORIGIN_X + Math.cos(toRadians(from)) * radius,
        y: ORIGIN_Y - Math.sin(toRadians(from)) * radius,
    };
    const end = {
        x: ORIGIN_X + Math.cos(toRadians(to)) * radius,
        y: ORIGIN_Y - Math.sin(toRadians(to)) * radius,
    };
    const largeArc = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
};

// ── VIEW A: the two numbers and their product on the plane ──────────────────

function PolarPlaneDrawing() {
    const setVar = useSetVar();
    const svgRef = useRef<SVGSVGElement>(null);
    const { opacity, weight, isActive, hoverProps } = useHighlightState(HIGHLIGHT);

    const zRadius = useVar<number>("polarZRadius", DEFAULTS.zRadius);
    const zAngle = useVar<number>("polarZAngle", DEFAULTS.zAngle);
    const wRadius = useVar<number>("polarWRadius", DEFAULTS.wRadius);
    const wAngle = useVar<number>("polarWAngle", DEFAULTS.wAngle);

    const productRadius = zRadius * wRadius;
    const productAngle = zAngle + wAngle;

    const place = (radius: number, angle: number) => ({
        x: ORIGIN_X + Math.cos(toRadians(angle)) * radius * UNIT,
        y: ORIGIN_Y - Math.sin(toRadians(angle)) * radius * UNIT,
    });

    const dragTo = (radiusVar: string, angleVar: string) =>
        (event: React.PointerEvent<SVGCircleElement>) => {
            const point = svgPointFromEvent(event, svgRef.current, VIEW_W, VIEW_H);
            const dx = point.x - ORIGIN_X;
            const dy = ORIGIN_Y - point.y;
            const radius = clamp(Math.hypot(dx, dy) / UNIT, RADIUS_MIN, RADIUS_MAX);
            const angle = clamp((Math.atan2(dy, dx) * 180) / Math.PI, 0, ANGLE_MAX);
            setVar(radiusVar, Math.round(radius * 10) / 10);
            setVar(angleVar, Math.round(angle));
        };

    const z = place(zRadius, zAngle);
    const w = place(wRadius, wAngle);
    const product = place(productRadius, productAngle);

    const spoke = (
        id: string,
        end: { x: number; y: number },
        color: string,
        resting: number,
    ) => (
        <g {...hoverProps("length")} opacity={opacity("length")} style={EASE_150} key={id}>
            <Halo active={isActive("length")}>
                <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={end.x} y2={end.y} stroke={color} strokeWidth={weight("length", resting) + 6} strokeLinecap="round" />
            </Halo>
            <line x1={ORIGIN_X} y1={ORIGIN_Y} x2={end.x} y2={end.y} stroke={color} strokeWidth={weight("length", resting)} strokeLinecap="round" />
        </g>
    );

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full select-none"
            role="img"
            aria-label="Argand plane showing two draggable numbers with their lengths and angles, and their product"
        >
            <defs>
                <HandleShadow id="polar-plane-shadow" />
            </defs>

            <g opacity={opacity("__structure")} style={EASE_150}>
                <line x1={24} y1={ORIGIN_Y} x2={VIEW_W - 24} y2={ORIGIN_Y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <line x1={ORIGIN_X} y1={24} x2={ORIGIN_X} y2={VIEW_H - 24} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <text x={VIEW_W - 24} y={ORIGIN_Y - 10} fill={INK_STRUCTURE} fontSize="12" textAnchor="end">Re</text>
                <text x={ORIGIN_X + 10} y={30} fill={INK_STRUCTURE} fontSize="12" textAnchor="start">Im</text>
            </g>

            {spoke("z-spoke", z, ACCENT, 2.5)}
            {spoke("w-spoke", w, ACCENT, 2.5)}
            {spoke("product-spoke", product, ACCENT_RESULT, 3)}

            {/* ANGLE group — three arcs at three radii so none hides another. */}
            <g {...hoverProps("angle")} opacity={opacity("angle")} style={EASE_150}>
                <Halo active={isActive("angle")}>
                    <path d={arcPath(30, 0, zAngle)} fill="none" stroke={ACCENT} strokeWidth={weight("angle", 2) + 6} strokeLinecap="round" />
                    <path d={arcPath(44, 0, wAngle)} fill="none" stroke={ACCENT} strokeWidth={weight("angle", 2) + 6} strokeLinecap="round" />
                    <path d={arcPath(58, 0, productAngle)} fill="none" stroke={ACCENT_RESULT} strokeWidth={weight("angle", 2.5) + 6} strokeLinecap="round" />
                </Halo>
                <path d={arcPath(30, 0, zAngle)} fill="none" stroke={ACCENT} strokeWidth={weight("angle", 2)} strokeLinecap="round" />
                <path d={arcPath(44, 0, wAngle)} fill="none" stroke={ACCENT} strokeWidth={weight("angle", 2)} strokeLinecap="round" />
                <path d={arcPath(58, 0, productAngle)} fill="none" stroke={ACCENT_RESULT} strokeWidth={weight("angle", 2.5)} strokeLinecap="round" />
            </g>

            <g fontSize="12" opacity={opacity("__labels")} style={EASE_150}>
                <text x={product.x + 12} y={product.y + 4} fill={ACCENT_RESULT}>z·w</text>
                <circle cx={product.x} cy={product.y} r="7" fill={ACCENT_RESULT} />
                <text x={z.x + 14} y={z.y + 4} fill={ACCENT}>z</text>
                <text x={w.x + 14} y={w.y + 4} fill={ACCENT}>w</text>
            </g>

            <g opacity={opacity("__labels")} style={EASE_150}>
                <DragHandle x={z.x} y={z.y} color={ACCENT} shadowId="polar-plane-shadow" onDrag={dragTo("polarZRadius", "polarZAngle")} />
                <DragHandle x={w.x} y={w.y} color={ACCENT} shadowId="polar-plane-shadow" onDrag={dragTo("polarWRadius", "polarWAngle")} />
            </g>
        </svg>
    );
}

// ── VIEW B: the same two facts, laid out on two tracks ──────────────────────

const TRACK_X0 = 44;
const TRACK_X1 = 372;
const ANGLE_TRACK_Y = 100;
const LENGTH_BAR_Y = 206;
const GHOST_BAR_Y = 232;
const LENGTH_MAX = 4;

const xForAngle = (angle: number) => TRACK_X0 + (angle / 240) * (TRACK_X1 - TRACK_X0);
const xForLength = (value: number) => TRACK_X0 + (value / LENGTH_MAX) * (TRACK_X1 - TRACK_X0);
const clampCenter = (x: number, halfWidth: number) => clamp(x, 24 + halfWidth, VIEW_W - 24 - halfWidth);

function PolarTracksDrawing() {
    const setVar = useSetVar();
    const svgRef = useRef<SVGSVGElement>(null);
    const { opacity, weight, isActive, hoverProps } = useHighlightState(HIGHLIGHT);

    const zRadius = useVar<number>("polarZRadius", DEFAULTS.zRadius);
    const zAngle = useVar<number>("polarZAngle", DEFAULTS.zAngle);
    const wRadius = useVar<number>("polarWRadius", DEFAULTS.wRadius);
    const wAngle = useVar<number>("polarWAngle", DEFAULTS.wAngle);

    const productAngle = zAngle + wAngle;
    const productRadius = zRadius * wRadius;

    const dragAngleTotal = (event: React.PointerEvent<SVGCircleElement>) => {
        const point = svgPointFromEvent(event, svgRef.current, VIEW_W, VIEW_H);
        const total = ((point.x - TRACK_X0) / (TRACK_X1 - TRACK_X0)) * 240;
        setVar("polarWAngle", Math.round(clamp(total - zAngle, 0, ANGLE_MAX)));
    };

    const dragLengthTotal = (event: React.PointerEvent<SVGCircleElement>) => {
        const point = svgPointFromEvent(event, svgRef.current, VIEW_W, VIEW_H);
        const total = ((point.x - TRACK_X0) / (TRACK_X1 - TRACK_X0)) * LENGTH_MAX;
        setVar("polarWRadius", Math.round(clamp(total / zRadius, RADIUS_MIN, RADIUS_MAX) * 10) / 10);
    };

    const zEnd = xForAngle(zAngle);
    const totalEnd = xForAngle(productAngle);
    const ghostEnd = xForLength(zRadius);
    const productEnd = xForLength(productRadius);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full select-none"
            role="img"
            aria-label="Two tracks: the angles of z and w laid end to end, and the length of z stretched into the length of the product"
        >
            <defs>
                <HandleShadow id="polar-tracks-shadow" />
            </defs>

            {/* ANGLE TRACK — the two angles laid end to end. */}
            <g {...hoverProps("angle")} opacity={opacity("angle")} style={EASE_150}>
                <text x="24" y="52" fill={INK} fontSize="12">angles add</text>
                <line x1={TRACK_X0} y1={ANGLE_TRACK_Y} x2={TRACK_X1} y2={ANGLE_TRACK_Y} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
                <text x={TRACK_X0} y={ANGLE_TRACK_Y + 46} fill={INK_QUIET} fontSize="11" textAnchor="middle">0°</text>
                <text x={TRACK_X1} y={ANGLE_TRACK_Y + 46} fill={INK_QUIET} fontSize="11" textAnchor="end">240°</text>

                <Halo active={isActive("angle")}>
                    <line x1={TRACK_X0} y1={ANGLE_TRACK_Y} x2={zEnd} y2={ANGLE_TRACK_Y} stroke={ACCENT} strokeWidth={weight("angle", 3) + 6} strokeLinecap="round" />
                    <line x1={zEnd + 4} y1={ANGLE_TRACK_Y} x2={totalEnd} y2={ANGLE_TRACK_Y} stroke={ACCENT} strokeWidth={weight("angle", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={TRACK_X0} y1={ANGLE_TRACK_Y} x2={zEnd} y2={ANGLE_TRACK_Y} stroke={ACCENT} strokeWidth={weight("angle", 3)} strokeLinecap="round" />
                <line x1={zEnd + 4} y1={ANGLE_TRACK_Y} x2={totalEnd} y2={ANGLE_TRACK_Y} stroke={ACCENT} strokeWidth={weight("angle", 3)} strokeLinecap="round" />

                <text x={clampCenter((TRACK_X0 + zEnd) / 2, 30)} y={ANGLE_TRACK_Y - 12} fill={ACCENT} fontSize="11" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`z: ${fmtAngle(zAngle)}`}
                </text>
                <text x={clampCenter((zEnd + totalEnd) / 2, 30)} y={ANGLE_TRACK_Y + 22} fill={ACCENT} fontSize="11" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`w: ${fmtAngle(wAngle)}`}
                </text>

                {/* The total, in the product's colour. */}
                <line x1={totalEnd} y1={ANGLE_TRACK_Y - 22} x2={totalEnd} y2={ANGLE_TRACK_Y + 8} stroke={ACCENT_RESULT} strokeWidth="2" strokeLinecap="round" />
                <text x={clampCenter(totalEnd, 44)} y={ANGLE_TRACK_Y - 28} fill={ACCENT_RESULT} fontSize="11" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`z·w: ${fmtAngle(productAngle)}`}
                </text>
                <DragHandle x={totalEnd} y={ANGLE_TRACK_Y} color={ACCENT_RESULT} shadowId="polar-tracks-shadow" radius={7} onDrag={dragAngleTotal} />
            </g>

            {/* LENGTH TRACK — the length of z, stretched by the length of w. */}
            <g {...hoverProps("length")} opacity={opacity("length")} style={EASE_150}>
                <text x="24" y="170" fill={INK} fontSize="12">lengths multiply</text>
                <text x={TRACK_X0} y={LENGTH_BAR_Y - 12} fill={ACCENT_RESULT} fontSize="11" textAnchor="start" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`z·w: ${fmtLength(productRadius)}`}
                </text>
                <Halo active={isActive("length")}>
                    <line x1={TRACK_X0} y1={LENGTH_BAR_Y} x2={productEnd} y2={LENGTH_BAR_Y} stroke={ACCENT_RESULT} strokeWidth={weight("length", 3) + 6} strokeLinecap="round" />
                </Halo>
                <line x1={TRACK_X0} y1={LENGTH_BAR_Y} x2={productEnd} y2={LENGTH_BAR_Y} stroke={ACCENT_RESULT} strokeWidth={weight("length", 3)} strokeLinecap="round" />

                {/* The before-state: the length of z, still visible underneath. */}
                <line x1={TRACK_X0} y1={GHOST_BAR_Y} x2={ghostEnd} y2={GHOST_BAR_Y} stroke={ACCENT} strokeWidth={weight("length", 3)} strokeLinecap="round" opacity={0.55} />
                <text x={TRACK_X0} y={GHOST_BAR_Y + 20} fill={ACCENT} fontSize="11" textAnchor="start" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`z: ${fmtLength(zRadius)}`}
                </text>

                {/* Where z's own length reached — the before-state, still visible. */}
                <line x1={ghostEnd} y1={LENGTH_BAR_Y - 10} x2={ghostEnd} y2={GHOST_BAR_Y + 8} stroke={INK_QUIET} strokeWidth="1.5" strokeDasharray="3 4" />
                <text x={clampCenter((ghostEnd + productEnd) / 2, 36)} y={GHOST_BAR_Y - 8} fill={INK_STRUCTURE} fontSize="11" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {`× w = ${fmtLength(wRadius)}`}
                </text>
                <DragHandle x={productEnd} y={LENGTH_BAR_Y} color={ACCENT_RESULT} shadowId="polar-tracks-shadow" radius={7} onDrag={dragLengthTotal} />
            </g>
        </svg>
    );
}

function PolarPlaneFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="polar-plane"
            onReset={() => {
                setVar("polarZRadius", DEFAULTS.zRadius);
                setVar("polarZAngle", DEFAULTS.zAngle);
                setVar("polarWRadius", DEFAULTS.wRadius);
                setVar("polarWAngle", DEFAULTS.wAngle);
                setVar(HIGHLIGHT, "");
            }}
            caption="Drag z or w. Each one has a length from the origin and an angle from the real axis, and the product responds to both."
        >
            <PolarPlaneDrawing />
            <InteractionHintSequence
                hintKey="polar-plane-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Drag z around and outwards",
                        position: { x: "62%", y: "38%" },
                        dragPath: { type: "arc", startAngle: -30, endAngle: -80, radius: 34 },
                    },
                ]}
            />
        </Figure>
    );
}

function PolarTracksFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="polar-tracks"
            onReset={() => {
                setVar("polarWRadius", DEFAULTS.wRadius);
                setVar("polarWAngle", DEFAULTS.wAngle);
                setVar(HIGHLIGHT, "");
            }}
            caption="The same two numbers as tracks. Drag either indigo end marker: you are moving the product itself, and w follows."
        >
            <PolarTracksDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="polarWAngle"
                    label="Angle of w"
                    {...numberPropsFromDefinition(getVariableInfo('polarWAngle'))}
                    formatValue={fmtAngle}
                />
            </div>
            <InteractionHintSequence
                hintKey="polar-tracks-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the indigo end marker along the track",
                        position: { x: "37%", y: "33%" },
                        dragPath: { type: "line", startOffset: { x: -26, y: 0 }, endOffset: { x: 26, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const complexPolarBlocks: ReactElement[] = [
    <StackLayout key="layout-polar-heading" maxWidth="xl">
        <Block id="polar-heading" padding="md">
            <EditableH2 id="h2-polar-heading" blockId="polar-heading">
                Lengths Multiply, Angles Add
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-polar-setup" maxWidth="xl">
        <Block id="polar-setup" padding="sm">
            <EditableParagraph id="para-polar-setup" blockId="polar-setup">
                Every complex number carries two facts: a{" "}
                <InlineLinkedHighlight
                    varName="polarHighlight"
                    highlightId="length"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('polarHighlight'))}
                >
                    length
                </InlineLinkedHighlight>{" "}
                from the origin and an{" "}
                <InlineLinkedHighlight
                    varName="polarHighlight"
                    highlightId="angle"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('polarHighlight'))}
                >
                    angle
                </InlineLinkedHighlight>{" "}
                from the real axis, and w is sitting at{" "}
                <InlineScrubbleNumber
                    varName="polarWAngle"
                    {...numberPropsFromDefinition(getVariableInfo('polarWAngle'))}
                    formatValue={fmtAngle}
                />{" "}
                right now. Drag z or w on the plane, or pull the indigo markers on the tracks
                beside it, and follow what happens to each of those two facts for the product.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-polar-pair" ratio="1:1" gap="lg" align="start">
        <Block id="polar-plane-figure" padding="sm" hasVisualization>
            <PolarPlaneFigure />
        </Block>
        <Block id="polar-tracks-figure" padding="sm" hasVisualization>
            <PolarTracksFigure />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-polar-reflect" maxWidth="xl">
        <Block id="polar-reflect" padding="sm">
            <EditableParagraph id="para-polar-reflect" blockId="polar-reflect">
                The product's angle is never the two angles multiplied together; the second angle
                simply carries on where the first one stopped. Its length is never the two lengths
                added; w stretches z the way a scale factor does. That is the whole of complex
                multiplication, and multiplying by i was just the case with length 1 and angle 90°.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-polar-question-length" maxWidth="xl">
        <Block id="polar-question-length" padding="md">
            <EditableParagraph id="para-polar-question-length" blockId="polar-question-length">
                Take z with length 3 at an angle of 40°, and w with length 2 at an angle of 25°.
                Their product has length{" "}
                <InlineFeedback
                    varName="answer_polar_modulus"
                    correctValue="6"
                    position="terminal"
                    successMessage="— yes, 3 × 2, because w stretches z by its own length"
                    failureMessage="— 5 would be the answer if lengths added, but watch the stretch on the track."
                    hint="w acts as a scale factor of 2 on the length of z"
                    reviewBlockId="polar-tracks-figure"
                >
                    <InlineClozeInput
                        varName="answer_polar_modulus"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getVariableInfo('answer_polar_modulus'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-polar-question-angle" maxWidth="xl">
        <Block id="polar-question-angle" padding="md">
            <EditableParagraph id="para-polar-question-angle" blockId="polar-question-angle">
                For those same two numbers, the angle of the product is{" "}
                <InlineFeedback
                    varName="answer_polar_argument"
                    correctValue={["65", "65°"]}
                    position="terminal"
                    successMessage="— exactly, 40° then a further 25°, one turn continuing where the other finished"
                    failureMessage="— multiplying the angles gives 1000°, which would spin the product several times round; angles do not multiply."
                    hint="The second angle starts from wherever the first one ended"
                    reviewBlockId="polar-tracks-figure"
                    visualizationHint={{
                        blockId: "polar-tracks-figure",
                        hintKey: "polar-angle-hint",
                        label: "Discover it yourself",
                        resetVars: { polarZAngle: 40, polarWAngle: 0, polarZRadius: 1.5, polarWRadius: 1.2 },
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Drag the indigo marker right until w reaches 25° — read the total",
                                position: { x: "28%", y: "33%" },
                                completionVar: "polarWAngle",
                                completionValue: 25,
                                completionTolerance: 3,
                            },
                            {
                                gesture: "drag-horizontal",
                                label: "Push it further: the total is always the first angle plus the second",
                                position: { x: "42%", y: "33%" },
                                completionVar: "polarWAngle",
                                completionValue: 70,
                                completionTolerance: 12,
                            },
                        ],
                    }}
                >
                    <InlineClozeInput
                        varName="answer_polar_argument"
                        correctAnswer={["65", "65°"]}
                        {...clozePropsFromDefinition(getVariableInfo('answer_polar_argument'))}
                    />
                </InlineFeedback>{" "}
                degrees.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
