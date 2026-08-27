/**
 * Shared drawing helpers for the complex-multiplication figures.
 *
 * Every figure in this lesson draws the same Argand plane, uses the same ink /
 * accent colors, the same number formatters, and the same draggable handle, so
 * the three sections read as one system (FIGURE_DESIGN_LANGUAGE.md).
 */
import React, { useRef, useState, type ReactNode } from "react";
import { useVar, useSetVar } from "@/stores";
import { clamp, useSpring, type Vec2 } from "@/lib/motion";

// ── Ink and accent ───────────────────────────────────────────────────────────
export const INK = "#334155";
export const INK_STRUCTURE = "#64748B";
export const INK_QUIET = "#CBD5E1";
export const ACCENT = "#62D0AD"; // the numbers you manipulate
export const ACCENT_RESULT = "#8E90F5"; // the product they produce (covariation partner)

export const EASE_150 = {
    transition: "opacity 150ms ease-out, stroke-width 150ms ease-out",
} as const;

// ── Formatters — one per quantity, used in drawings, sliders and prose ───────
export const fmtComplex = (re: number, im: number) =>
    `${re.toFixed(1)} ${im < 0 ? "−" : "+"} ${Math.abs(im).toFixed(1)}i`;
export const fmtLength = (value: number) => value.toFixed(2);
export const fmtAngle = (degrees: number) => `${Math.round(degrees)}°`;

// ── Plane mapping — the model draws the view ─────────────────────────────────
export interface Plane {
    width: number;
    height: number;
    originX: number;
    originY: number;
    unit: number;
    toX: (re: number) => number;
    toY: (im: number) => number;
    toRe: (x: number) => number;
    toIm: (y: number) => number;
}

export const makePlane = (
    width: number,
    height: number,
    originX: number,
    originY: number,
    unit: number,
): Plane => ({
    width,
    height,
    originX,
    originY,
    unit,
    toX: (re) => originX + re * unit,
    toY: (im) => originY - im * unit,
    toRe: (x) => (x - originX) / unit,
    toIm: (y) => (originY - y) / unit,
});

export const svgPointFromEvent = (
    event: React.PointerEvent,
    svg: SVGSVGElement | null,
    width: number,
    height: number,
): Vec2 => {
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
        x: ((event.clientX - rect.left) / rect.width) * width,
        y: ((event.clientY - rect.top) / rect.height) * height,
    };
};

// ── Axes ─────────────────────────────────────────────────────────────────────
const PAD = 24;

export function PlaneAxes({
    plane,
    ticks,
    opacity = 1,
}: {
    plane: Plane;
    ticks: number[];
    opacity?: number;
}) {
    const { width, height, originX, originY, unit, toX, toY } = plane;
    return (
        <g opacity={opacity} style={EASE_150}>
            <line x1={PAD} y1={originY} x2={width - PAD} y2={originY} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
            <line x1={originX} y1={PAD} x2={originX} y2={height - PAD} stroke={INK_QUIET} strokeWidth="1.5" strokeLinecap="round" />
            {ticks.map((value) => {
                const x = toX(value);
                const y = toY(value);
                return (
                    <g key={`tick-${value}`}>
                        {x > PAD + 6 && x < width - PAD - 6 && (
                            <line x1={x} y1={originY - 4} x2={x} y2={originY + 4} stroke={INK_QUIET} strokeWidth="1.5" />
                        )}
                        {y > PAD + 6 && y < height - PAD - 6 && (
                            <line x1={originX - 4} y1={y} x2={originX + 4} y2={y} stroke={INK_QUIET} strokeWidth="1.5" />
                        )}
                    </g>
                );
            })}
            <text x={width - PAD} y={originY - 10} fill={INK_STRUCTURE} fontSize="12" textAnchor="end">
                Re
            </text>
            <text x={originX + 10} y={PAD + 6} fill={INK_STRUCTURE} fontSize="12" textAnchor="start">
                Im
            </text>
            <text x={originX + unit} y={originY + 18} fill={INK_QUIET} fontSize="11" textAnchor="middle">
                1
            </text>
        </g>
    );
}

// ── Halo — the soft, wider stroke under a highlighted element ────────────────
export const Halo = ({ active, children }: { active: boolean; children: ReactNode }) =>
    active ? <g opacity={0.28}>{children}</g> : null;

// ── Shared highlight channel across linked views and prose ──────────────────
export const useHighlightState = (varName: string) => {
    const highlight = useVar<string>(varName, "");
    const setVar = useSetVar();
    return {
        value: highlight,
        opacity: (id: string) => (highlight && highlight !== id ? 0.35 : 1),
        weight: (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting),
        isActive: (id: string) => highlight === id,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar(varName, id),
            onPointerLeave: () => setVar(varName, ""),
        }),
    };
};

// ── Draggable handle — accent dot, soft shadow, 24px hit area ────────────────
export function DragHandle({
    x,
    y,
    color,
    hollow = false,
    shadowId,
    onDrag,
    radius = 8,
}: {
    x: number;
    y: number;
    color: string;
    hollow?: boolean;
    shadowId: string;
    onDrag: (event: React.PointerEvent<SVGCircleElement>) => void;
    radius?: number;
}) {
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const scale = useSpring(dragging || hovered ? 1.15 : 1, { stiffness: 400, damping: 26 });

    return (
        <g>
            <g transform={`translate(${x} ${y}) scale(${scale})`}>
                {hollow ? (
                    <circle
                        r={radius}
                        fill="#FFFFFF"
                        stroke={color}
                        strokeWidth="2"
                        strokeDasharray="3 3"
                        filter={`url(#${shadowId})`}
                    />
                ) : (
                    <circle r={radius} fill={color} filter={`url(#${shadowId})`} />
                )}
            </g>
            <circle
                cx={x}
                cy={y}
                r={24}
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    draggingRef.current = true;
                    setDragging(true);
                }}
                onPointerMove={(event) => {
                    if (!draggingRef.current) return;
                    onDrag(event);
                }}
                onPointerUp={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerCancel={() => {
                    draggingRef.current = false;
                    setDragging(false);
                }}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />
        </g>
    );
}

// ── Soft shadow definition, one per figure ──────────────────────────────────
export const HandleShadow = ({ id }: { id: string }) => (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
    </filter>
);


// ── Arrows out of the origin, with a live length annotation ─────────────────

/** Arrowhead marker definition — one per colour, placed inside <defs>. */
export const ArrowMarker = ({ id, color }: { id: string; color: string }) => (
    <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 1 L 9 5 L 0 9 z" fill={color} />
    </marker>
);

/** Line from the origin to a point, stopping short so the handle stays clear. */
export function OriginArrow({
    plane,
    x,
    y,
    color,
    markerId,
    weight = 2.5,
}: {
    plane: Plane;
    x: number;
    y: number;
    color: string;
    markerId?: string;
    weight?: number;
}) {
    const dx = x - plane.originX;
    const dy = y - plane.originY;
    const length = Math.hypot(dx, dy);
    if (length < 14) return null;
    const shortened = Math.max(length - 12, 0) / length;
    return (
        <line
            x1={plane.originX}
            y1={plane.originY}
            x2={plane.originX + dx * shortened}
            y2={plane.originY + dy * shortened}
            stroke={color}
            strokeWidth={weight}
            strokeLinecap="round"
            {...(markerId ? { markerEnd: `url(#${markerId})` } : {})}
        />
    );
}

/** Live length readout, floated just off the middle of its own arrow. */
export function MagnitudeLabel({
    plane,
    x,
    y,
    color,
    text,
}: {
    plane: Plane;
    x: number;
    y: number;
    color: string;
    text: string;
}) {
    const dx = x - plane.originX;
    const dy = y - plane.originY;
    const length = Math.hypot(dx, dy) || 1;
    const offsetX = (-dy / length) * 16;
    const offsetY = (dx / length) * 16;
    const halfWidth = text.length * 3.4;
    const labelX = clamp(plane.originX + dx / 2 + offsetX, 24 + halfWidth, plane.width - 24 - halfWidth);
    const labelY = clamp(plane.originY + dy / 2 + offsetY, 36, plane.height - 24);
    return (
        <text x={labelX} y={labelY} fill={color} fontSize="11" textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums" }}>
            {text}
        </text>
    );
}

// ── Quiet control button used for the predict-then-reveal figures ───────────
export function FigureButton({
    onClick,
    children,
    tone = "quiet",
}: {
    onClick: () => void;
    children: ReactNode;
    tone?: "quiet" | "accent";
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                tone === "accent"
                    ? "rounded-lg px-3 py-1.5 text-[13px] font-medium text-white transition-colors"
                    : "rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
            }
            style={tone === "accent" ? { backgroundColor: ACCENT_RESULT } : undefined}
        >
            {children}
        </button>
    );
}
