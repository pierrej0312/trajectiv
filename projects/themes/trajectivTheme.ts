import Aura from '@primeuix/themes/aura';
import { definePreset, palette } from '@primeuix/themes';


const primaryLight = palette('#111714');
const lime = palette('#B8F85A');

const invertPalette = (p: ReturnType<typeof palette>) => ({
  50: p[950],
  100: p[900],
  200: p[800],
  300: p[700],
  400: p[600],
  500: p[500],
  600: p[400],
  700: p[300],
  800: p[200],
  900: p[100],
  950: p[50],
});

const primaryDark = invertPalette(lime);


export const TrajectivTheme = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primaryLight,
        primary: {
          color: '#111714',
          inverseColor: '#F7F8F3',
          hoverColor: '#1C2420',
          activeColor: '#050706',
        },
      },
      dark: {
        primaryDark,
        primary: {
          color: '#B8F85A',
          inverseColor: '#050706',
          hoverColor: '#C9FF72',
          activeColor: '#9BEA32',
        },
      },
    },
  },
  components: {
    button: {
      colorScheme: {
        light: {
          root: {
            primary: {
              background: 'linear-gradient(35deg,#050706 0%,#111714 55%,#24351e 100%)',
              color: '#f7f8f3',
              hoverBackground:
                'linear-gradient(\n' +
                '    135deg,\n' +
                '    #0a0d0b 0%,\n' +
                '    #1c2420 55%,\n' +
                '    #304726 100%\n' +
                '  )',
              activeBackground:
                'linear-gradient(\n' +
                '    135deg,\n' +
                '    #020302 0%,\n' +
                '    #0a0d0b 55%,\n' +
                '    #1c2420 100%\n' +
                '  )',
            },
          },
        },
        dark: {
          root: {
            primary: {
              background:
                'linear-gradient(\n' +
                '    135deg,\n' +
                '    #f7f8f3 0%,\n' +
                '    #dfff8f 34%,\n' +
                '    #b8f85a 68%,\n' +
                '    #54d3b0 100%\n' +
                '  )',
              hoverBackground:
                'linear-gradient(\n' +
                '    135deg,\n' +
                '    #ffffff 0%,\n' +
                '    #ecffc4 32%,\n' +
                '    #c9ff72 66%,\n' +
                '    #6ee7c8 100%\n' +
                '  )',
              activeBackground:
                'linear-gradient(\n' +
                '    135deg,\n' +
                '    #e6ffc4 0%,\n' +
                '    #d3ff8a 35%,\n' +
                '    #9bea32 70%,\n' +
                '    #2ebb96 100%\n' +
                '  )',
              color: '#050706',
            },
            raisedShadow:
              '0 18px 42px rgba(184, 248, 90, 0.22), 0 0 32px rgba(84, 211, 176, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.42)',
          },
        },
      },
    },
    card: {
      extend: {
        backdropFilter: 'blur(100px)',
      },
      colorScheme: {
        light: {
          root: {
            background: 'rgba(255, 255, 255, 0.6)',
          },
        },
        dark: {
          root: {
            background: 'rgba(0, 0, 0, 0.33)',
          },
        },
      },
    },
    panel: {
      extend: {
        backdropFilter: 'blur(50px)',
      },
      colorScheme: {
        light: {
          root: {
            background: 'rgba(255, 255, 255, 0.6)',
            borderColor: 'rgba(255, 255, 255, 0)',
          },
        },
        dark: {
          root: {
            background: 'rgba(0, 0, 0, 0.33)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
        },
      },
    },
  },
});
