import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const complexConclusionBlocks: ReactElement[] = [
    <StackLayout key="layout-complex-conclusion-heading" maxWidth="xl">
        <Block id="complex-conclusion-heading" padding="md">
            <EditableH2 id="h2-complex-conclusion-heading" blockId="complex-conclusion-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-complex-conclusion-summary" maxWidth="xl">
        <Block id="complex-conclusion-summary" padding="sm">
            <EditableParagraph id="para-complex-conclusion-summary" blockId="complex-conclusion-summary">
                So a complex product is a stretch and a turn performed at once: the lengths
                multiply, the angles add. Multiplying by i was simply the tidiest case of that
                rule, with length 1 and angle 90°, which is why the point you dragged turned
                without ever changing size.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-complex-conclusion-next" maxWidth="xl">
        <Block id="complex-conclusion-next" padding="sm">
            <EditableParagraph id="para-complex-conclusion-next" blockId="complex-conclusion-next">
                That single fact is why complex numbers turn up wherever things rotate: the phase
                of an alternating current, a wave arriving slightly late, the spin of a sprite on
                screen. One multiplication carries both the scaling and the rotation at the same
                time. Next comes the polar form, which writes a number as exactly the two things
                you spent this lesson dragging: its length and its angle.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
