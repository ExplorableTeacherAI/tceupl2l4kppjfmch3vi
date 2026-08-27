/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // ADD YOUR VARIABLES HERE
    // ========================================

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */

    // ─────────────────────────────────────────
    // SECTION 2 — What multiplying by i does
    // ─────────────────────────────────────────
    iTurnReal: {
        defaultValue: 2.8,
        type: 'number',
        label: 'Real part of z',
        description: 'Real part of the draggable number z in the rotation figure',
        min: -2.8,
        max: 2.8,
        step: 0.1,
        color: '#62D0AD',
    },
    iTurnImag: {
        defaultValue: 1,
        type: 'number',
        label: 'Imaginary part of z',
        description: 'Imaginary part of the draggable number z in the rotation figure',
        min: -2.8,
        max: 2.8,
        step: 0.1,
        color: '#62D0AD',
    },
    iTurnGuessReal: {
        defaultValue: 2.4,
        type: 'number',
        label: 'Guess real part',
        description: 'Real part of the student prediction for i times z',
        min: -2.8,
        max: 2.8,
        step: 0.1,
        color: '#64748B',
    },
    iTurnGuessImag: {
        defaultValue: -2.4,
        type: 'number',
        label: 'Guess imaginary part',
        description: 'Imaginary part of the student prediction for i times z',
        min: -2.8,
        max: 2.8,
        step: 0.1,
        color: '#64748B',
    },
    iTurnRevealed: {
        defaultValue: false,
        type: 'boolean',
        label: 'Rotation answer revealed',
        description: 'Whether the true position of i times z is shown',
    },
    iTurnHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Rotation figure highlight',
        description: 'Which quantity is highlighted in the rotation figure',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },
    answer_times_i_distance: {
        defaultValue: '',
        type: 'select',
        label: 'Distance after multiplying by i',
        description: 'Student answer about the distance from the origin after multiplying by i',
        placeholder: '???',
        correctAnswer: 'exactly the same',
        options: ['exactly the same', 'doubled', 'halved', 'one unit longer'],
        color: '#8E90F5',
    },
    answer_times_i_product: {
        defaultValue: '',
        type: 'text',
        label: 'i times 2i',
        description: 'Student answer for i multiplied by 2i',
        placeholder: '???',
        correctAnswer: ['-2', '\u22122', '-2+0i', '-2 + 0i'],
        color: '#8E90F5',
    },

    // ─────────────────────────────────────────
    // SECTION 3 — Why you cannot multiply the parts
    // ─────────────────────────────────────────
    productZReal: {
        defaultValue: 2,
        type: 'number',
        label: 'Real part of z',
        description: 'Real part of z in the product figure',
        min: -2.2,
        max: 2.2,
        step: 0.1,
        color: '#62D0AD',
    },
    productZImag: {
        defaultValue: 1,
        type: 'number',
        label: 'Imaginary part of z',
        description: 'Imaginary part of z in the product figure',
        min: -2.2,
        max: 2.2,
        step: 0.1,
        color: '#62D0AD',
    },
    productWReal: {
        defaultValue: 1,
        type: 'number',
        label: 'Real part of w',
        description: 'Real part of w in the product figure',
        min: -2.2,
        max: 2.2,
        step: 0.1,
        color: '#62D0AD',
    },
    productWImag: {
        defaultValue: 2,
        type: 'number',
        label: 'Imaginary part of w',
        description: 'Imaginary part of w in the product figure',
        min: -2.2,
        max: 2.2,
        step: 0.1,
        color: '#62D0AD',
    },
    productGuessReal: {
        defaultValue: 2.6,
        type: 'number',
        label: 'Guess real part',
        description: 'Real part of the student prediction for z times w',
        min: -5,
        max: 5,
        step: 0.1,
        color: '#64748B',
    },
    productGuessImag: {
        defaultValue: -1.2,
        type: 'number',
        label: 'Guess imaginary part',
        description: 'Imaginary part of the student prediction for z times w',
        min: -5,
        max: 5,
        step: 0.1,
        color: '#64748B',
    },
    productRevealed: {
        defaultValue: false,
        type: 'boolean',
        label: 'Product answer revealed',
        description: 'Whether the true position of z times w is shown',
    },
    answer_product_square: {
        defaultValue: '',
        type: 'select',
        label: 'Product of 2i and 3i',
        description: 'Student answer for 2i multiplied by 3i',
        placeholder: '???',
        correctAnswer: '-6',
        options: ['6i', '-6', '6', '-6i'],
        color: '#8E90F5',
    },
    answer_product_real: {
        defaultValue: '',
        type: 'text',
        label: 'Product with a real number',
        description: 'Student answer for (1 + 3i) times 2',
        placeholder: '???',
        correctAnswer: ['2+6i', '2 + 6i', '6i+2', '6i + 2'],
        color: '#8E90F5',
    },

    // ─────────────────────────────────────────
    // SECTION 4 — Lengths multiply, angles add
    // ─────────────────────────────────────────
    polarZRadius: {
        defaultValue: 1.8,
        type: 'number',
        label: 'Length of z',
        description: 'Distance of z from the origin',
        min: 0.6,
        max: 2,
        step: 0.1,
        color: '#62D0AD',
    },
    polarZAngle: {
        defaultValue: 30,
        type: 'number',
        label: 'Angle of z',
        description: 'Angle of z from the positive real axis',
        unit: '°',
        min: 0,
        max: 120,
        step: 1,
        color: '#62D0AD',
    },
    polarWRadius: {
        defaultValue: 1.4,
        type: 'number',
        label: 'Length of w',
        description: 'Distance of w from the origin',
        min: 0.6,
        max: 2,
        step: 0.1,
        color: '#62D0AD',
    },
    polarWAngle: {
        defaultValue: 45,
        type: 'number',
        label: 'Angle of w',
        description: 'Angle of w from the positive real axis',
        unit: '°',
        min: 0,
        max: 120,
        step: 1,
        color: '#62D0AD',
    },
    polarHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Polar figure highlight',
        description: 'Which quantity is highlighted across the two linked polar views',
        color: '#62D0AD',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },
    answer_polar_modulus: {
        defaultValue: '',
        type: 'text',
        label: 'Length of the product',
        description: 'Student answer for the length of zw',
        placeholder: '???',
        correctAnswer: '6',
        color: '#8E90F5',
    },
    answer_polar_argument: {
        defaultValue: '',
        type: 'text',
        label: 'Angle of the product',
        description: 'Student answer for the angle of zw in degrees',
        placeholder: '???',
        correctAnswer: ['65', '65°'],
        color: '#8E90F5',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
