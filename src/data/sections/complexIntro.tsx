import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph, InlineTooltip } from "@/components/atoms";

export const complexIntroBlocks: ReactElement[] = [
    <StackLayout key="layout-complex-intro-title" maxWidth="xl">
        <Block id="complex-intro-title" padding="md">
            <EditableH1 id="h1-complex-intro-title" blockId="complex-intro-title">
                Multiplying Complex Numbers
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-complex-intro-hook" maxWidth="xl">
        <Block id="complex-intro-hook" padding="sm">
            <EditableParagraph id="para-complex-intro-hook" blockId="complex-intro-hook">
                The green sweep on a radar screen is a single point going round and round. The
                code behind it rarely uses a{" "}
                <InlineTooltip id="tooltip-complex-intro-rotation-matrix" tooltip="A small grid of four numbers that turns a point about the origin when the point is multiplied by it." color="#2563EB" bgColor="rgba(37, 99, 235, 0.12)">
                    rotation matrix
                </InlineTooltip>. It multiplies one complex number
                by another, over and over, and the point moves. Multiplication in the complex
                plane is a motion.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-complex-intro-promise" maxWidth="xl">
        <Block id="complex-intro-promise" padding="sm">
            <EditableParagraph id="para-complex-intro-promise" blockId="complex-intro-promise">
                You already know how to drop a complex number onto the{" "}
                <InlineTooltip id="tooltip-complex-intro-argand-plane" tooltip="The complex plane: the real part is measured along the horizontal axis and the imaginary part up the vertical axis, so a + bi sits at the point (a, b)." color="#2563EB" bgColor="rgba(37, 99, 235, 0.12)">
                    Argand plane
                </InlineTooltip>{" "}
                as a point,
                and that is the only thing you need to bring with you. From here we multiply
                numbers by dragging them and watching where the answer lands, until you can say
                exactly what a complex product does to a point: what it does to its distance
                from the origin, and what it does to its direction.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
