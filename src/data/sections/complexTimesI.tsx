import React, { useRef, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
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
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../variables";
import {
    ACCENT,
    ACCENT_RESULT,
    ArrowMarker,
    DragHandle,
    MagnitudeLabel,
    OriginArrow,
    EASE_150,
    FigureButton,
    Halo,
    HandleShadow,
    INK_QUIET,
    INK_STRUCTURE,
    PlaneAxes,
    fmtComplex,
    fmtLength,
    makePlane,
    svgPointFromEvent,
    useHighlightState,
} from "./complexPlaneShared";

const VIEW_W = 560;
const VIEW_H = 400;
const PLANE = makePlane(VIEW_W, VIEW_H, 280, 180, 48);
const LIMIT = 2.8;
const MODULUS_LIMIT = 3.2;
const SHADOW = "times-i-handle-shadow";

const DEFAULTS = { real: 2.8, imag: 1, guessReal: 2.4, guessImag: -2.4 };

function TimesIDrawing() {
    const setVar = useSetVar();
    const svgRef = useRef<SVGSVGElement>(null);
    const { value: highlight, opacity, weight, isActive, hoverProps } = useHighlightState("iTurnHighlight");

    const real = useVar<number>("iTurnReal", DEFAULTS.real);
    const imag = useVar<number>("iTurnImag", DEFAULTS.imag);
    const guessReal = useVar<number>("iTurnGuessReal", DEFAULTS.guessReal);
    const guessImag = useVar<number>("iTurnGuessImag", DEFAULTS.guessImag);
    const revealed = useVar<boolean>("iTurnRevealed", false);

    // Hovering a bound phrase in the prose lights the answer up even before the
    // student presses reveal, so the linked highlight always shows something.
    const showAnswer = revealed || highlight === "length" || highlight === "turn";

    const round = (value: number) => Math.round(clamp(value, -LIMIT, LIMIT) * 10) / 10;

    const dragTo = (realVar: string, imagVar: string) =>
        (event: React.PointerEvent<SVGCircleElement>) => {
            const point = svgPointFromEvent(event, svgRef.current, VIEW_W, VIEW_H);
            let nextReal = PLANE.toRe(point.x);
            let nextImag = PLANE.toIm(point.y);
            // Keep the whole quarter-turn arc inside the drawing surface.
            const reach = Math.hypot(nextReal, nextImag);
            if (reach > MODULUS_LIMIT) {
                nextReal = (nextReal / reach) * MODULUS_LIMIT;
                nextImag = (nextImag / reach) * MODULUS_LIMIT;
            }
            setVar(realVar, round(nextReal));
            setVar(imagVar, round(nextImag));
        };

    const zx = PLANE.toX(real);
    const zy = PLANE.toY(imag);
    // Multiplying by i sends a + bi to -b + ai. The drawing never hard-codes it.
    const productReal = -imag;
    const productImag = real;
    const px = PLANE.toX(productReal);
    const py = PLANE.toY(productImag);
    const gx = PLANE.toX(guessReal);
    const gy = PLANE.toY(guessImag);

    const modulus = Math.hypot(real, imag);
    const pixelRadius = modulus * PLANE.unit;
    const arcPath = `M ${zx} ${zy} A ${pixelRadius} ${pixelRadius} 0 0 0 ${px} ${py}`;
    const midAngle = Math.atan2(imag, real) + Math.PI / 4;
    const labelX = PLANE.originX + Math.cos(midAngle) * pixelRadius * 0.68;
    const labelY = PLANE.originY - Math.sin(midAngle) * pixelRadius * 0.68;

    const sideLabel = (x: number, textWidth: number) =>
        x + 14 + textWidth > VIEW_W - 24
            ? { anchor: "end" as const, dx: -14 }
            : { anchor: "start" as const, dx: 14 };
    const zLabel = sideLabel(zx, 10);
    const pLabel = sideLabel(px, 24);
    const gLabel = sideLabel(gx, 38);

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="block w-full select-none"
            role="img"
            aria-label="Argand plane with a draggable number z, a draggable prediction marker, and the revealed position of i times z"
        >
            <defs>
                <HandleShadow id={SHADOW} />
                <ArrowMarker id="times-i-arrow-z" color={ACCENT} />
                <ArrowMarker id="times-i-arrow-product" color={ACCENT_RESULT} />
            </defs>

            <PlaneAxes plane={PLANE} ticks={[-3, -2, -1, 1, 2, 3]} opacity={opacity("__structure")} />

            {/* Readouts live below the drawing surface, in each quantity's colour. */}
            <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                <text x="24" y="360" fill={ACCENT} opacity={opacity("__z")}>{`z = ${fmtComplex(real, imag)}`}</text>
                {showAnswer && (
                    <text x={VIEW_W - 24} y="360" fill={ACCENT_RESULT} textAnchor="end" opacity={opacity("turn")}>
                        {`i·z = ${fmtComplex(productReal, productImag)}`}
                    </text>
                )}
            </g>

            {/* LENGTH group — every number is an arrow out of the origin, and its
                length is annotated live as the student drags. */}
            <g {...hoverProps("length")} opacity={opacity("length")} style={EASE_150}>
                {showAnswer && (
                    <circle
                        cx={PLANE.originX}
                        cy={PLANE.originY}
                        r={pixelRadius}
                        fill="none"
                        stroke={INK_QUIET}
                        strokeWidth="1.5"
                        strokeDasharray="4 5"
                    />
                )}
                <Halo active={isActive("length")}>
                    <OriginArrow plane={PLANE} x={zx} y={zy} color={ACCENT} weight={weight("length", 2.5) + 6} />
                    {showAnswer && (
                        <OriginArrow plane={PLANE} x={px} y={py} color={ACCENT_RESULT} weight={weight("length", 2.5) + 6} />
                    )}
                </Halo>
                <OriginArrow plane={PLANE} x={zx} y={zy} color={ACCENT} markerId="times-i-arrow-z" weight={weight("length", 2.5)} />
                <MagnitudeLabel plane={PLANE} x={zx} y={zy} color={ACCENT} text={`|z| = ${fmtLength(modulus)}`} />
                {showAnswer && (
                    <>
                        <OriginArrow plane={PLANE} x={px} y={py} color={ACCENT_RESULT} markerId="times-i-arrow-product" weight={weight("length", 2.5)} />
                        <MagnitudeLabel plane={PLANE} x={px} y={py} color={ACCENT_RESULT} text={`|i·z| = ${fmtLength(modulus)}`} />
                    </>
                )}
            </g>

            {/* TURN group — the quarter turn itself, the accent of this figure. */}
            {showAnswer && (
                <g {...hoverProps("turn")} opacity={opacity("turn")} style={EASE_150}>
                    <Halo active={isActive("turn")}>
                        <path d={arcPath} fill="none" stroke={ACCENT_RESULT} strokeWidth={weight("turn", 3) + 6} strokeLinecap="round" />
                    </Halo>
                    <path d={arcPath} fill="none" stroke={ACCENT_RESULT} strokeWidth={weight("turn", 3)} strokeLinecap="round" />
                    <text x={labelX} y={labelY} fill={ACCENT_RESULT} fontSize="12" textAnchor="middle">
                        90°
                    </text>
                </g>
            )}

            {/* The prediction — dashed, ink grey, never coloured like an answer. */}
            <g opacity={opacity("__guess")} style={EASE_150}>
                <text x={gx + gLabel.dx} y={gy + 4} fill={INK_STRUCTURE} fontSize="12" textAnchor={gLabel.anchor}>
                    guess
                </text>
                <DragHandle x={gx} y={gy} color={INK_STRUCTURE} hollow shadowId={SHADOW} onDrag={dragTo("iTurnGuessReal", "iTurnGuessImag")} />
            </g>

            {showAnswer && (
                <g opacity={opacity("turn")} style={EASE_150}>
                    <circle cx={px} cy={py} r="8" fill={ACCENT_RESULT} filter={`url(#${SHADOW})`} />
                    <text x={px + pLabel.dx} y={py + 4} fill={ACCENT_RESULT} fontSize="12" textAnchor={pLabel.anchor}>
                        i·z
                    </text>
                </g>
            )}

            <g opacity={opacity("__z")} style={EASE_150}>
                <text x={zx + zLabel.dx} y={zy + 4} fill={ACCENT} fontSize="12" textAnchor={zLabel.anchor}>
                    z
                </text>
                <DragHandle x={zx} y={zy} color={ACCENT} shadowId={SHADOW} onDrag={dragTo("iTurnReal", "iTurnImag")} />
            </g>
        </svg>
    );
}

function PredictionStatus() {
    const real = useVar<number>("iTurnReal", DEFAULTS.real);
    const imag = useVar<number>("iTurnImag", DEFAULTS.imag);
    const guessReal = useVar<number>("iTurnGuessReal", DEFAULTS.guessReal);
    const guessImag = useVar<number>("iTurnGuessImag", DEFAULTS.guessImag);
    const revealed = useVar<boolean>("iTurnRevealed", false);

    if (!revealed) {
        return <span className="text-[13px] text-slate-500">Place your guess, then reveal.</span>;
    }
    const miss = Math.hypot(guessReal + imag, guessImag - real);
    if (miss < 0.5) {
        return <span className="text-[13px] font-medium" style={{ color: "#22c55e" }}>Your marker is right on it.</span>;
    }
    return (
        <span className="text-[13px] text-slate-500">
            Your marker is {miss.toFixed(1)} units away. Move z and reveal again.
        </span>
    );
}

function TimesIFigure() {
    const setVar = useSetVar();
    const revealed = useVar<boolean>("iTurnRevealed", false);
    return (
        <Figure
            id="times-i-rotation"
            onReset={() => {
                setVar("iTurnReal", DEFAULTS.real);
                setVar("iTurnImag", DEFAULTS.imag);
                setVar("iTurnGuessReal", DEFAULTS.guessReal);
                setVar("iTurnGuessImag", DEFAULTS.guessImag);
                setVar("iTurnRevealed", false);
                setVar("iTurnHighlight", "");
            }}
            caption="Drag the dashed marker to your prediction for i·z, then reveal. The teal arrow follows z as you drag it, reporting its length live."
        >
            <TimesIDrawing />
            <div className="flex items-center gap-3 px-6 pb-5">
                <FigureButton tone={revealed ? "quiet" : "accent"} onClick={() => setVar("iTurnRevealed", !revealed)}>
                    {revealed ? "Hide the answer" : "Reveal i·z"}
                </FigureButton>
                <PredictionStatus />
            </div>
            <InteractionHintSequence
                hintKey="times-i-guess-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag the dashed marker to your prediction",
                        position: { x: "71%", y: "74%" },
                        dragPath: { type: "line", startOffset: { x: -22, y: 14 }, endOffset: { x: 22, y: -14 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const complexTimesIBlocks: ReactElement[] = [
    <StackLayout key="layout-times-i-heading" maxWidth="xl">
        <Block id="times-i-heading" padding="md">
            <EditableH2 id="h2-times-i-heading" blockId="times-i-heading">
                What Multiplying by i Does
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-times-i-setup" maxWidth="xl">
        <Block id="times-i-setup" padding="sm">
            <EditableParagraph id="para-times-i-setup" blockId="times-i-setup">
                Start with the simplest multiplier there is: i itself. Take the number z ={" "}
                <InlineScrubbleNumber
                    varName="iTurnReal"
                    {...numberPropsFromDefinition(getVariableInfo('iTurnReal'))}
                    formatValue={(value) => value.toFixed(1)}
                />{" "}
                +{" "}
                <InlineScrubbleNumber
                    varName="iTurnImag"
                    {...numberPropsFromDefinition(getVariableInfo('iTurnImag'))}
                    formatValue={(value) => value.toFixed(1)}
                />
                i and commit to an answer before you see one: drag the dashed marker to where you
                think i·z lands, then reveal it.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-times-i-figure" maxWidth="xl">
        <Block id="times-i-figure" padding="sm" hasVisualization>
            <TimesIFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-times-i-reflect" maxWidth="xl">
        <Block id="times-i-reflect" padding="sm">
            <EditableParagraph id="para-times-i-reflect" blockId="times-i-reflect">
                Wherever you put z, the answer keeps its{" "}
                <InlineLinkedHighlight
                    varName="iTurnHighlight"
                    highlightId="length"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('iTurnHighlight'))}
                >
                    distance from the origin
                </InlineLinkedHighlight>{" "}
                and moves a{" "}
                <InlineLinkedHighlight
                    varName="iTurnHighlight"
                    highlightId="turn"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo('iTurnHighlight'))}
                >
                    quarter turn
                </InlineLinkedHighlight>{" "}
                anticlockwise. Multiplying by i stretches nothing at all; it only turns. So what
                might multiplying by some other complex number do?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-times-i-question-distance" maxWidth="xl">
        <Block id="times-i-question-distance" padding="md">
            <EditableParagraph id="para-times-i-question-distance" blockId="times-i-question-distance">
                Whatever number you start from, multiplying it by i leaves its distance from the
                origin{" "}
                <InlineFeedback
                    varName="answer_times_i_distance"
                    correctValue="exactly the same"
                    position="terminal"
                    successMessage="— yes, and that is the whole point: i is a pure turn, so nothing about the size changes"
                    failureMessage="— that is the usual expectation, but the |z| and |i·z| labels on the two arrows never disagree. Pick again whenever you are ready."
                    hint="Multiplying by i is a rotation, and rotations do not resize anything"
                    reviewBlockId="times-i-figure"
                    visualizationHint={{
                        blockId: "times-i-figure",
                        hintKey: "times-i-distance-hint",
                        label: "Discover it yourself",
                        resetVars: { iTurnRevealed: true, iTurnReal: 2.8, iTurnImag: 1 },
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the teal point z out along the real axis — watch the |z| and |i·z| labels",
                                position: { x: "76%", y: "45%" },
                                completionVar: "iTurnReal",
                                completionValue: 3,
                                completionTolerance: 0.6,
                            },
                            {
                                gesture: "drag",
                                label: "Now drag z high up instead — the two lengths still match",
                                position: { x: "62%", y: "22%" },
                                completionVar: "iTurnImag",
                                completionValue: 2.5,
                                completionTolerance: 0.8,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_times_i_distance"
                        correctAnswer="exactly the same"
                        options={["exactly the same", "doubled", "halved", "one unit longer"]}
                        {...choicePropsFromDefinition(getVariableInfo('answer_times_i_distance'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-times-i-question-double" maxWidth="xl">
        <Block id="times-i-question-double" padding="md">
            <EditableParagraph id="para-times-i-question-double" blockId="times-i-question-double">
                A point sits at 2i, straight up the imaginary axis. Multiplying it by i turns it
                another quarter turn, landing it at{" "}
                <InlineFeedback
                    varName="answer_times_i_product"
                    correctValue={["-2", "−2", "-2+0i", "-2 + 0i"]}
                    position="terminal"
                    successMessage="— exactly, two quarter turns is a half turn, so the point crosses to the far side of the origin, still 2 units out"
                    failureMessage="— not yet. Click the box and try again as often as you like."
                    hint="Put the point at 2i in the figure above and turn it once more; the distance stays 2, so only the direction can change"
                    reviewBlockId="times-i-figure"
                    visualizationHint={{
                        blockId: "times-i-figure",
                        hintKey: "times-i-double-turn-hint",
                        label: "Try it in the figure",
                        resetVars: { iTurnReal: 2.8, iTurnImag: 1, iTurnRevealed: true },
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag the teal point z left onto the imaginary axis",
                                position: { x: "73%", y: "39%" },
                                completionVar: "iTurnReal",
                                completionValue: 0,
                                completionTolerance: 0.3,
                            },
                            {
                                gesture: "drag-vertical",
                                label: "Slide it to 2 units up, so z is 2i — now read where i·z sits",
                                position: { x: "50%", y: "33%" },
                                completionVar: "iTurnImag",
                                completionValue: 2,
                                completionTolerance: 0.35,
                            },
                        ],
                    }}
                >
                    <InlineClozeInput
                        varName="answer_times_i_product"
                        correctAnswer={["-2", "−2", "-2+0i", "-2 + 0i"]}
                        {...clozePropsFromDefinition(getVariableInfo('answer_times_i_product'))}
                    />
                </InlineFeedback>.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
