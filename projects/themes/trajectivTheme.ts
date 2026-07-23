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
  extend: {
    card: {
      glassBackground: 'color-mix(in srgb, var(--p-surface-0) 86%, transparent)',
      glassBorder: 'color-mix(in srgb, var(--p-text-color) 8%, transparent)',
      glassBlur: '18px',
    },
    trajectiv: {
      radius: {
        full: '999px',
        xl: '1.25rem',
      },
      motion: {
        fast: '160ms',
        normal: '220ms',
        smooth: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      glass: {
        blurStrong: '72px',
        light: {
          background: 'color-mix(in srgb, {surface.100} 33%, transparent)',
          border: 'color-mix(in srgb, {surface.200} 10%, transparent)',
          shadow: 'rgb(17 23 20 / 0.10)',
        },
        dark: {
          background: 'rgb(5 7 6 / 0.05)',
          border: 'rgb(184 248 90 / 0.05)',
          shadow: 'rgb(0 0 0 / 0.46)',
        },
      },
      shadow: {
        active:
          '0 16px 36px color-mix(in srgb, {primary.color} 28%, transparent), 0 0 28px color-mix(in srgb, {primary.color} 16%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.24)',
        activeIcon:
          '0 12px 28px color-mix(in srgb, {primary.color} 22%, transparent), inset 0 1px 0 rgb(255 255 255 / 0.18)',
      },
    },
  },
  css: ({ dt }) => `
    :root {
      --tr-radius-full: ${dt('trajectiv.radius.full')};

      --tr-motion-fast: ${dt('trajectiv.motion.fast')};
      --tr-motion-normal: ${dt('trajectiv.motion.normal')};
      --tr-motion-smooth: ${dt('trajectiv.motion.smooth')};

      --tr-glass-blur-strong: ${dt('trajectiv.glass.blur.strong')};
      --tr-glass-background: ${dt('trajectiv.glass.light.background')};
      --tr-glass-border: ${dt('trajectiv.glass.light.border')};
      --tr-glass-shadow: ${dt('trajectiv.glass.light.shadow')};

      --tr-shadow-active: ${dt('trajectiv.shadow.active')};
      --tr-shadow-active-icon: ${dt('trajectiv.shadow.active.icon')};
    }

    .dark {
      --tr-glass-background: ${dt('trajectiv.glass.dark.background')};
      --tr-glass-border: ${dt('trajectiv.glass.dark.border')};
      --tr-glass-shadow: ${dt('trajectiv.glass.dark.shadow')};
    }
  `,
  components: {
    breadcrumb: {
      root: {
        background: 'none',
      }
    },
    button: {
      root: {
        borderRadius: '999px',
      },
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
      root: {
        background: '{surface.100}',
        color: '{text.color}',
        borderRadius: '1.75rem',
        shadow: '0 18px 55px color-mix(in srgb, var(--p-surface-800) 6%, transparent)',
      },
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
      root: {
        borderRadius: '2rem',
      },
      extend: {
        backdropFilter: 'blur(50px)',
        padding: '2rem',
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
    menubar: {
      colorScheme: {
        light: {
          root: {
            background: 'rgba(255, 255, 255, 0.33)',
            borderColor: 'transparent',
            borderRadius: '0',
            color: '#111714',
            padding: '0 1.25rem',
            gap: '0.25rem',
          },
          item: {
            color: '#111714',
            focusColor: '#111714',
            activeColor: '#111714',
            focusBackground: 'rgba(184, 248, 90, 0.12)',
            activeBackground: 'rgba(184, 248, 90, 0.18)',
            borderRadius: '999px',
            padding: '0.75rem 1rem',
            gap: '0.5rem',
            icon: {
              color: 'rgba(17, 23, 20, 0.65)',
              focusColor: '#111714',
              activeColor: '#111714',
            },
          },
          submenu: {
            background: 'rgba(255, 255, 255, 0.78)',
            borderColor: 'rgba(17, 23, 20, 0.08)',
            borderRadius: '1.25rem',
            padding: '0.5rem',
            gap: '0.25rem',
            shadow: '0 24px 80px rgba(17, 23, 20, 0.12)',
          },
          separator: {
            borderColor: 'rgba(17, 23, 20, 0.08)',
          },
          mobileButton: {
            borderRadius: '999px',
            color: '#111714',
            hoverColor: '#111714',
            hoverBackground: 'rgba(184, 248, 90, 0.12)',
          },
        },
        dark: {
          root: {
            background: 'rgba(0, 0, 0, 0.33)',
            borderColor: 'transparent',
            borderRadius: '0',
            color: '#f7f8f3',
            padding: '0 1.25rem',
            gap: '0.25rem',
          },
          item: {
            color: '#f7f8f3',
            focusColor: '#b8f85a',
            activeColor: '#b8f85a',
            focusBackground: 'rgba(184, 248, 90, 0.12)',
            activeBackground: 'rgba(184, 248, 90, 0.18)',
            borderRadius: '999px',
            padding: '0.75rem 1rem',
            gap: '0.5rem',
            icon: {
              color: 'rgba(247, 248, 243, 0.65)',
              focusColor: '#b8f85a',
              activeColor: '#b8f85a',
            },
          },
          submenu: {
            background: 'rgba(0, 0, 0, 0.72)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '1.25rem',
            padding: '0.5rem',
            gap: '0.25rem',
            shadow: '0 24px 80px rgba(0, 0, 0, 0.32)',
          },
          separator: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          mobileButton: {
            borderRadius: '999px',
            color: '#f7f8f3',
            hoverColor: '#b8f85a',
            hoverBackground: 'rgba(184, 248, 90, 0.12)',
          },
        },
      },
    },
    badge: {
      colorScheme: {
        light: {
          contrast: {
            background: '{primary.color}',
            color: '{primary.inverseColor}',
          },
        },
        dark: {
          contrast: {
            background: '{primary.color}',
            color: '{primary.inverseColor}',
          },
        },
      },
    },
    menu: {
      colorScheme: {
        light: {
          root: {
            background: 'transparent',
            borderColor: 'transparent',
            color: '#111714',
          },
          item: {
            focusBackground: 'transparent',
          },
        },
        dark: {
          root: {
            background: 'transparent',
            borderColor: 'transparent',
            color: '#f7f8f3',
          },
          item: {
            focusBackground: 'transparent',
          },
        },
      },
    },
  },
});
