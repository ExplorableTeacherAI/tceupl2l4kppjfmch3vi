import React, { useRef, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineScrubbleNumber,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp } from "@/lib/motion";
import {
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    getVariableInfo,
    numberPropsFromDefinition,
} from "../variables";
import {
    ACCENT,
    ACCENT_RESULT,
    DragHandle,
    EASE_150,
    FigureButton,
    HandleShadow,
    INK_QUIET,
    INK_STRUCTURE,
    PlaneAxes,
    fmtComplex,
    fmtLength,
    makePlane,
    svgPointFromEvent,
} from "./complexPlaneShared";

const VIEW_W = 560;
const VIEW_H = 400;
const PLANE = makePlane(VIEW_W, VIEW_H, 280, 180, 28);
const FACTOR_LIMIT = 2.25;
const GUESS_LIMIT = 5.2;
const SHADOW = "product-handle-shadow";

const DEFAULTS = {
    zReal: 2,
    zImag: 1,
    wReal: 1,
    wImag: 2,
    guessReal: 2.6,
    guessImag: -1.2,
};

/** Arrow from the origin to a point, stopping short so the handle stays clear. */
function OriginArrow({
    x,
    y,
    color,
    markerId,
    weight = 2.5,
}: {
    x: number;
    y: number;
    color: string;
    markerId: string;
    weight?: number;
}) {
    const dx = x - PLANE.originX;
    const dy = y - PLANE.originY;
    const length = Math.hypot(dx, dy);
    if (length < 14) return null;
    const shortened = Math.max(length - 12, 0) / length;
    return (
        <line
            x1={PLANE.originX}
            y1={PLANE.originY}
            x2={PLANE.originX + dx * shortened}
            y2={PLANE.originY + dy * shortened}
            stroke={color}
            strokeWidth={weight}
            strokeLinecap="round"
            markerEnd={`url(#${markerId})`}
        />
    );
}

/** Live length readout, floated just off the middle of its own arrow. */
function MagnitudeLabel({
    x,
    y,
    color,
    text,
}: {
    x: number;
    y: number;
    color: string;
    text: string;
}) {
    const dx = x - PLANE.originX;
    const dy = y - PLANE.originY;
    const length = Math.hypot(dx, dy) || 1;
    const offsetX = (-dy / length) * 16;
    const offsetY = (dx / length) * 16;
    const halfWidth = text.length * 3.4;
    const labelX = clamp(PLANE.originX + dx / 2 + offsetX, 24 + halfWidth, VIEW_W - 24 - halfWidth);
    const labelY = clamp(PLANE.originY + dy / 2 + offsetY, 36, 336);
    return (
        <text
            x={labelX}
            y={labelY}
            fill={color}
            fontSize="11"
            textAnchor="middle"
            style={{ fontVariantNumeric: "tabular-nums" }}
        >
            {text}
        </text>
    );
}

const sideLabel = (x: number, textWidth: number) =>
    x + 14 + textWidth > VIEW_W - 24
        ? { anchor: "end" as const, dx: -14 }
        : { anchor: "start" as const, dx: 14 };

function ProductDrawing() {
    const setVar = useSetVar();
    const svgRef = useRef<SVGSVGElement>(null);

    const zReal = useVar<number>("productZReal", DEFAULTS.zReal);
    const zImag = useVar<number>("productZImag", DEFAULTS.zImag);
    const wReal = useVar<number>("productWReal", DEFAULTS.wReal);
    const wImag = useVar<number>("productWImag", DEFAULTS.wImag);
    const guessReal = useVar<number>("productGuessReal", DEFAULTS.guessReal);
    const guessImag = useVar<number>("productGuessImag", DEFAULTS.guessImag);
    const revealed = useVar<boolean>("productRevealed", false);

    const dragTo = (realVar: string, imagVar: string, limit: number) =>
        (event: React.PointerEvent<SVGCircleElement>) => {
            const point = svgPointFromEvent(event, svgRef.current, VIEW_W, VIEW_H);
            let nextReal = PLANE.toRe(point.x);
            let nextImag = PLANE.toIm(point.y);
            const reach = Math.hypot(nextReal, nextImag);
            if (reach > limit) {
                nextReal = (nextReal / reach) * limit;
                nextImag = (nextImag / reach) * limit;
            }
            setVar(realVar, Math.round(clamp(nextReal, -limit, limit) * 10) / 10);
            setVar(imagVar, Math.round(clamp(nextImag, -limit, limit) * 10) / 10);
        };

    // The real product, straight from the definition of complex multiplication.
    const productReal = zReal * wReal - zImag * wImag;
    const productImag = zReal * wImag + zImag * wReal;
    // What multiplying the parts separately would give — the misconception, drawn.
    const partsReal = zReal * wReal;
    const partsImag = zImag * wImag;

    const zx = PLANE.toX(zReal);
    const zy = PLANE.toY(zImag);
    const wx = PLANE.toX(wReal);
    const wy = PLANE.toY(wImag);
    const px = PLANE.toX(productReal);
    const py = PLANE.toY(productImag);
    const partsX = PLANE.toX(partsReal);
    const partsY = PLANE.toY(partsImag);
    const gx = PLANE.toX(guessReal);
    const gy = PLANE.toY(guessImag);

    const zLabel = sideLabel(zx, 10);
    const wLabel = sideLabel(wx, 12);
    const pLabel = sideLabel(px, 26);
    const gLabel = sideLabel(gx, 38);
    const partsLabel = sideLabel(partsX, 36);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full select-none"
            role="img"
            aria-label="Argand plane with two draggable numbers, a draggable prediction marker, and the revealed product"
        >
            <defs>
                <HandleShadow id={SHADOW} />
                <marker id="product-arrow-factor" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill={ACCENT} />
                </marker>
                <marker id="product-arrow-result" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1 L 9 5 L 0 9 z" fill={ACCENT_RESULT} />
                </marker>
            </defs>

            <PlaneAxes plane={PLANE} ticks={[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]} />

            <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x="24" y="350" fill={ACCENT}>{`z = ${fmtComplex(zReal, zImag)}`}</text>
                <text x={VIEW_W - 24} y="350" fill={ACCENT} textAnchor="end">
                    {`w = ${fmtComplex(wReal, wImag)}`}
                </text>
                {revealed && (
                    <>
                        <text x="24" y="372" fill={INK_STRUCTURE}>
                            {`parts × parts = ${fmtComplex(partsReal, partsImag)}`}
                        </text>
                        <text x={VIEW_W - 24} y="372" fill={ACCENT_RESULT} textAnchor="end">
                            {`z·w = ${fmtComplex(productReal, productImag)}`}
                        </text>
                    </>
                )}
            </g>

            {/* Each number, drawn as an arrow out of the origin with its live length. */}
            <g style={EASE_150}>
                <OriginArrow x={zx} y={zy} color={ACCENT} markerId="product-arrow-factor" />
                <OriginArrow x={wx} y={wy} color={ACCENT} markerId="product-arrow-factor" />
                <MagnitudeLabel x={zx} y={zy} color={ACCENT} text={`|z| = ${fmtLength(Math.hypot(zReal, zImag))}`} />
                <MagnitudeLabel x={wx} y={wy} color={ACCENT} text={`|w| = ${fmtLength(Math.hypot(wReal, wImag))}`} />
            </g>

            {revealed && (
                <g style={EASE_150}>
                    {/* The gap between the two answers, drawn as a thin dotted span. */}
                    <line x1={partsX} y1={partsY} x2={px} y2={py} stroke={INK_QUIET} strokeWidth="1.5" strokeDasharray="3 5" />
                    <circle cx={partsX} cy={partsY} r="7" fill="#FFFFFF" stroke={INK_STRUCTURE} strokeWidth="2" />
                    <text x={partsX + partsLabel.dx} y={partsY + 4} fill={INK_STRUCTURE} fontSize="12" textAnchor={partsLabel.anchor}>
                        parts
                    </text>
                </g>
            )}

            {/* The prediction — dashed, ink grey. */}
            <g>
                <text x={gx + gLabel.dx} y={gy + 4} fill={INK_STRUCTURE} fontSize="12" textAnchor={gLabel.anchor}>
                    guess
                </text>
                <DragHandle x={gx} y={gy} color={INK_STRUCTURE} hollow shadowId={SHADOW} onDrag={dragTo("productGuessReal", "productGuessImag", GUESS_LIMIT)} />
            </g>

            {revealed && (
                <g style={EASE_150}>
                    <OriginArrow x={px} y={py} color={ACCENT_RESULT} markerId="product-arrow-result" weight={3} />
                    <MagnitudeLabel x={px} y={py} color={ACCENT_RESULT} text={`|z·w| = ${fmtLength(Math.hypot(productReal, productImag))}`} />
                    <circle cx={px} cy={py} r="8" fill={ACCENT_RESULT} filter={`url(#${SHADOW})`} />
                    <text x={px + pLabel.dx} y={py + 4} fill={ACCENT_RESULT} fontSize="12" textAnchor={pLabel.anchor}>
                        z·w
                    </text>
                </g>
            )}

            <g>
                <text x={zx + zLabel.dx} y={zy + 4} fill={ACCENT} fontSize="12" textAnchor={zLabel.anchor}>
                    z
                </text>
                <DragHandle x={zx} y={zy} color={ACCENT} shadowId={SHADOW} onDrag={dragTo("productZReal", "productZImag", FACTOR_LIMIT)} />
            </g>
            <g>
                <text x={wx + wLabel.dx} y={wy + 4} fill={ACCENT} fontSize="12" textAnchor={wLabel.anchor}>
                    w
                </text>
                <DragHandle x={wx} y={wy} color={ACCENT} shadowId={SHADOW} onDrag={dragTo("productWReal", "productWImag", FACTOR_LIMIT)} />
            </g>
        </svg>
    );
}

function ProductStatus() {
    const zReal = useVar<number>("productZReal", DEFAULTS.zReal);
    const zImag = useVar<number>("productZImag", DEFAULTS.zImag);
    const wReal = useVar<number>("productWReal", DEFAULTS.wReal);
    const wImag = useVar<number>("productWImag", DEFAULTS.wImag);
    const guessReal = useVar<number>("productGuessReal", DEFAULTS.guessReal);
    const guessImag = useVar<number>("productGuessImag", DEFAULTS.guessImag);
    const revealed = useVar<boolean>("productRevealed", false);

    if (!revealed) {
        return <span className="text-[13px] text-slate-500">Place your guess, then reveal.</span>;
    }
    const miss = Math.hypot(
        guessReal - (zReal * wReal - zImag * wImag),
        guessImag - (zReal * wImag + zImag * wReal),
    );
    if (miss < 0.6) {
        return <span className="text-[13px] font-medium" style={{ color: "#22c55e" }}>Your marker is right on it.</span>;
    }
    return (
        <span className="text-[13px] text-slate-500">
            Your marker is {miss.toFixed(1)} units from the product.
        </span>
    );
}

function ProductFigure() {
    const setVar = useSetVar();
    const revealed = useVar<boolean>("productRevealed", false);
    return (
        <Figure
            id="product-plane"
            onReset={() => {
                setVar("productZReal", DEFAULTS.zReal);
                setVar("productZImag", DEFAULTS.zImag);
                setVar("productWReal", DEFAULTS.wReal);
                setVar("productWImag", DEFAULTS.wImag);
                setVar("productGuessReal", DEFAULTS.guessReal);
                setVar("productGuessImag", DEFAULTS.guessImag);
                setVar("productRevealed", false);
            }}
            caption="Drag the dashed marker to your prediction for z·w, then reveal. Drag either teal point too: each arrow reports its own length as it moves."
        >
            <ProductDrawing />
            <div className="flex items-center gap-3 px-6 pb-5">
                <FigureButton tone={revealed ? "quiet" : "accent"} onClick={() => setVar("productRevealed", !revealed)}>
                    {revealed ? "Hide the answer" : "Reveal z·w"}
                </FigureButton>
                <ProductStatus />
            </div>
            <InteractionHintSequence
                hintKey="product-guess-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the dashed marker to your prediction",
                        position: { x: "63%", y: "53%" },
                        dragPath: { type: "line", startOffset: { x: -22, y: 12 }, endOffset: { x: 22, y: -12 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const complexProductBlocks: ReactElement[] = [
    <StackLayout key="layout-product-heading" maxWidth="xl">
        <Block id="product-heading" padding="md">
            <EditableH2 id="h2-product-heading" blockId="product-heading">
                Why You Can't Just Multiply the Parts
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-product-setup" maxWidth="xl">
        <Block id="product-setup" padding="sm">
            <EditableParagraph id="para-product-setup" blockId="product-setup">
                Now two ordinary numbers: z ={" "}
                <InlineScrubbleNumber varName="productZReal" {...numberPropsFromDefinition(getVariableInfo('productZReal'))} formatValue={(value) => value.toFixed(1)} />
                {" "}+{" "}
                <InlineScrubbleNumber varName="productZImag" {...numberPropsFromDefinition(getVariableInfo('productZImag'))} formatValue={(value) => value.toFixed(1)} />
                i and w ={" "}
                <InlineScrubbleNumber varName="productWReal" {...numberPropsFromDefinition(getVariableInfo('productWReal'))} formatValue={(value) => value.toFixed(1)} />
                {" "}+{" "}
                <InlineScrubbleNumber varName="productWImag" {...numberPropsFromDefinition(getVariableInfo('productWImag'))} formatValue={(value) => value.toFixed(1)} />
                i. The tempting move is to multiply the real parts together, multiply the
                imaginary parts together, and call it done. Put your guess for z·w on the plane
                first, then reveal where it truly lands.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-product-figure" maxWidth="xl">
        <Block id="product-figure" padding="sm" hasVisualization>
            <ProductFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-product-reflect" maxWidth="xl">
        <Block id="product-reflect" padding="sm">
            <EditableParagraph id="para-product-reflect" blockId="product-reflect">
                The hollow marker labelled parts shows what multiplying the pieces separately
                would give, and the real product sits somewhere else entirely. Drag either teal
                point and the two answers keep disagreeing. Each number acts on the other as a
                whole, so splitting them into real and imaginary pieces destroys what
                multiplication is actually doing.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-product-question-square" maxWidth="xl">
        <Block id="product-question-square" padding="md">
            <EditableParagraph id="para-product-question-square" blockId="product-question-square">
                Two numbers sit on the imaginary axis: 2i and 3i. Their product is{" "}
                <InlineFeedback
                    varName="answer_product_square"
                    correctValue="-6"
                    position="terminal"
                    successMessage="— right, and notice it is not even on the imaginary axis any more: two numbers pointing straight up produce one pointing left"
                    failureMessage="— 6i is what multiplying the parts separately gives, and that is exactly the trap."
                    hint="Each of these is a quarter turn away from the real axis, so together they are a half turn, and 2 × 3 = 6"
                    reviewBlockId="product-figure"
                    visualizationHint={{
                        blockId: "product-figure",
                        hintKey: "product-imaginary-hint",
                        label: "Discover it yourself",
                        resetVars: { productZReal: 2, productZImag: 1, productWReal: 1, productWImag: 2, productRevealed: true },
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag w sideways onto the imaginary axis, straight above the origin",
                                position: { x: "55%", y: "31%" },
                                completionVar: "productWReal",
                                completionValue: 0,
                                completionTolerance: 0.25,
                            },
                            {
                                gesture: "drag",
                                label: "Now bring z onto the imaginary axis too — the product swings onto the negative real axis",
                                position: { x: "60%", y: "38%" },
                                completionVar: "productZReal",
                                completionValue: 0,
                                completionTolerance: 0.25,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_product_square"
                        correctAnswer="-6"
                        options={["6i", "-6", "6", "-6i"]}
                        {...choicePropsFromDefinition(getVariableInfo('answer_product_square'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-product-question-real" maxWidth="xl">
        <Block id="product-question-real" padding="md">
            <EditableParagraph id="para-product-question-real" blockId="product-question-real">
                Multiplying 1 + 3i by the plain real number 2 gives{" "}
                <InlineFeedback
                    varName="answer_product_real"
                    correctValue={["2+6i", "2 + 6i", "6i+2", "6i + 2"]}
                    position="terminal"
                    successMessage="— exactly, a real multiplier moves both parts, pushing the whole point twice as far from the origin"
                    failureMessage="— careful, the 2 does not act on the real part alone."
                    hint="Write the multiplier as 2 + 0i and ask what it does to the point as a whole, not to one piece of it"
                    reviewBlockId="product-figure"
                >
                    <InlineClozeInput
                        varName="answer_product_real"
                        correctAnswer={["2+6i", "2 + 6i", "6i+2", "6i + 2"]}
                        {...clozePropsFromDefinition(getVariableInfo('answer_product_real'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
