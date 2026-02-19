export const colors = {
    primary: {
        50: '#f0f1ff',
        100: '#dbe6fe',
        200: '#bfcffd',
        300: '#93affc',
        400: '#5f85f9',
        500: '#0751c1',
        600: '#007bff',
        700: '#17233c',
        800: '#072d4c',
        900: '#102a5e',
    },
    secondary: {
        100: '#f9fdf4',
        200: '#f0fdf4',
        300: '#f4bf64',
        400: '#84cc16',
        500: '#2a8500',
        600: '#16a34a',
        700: '#154353',
        800: '#15803d',
        900: '#14532d',
    },
    accent: {
        blue: '#007AFF',
        red: '#ff3b30',
        orange: '#ff9500',
        yellow: '#f4bf64',
        green: '#2a8500',
        purple: '#af52de',
        pink: '#ff2d92',
    },

    neutral: {
        0: '#ffffff',
        50: '#fefffe',
        100: '#f5fcff',
        200: '#efefef',
        300: '#dbdfe4',
        400: '#c0c0c0',
        500: '#6b7280',
        600: '#545454',
        700: '#374151',
        800: '#1f2937',
        900: '#030303',
        950: '#000000',
    },

    success: '#2a8500',
    warning: '#f4bf64',
    error: '#ff3b30',
    info: '#007bff',

    background: {
        primary: '#ffffff',
        secondary: '#f5fcff',
        tertiary: '#f0f1ff',
    },

    shadow: {
        light: 'rgba(0, 0, 0, 0.05)',
        medium: 'rgba(0, 0, 0, 0.1)',
        dark: 'rgba(0, 0, 0, 0.15)',
        primary: 'rgba(7, 81, 193, 0.2)',
    },

    booking: {
        pending: '#f4bf64',
        confirmed: '#2a8500',
        cancelled: '#ff3b30',
        completed: '#6b7280',
    },
} as const;

export type ColorKey = keyof typeof colors;
export type ColorShade = keyof typeof colors.primary;
