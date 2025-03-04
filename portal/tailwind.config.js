import * as daisyui from 'daisyui';
import * as themes from 'daisyui/src/theming/themes';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {}
  },
  plugins: [daisyui],
  daisyui: {
    // *-focus are entirely ignored... 🤷
    themes: [
      {
        scriptorialight: {
          primary: '#1c3258',
          'primary-focus': '#004675',
          'primary-content': '#ffffff',

          secondary: '#575e70',
          'secondary-focus': '#7c87a2',
          'secondary-content': '#ffffff',

          accent: '#4a90e2',
          'accent-focus': '#387ed0',
          'accent-content': '#ffffff',

          neutral: '#f3f3f3',
          'neutral-focus': '#e1e1e1',
          'neutral-content': '#1e2734',

          'base-100': '#ffffff',
          'base-200': '#f9fafb',
          'base-300': '#ced3d9',
          'base-content': '#1e2734',

          info: '#176eb5',
          success: '#0cb66c',
          warning: '#f9a01a',
          error: '#ba1a1a',

          '--rounded-box': '1rem',
          '--rounded-btn': '.5rem',
          '--rounded-badge': '1.9rem',

          '--animation-btn': '.25s',
          '--animation-input': '.2s',

          '--btn-text-case': 'uppercase',
          '--navbar-padding': '.5rem',
          '--border-btn': '1px'
        },

        scriptoriadark: {
          ...themes.dark,
          primary: '#1c3258',
          'primary-focus': '#002842',
          'primary-content': '#ffffff',

          secondary: '#575e70',
          'secondary-focus': '#7c87a2',
          'secondary-content': '#ffffff',

          accent: '#3560c7',
          'accent-focus': '#234eb5',
          'accent-content': '#ffffff',

          neutral: '#3b424e',
          'neutral-focus': '#2a2e37',
          'neutral-content': '#ffffff',

          'base-content': '#ffffff',
          'base-300': '#2c3a4d',
          'base-200': '#243040',
          'base-100': '#1e2734',

          info: '#176eb5',
          success: '#0cb66c',
          warning: '#f9a01a',
          error: '#ca2a2a',

          '--rounded-box': '1rem',
          '--rounded-btn': '.5rem',
          '--rounded-badge': '1.9rem',

          '--animation-btn': '.25s',
          '--animation-input': '.2s',

          '--btn-text-case': 'uppercase',
          '--navbar-padding': '.5rem',
          '--border-btn': '1px'
        }
      }
    ],
    darkTheme: 'scriptoriadark'
  }
};
