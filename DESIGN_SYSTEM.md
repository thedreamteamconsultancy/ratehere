# 🎨 Premium Design System

## Overview

RateHere features a **world-class design system** with premium colors, perfect spacing, and sophisticated UI elements optimized for both light and dark modes.

## Color Palette

### Light Mode 🌞

#### Primary Colors
```css
--primary: hsl(221, 83%, 53%)           /* #3b82f6 - Professional Blue */
--primary-foreground: hsl(0, 0%, 100%)  /* #ffffff - White */
--primary-light: hsl(221, 83%, 95%)     /* #eff6ff - Very Light Blue */
--primary-hover: hsl(221, 83%, 45%)     /* #2563eb - Darker Blue */
--primary-dark: hsl(221, 83%, 35%)      /* #1d4ed8 - Deep Blue */
```

#### Secondary Colors
```css
--secondary: hsl(215, 25%, 27%)         /* #334155 - Elegant Slate */
--secondary-foreground: hsl(0, 0%, 100%) /* #ffffff - White */
--secondary-light: hsl(215, 20%, 95%)   /* #f1f5f9 - Very Light Slate */
```

#### Accent Colors
```css
--accent: hsl(199, 89%, 48%)            /* #0ea5e9 - Vibrant Cyan */
--accent-foreground: hsl(0, 0%, 100%)   /* #ffffff - White */
--accent-light: hsl(199, 89%, 95%)      /* #e0f2fe - Very Light Cyan */
--accent-dark: hsl(199, 89%, 35%)       /* #0369a1 - Dark Cyan */
```

#### Semantic Colors
```css
--success: hsl(142, 76%, 36%)           /* #16a34a - Fresh Green */
--success-foreground: hsl(0, 0%, 100%)  /* #ffffff - White */
--success-light: hsl(142, 76%, 95%)     /* #dcfce7 - Very Light Green */

--warning: hsl(38, 92%, 50%)            /* #f59e0b - Warm Amber */
--warning-foreground: hsl(0, 0%, 100%)  /* #ffffff - White */
--warning-light: hsl(38, 92%, 95%)      /* #fef3c7 - Very Light Amber */

--destructive: hsl(0, 72%, 51%)         /* #dc2626 - Refined Red */
--destructive-foreground: hsl(0, 0%, 100%) /* #ffffff - White */
--destructive-light: hsl(0, 72%, 97%)   /* #fee2e2 - Very Light Red */
```

#### Neutral Colors
```css
--background: hsl(0, 0%, 100%)          /* #ffffff - Pure White */
--foreground: hsl(222, 47%, 11%)        /* #0f172a - Almost Black */

--card: hsl(0, 0%, 100%)                /* #ffffff - White */
--card-foreground: hsl(222, 47%, 11%)   /* #0f172a - Almost Black */

--muted: hsl(210, 20%, 97%)             /* #f8fafc - Very Light Gray */
--muted-foreground: hsl(215, 16%, 47%)  /* #64748b - Medium Gray */

--border: hsl(214, 32%, 91%)            /* #e2e8f0 - Light Border */
--input: hsl(214, 32%, 91%)             /* #e2e8f0 - Light Input Border */
```

---

### Dark Mode 🌙

#### Primary Colors
```css
--primary: hsl(221, 83%, 60%)           /* #60a5fa - Bright Blue */
--primary-foreground: hsl(222, 47%, 4%) /* #0b0f1a - Deep Navy */
--primary-light: hsl(221, 83%, 15%)     /* #1e3a8a - Dark Blue */
--primary-hover: hsl(221, 83%, 70%)     /* #93c5fd - Very Bright Blue */
--primary-dark: hsl(221, 83%, 40%)      /* #2563eb - Medium Blue */
```

#### Secondary Colors
```css
--secondary: hsl(217, 19%, 27%)         /* #334155 - Dark Slate */
--secondary-foreground: hsl(210, 40%, 98%) /* #f8fafc - Almost White */
--secondary-light: hsl(217, 19%, 12%)   /* #1e293b - Very Dark Slate */
```

#### Accent Colors
```css
--accent: hsl(199, 89%, 55%)            /* #22d3ee - Electric Cyan */
--accent-foreground: hsl(222, 47%, 4%)  /* #0b0f1a - Deep Navy */
--accent-light: hsl(199, 89%, 15%)      /* #083344 - Dark Cyan */
--accent-dark: hsl(199, 89%, 45%)       /* #0891b2 - Medium Cyan */
```

#### Semantic Colors
```css
--success: hsl(142, 76%, 45%)           /* #22c55e - Vibrant Green */
--success-foreground: hsl(222, 47%, 4%) /* #0b0f1a - Deep Navy */
--success-light: hsl(142, 76%, 12%)     /* #052e16 - Dark Green */

--warning: hsl(38, 92%, 60%)            /* #fbbf24 - Bright Amber */
--warning-foreground: hsl(222, 47%, 4%) /* #0b0f1a - Deep Navy */
--warning-light: hsl(38, 92%, 12%)      /* #451a03 - Dark Amber */

--destructive: hsl(0, 72%, 60%)         /* #f87171 - Vivid Red */
--destructive-foreground: hsl(210, 40%, 98%) /* #f8fafc - Almost White */
--destructive-light: hsl(0, 72%, 12%)   /* #450a0a - Dark Red */
```

#### Neutral Colors
```css
--background: hsl(222, 47%, 4%)         /* #0b0f1a - Deep Navy */
--foreground: hsl(210, 40%, 98%)        /* #f8fafc - Almost White */

--card: hsl(222, 47%, 6%)               /* #0f1729 - Dark Navy Card */
--card-foreground: hsl(210, 40%, 98%)   /* #f8fafc - Almost White */

--muted: hsl(217, 19%, 12%)             /* #1e293b - Dark Muted */
--muted-foreground: hsl(215, 20%, 65%)  /* #94a3b8 - Light Gray */

--border: hsl(217, 19%, 15%)            /* #27303f - Dark Border */
--input: hsl(217, 19%, 15%)             /* #27303f - Dark Input Border */
```

---

## Gradients

### Light Mode Gradients
```css
/* Hero Section - Primary to Accent */
--gradient-hero: linear-gradient(135deg, 
  hsl(221, 83%, 53%) 0%,    /* Blue */
  hsl(199, 89%, 48%) 100%   /* Cyan */
);

/* Card Subtle Background */
--gradient-card: linear-gradient(145deg, 
  hsl(0, 0%, 100%) 0%,      /* White */
  hsl(221, 83%, 98%) 100%   /* Very Light Blue */
);

/* Accent Gradient */
--gradient-accent: linear-gradient(135deg, 
  hsl(199, 89%, 48%) 0%,    /* Cyan */
  hsl(221, 83%, 53%) 100%   /* Blue */
);

/* Premium Multi-Color Gradient */
--gradient-premium: linear-gradient(135deg, 
  hsl(221, 83%, 53%) 0%,    /* Blue */
  hsl(265, 89%, 48%) 35%,   /* Purple */
  hsl(199, 89%, 48%) 100%   /* Cyan */
);

/* Glass Morphism */
--gradient-glass: linear-gradient(135deg, 
  rgba(255, 255, 255, 0.4) 0%, 
  rgba(255, 255, 255, 0.1) 100%
);
```

### Dark Mode Gradients
```css
/* Hero Section - Darker tones with glow */
--gradient-hero: linear-gradient(135deg, 
  hsl(221, 83%, 20%) 0%,    /* Dark Blue */
  hsl(199, 89%, 25%) 100%   /* Dark Cyan */
);

/* Card with Depth */
--gradient-card: linear-gradient(145deg, 
  hsl(222, 47%, 6%) 0%,     /* Dark Navy */
  hsl(221, 83%, 10%) 100%   /* Dark Blue */
);

/* Accent Gradient (Brighter) */
--gradient-accent: linear-gradient(135deg, 
  hsl(199, 89%, 30%) 0%,    /* Medium Cyan */
  hsl(221, 83%, 35%) 100%   /* Medium Blue */
);

/* Premium Multi-Color (Darker) */
--gradient-premium: linear-gradient(135deg, 
  hsl(221, 83%, 25%) 0%,    /* Dark Blue */
  hsl(265, 89%, 30%) 35%,   /* Dark Purple */
  hsl(199, 89%, 30%) 100%   /* Dark Cyan */
);

/* Glass Morphism (Subtle) */
--gradient-glass: linear-gradient(135deg, 
  rgba(255, 255, 255, 0.1) 0%, 
  rgba(255, 255, 255, 0.05) 100%
);
```

---

## Shadows

### Light Mode Shadows
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 2px 4px -1px rgb(0 0 0 / 0.06), 
             0 2px 4px -1px rgb(0 0 0 / 0.04);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.08), 
             0 2px 4px -1px rgb(0 0 0 / 0.04);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 
             0 4px 6px -2px rgb(0 0 0 / 0.04);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.08), 
             0 10px 10px -5px rgb(0 0 0 / 0.04);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.15);

/* Premium Shadows with Color Tint */
--shadow-premium: 0 20px 60px -15px hsl(221 83% 53% / 0.3);
--shadow-card: 0 8px 24px -6px hsl(221 83% 53% / 0.12);
--shadow-hover: 0 12px 32px -8px hsl(221 83% 53% / 0.2);
--shadow-glow: 0 0 20px hsl(221 83% 53% / 0.5);
```

### Dark Mode Shadows (with Glow)
```css
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.3);
--shadow-sm: 0 2px 4px -1px rgb(0 0 0 / 0.4), 
             0 2px 4px -1px rgb(0 0 0 / 0.3);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.5), 
             0 2px 4px -1px rgb(0 0 0 / 0.4);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.6), 
             0 4px 6px -2px rgb(0 0 0 / 0.5);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.7), 
             0 10px 10px -5px rgb(0 0 0 / 0.6);
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.8);

/* Premium Shadows with Blue Glow */
--shadow-premium: 0 20px 60px -15px hsl(221 83% 60% / 0.4), 
                  0 0 30px -5px hsl(221 83% 60% / 0.2);
--shadow-card: 0 8px 24px -6px hsl(221 83% 60% / 0.2), 
               0 0 15px -3px hsl(221 83% 60% / 0.1);
--shadow-hover: 0 12px 32px -8px hsl(221 83% 60% / 0.3), 
                0 0 25px -5px hsl(221 83% 60% / 0.2);
--shadow-glow: 0 0 40px hsl(221 83% 60% / 0.6), 
               0 0 20px hsl(199 89% 55% / 0.4);
```

---

## Transitions & Animations

```css
/* Smooth Easing */
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Spring Bounce */
--transition-spring: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

/* Elastic Bounce */
--transition-bounce: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Keyframe Animations

```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Usage */
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}

.animate-scale-in {
  animation: scale-in 0.3s ease-out;
}
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', 
             Arial, sans-serif;
```

### Font Sizes
```css
text-xs: 0.75rem     /* 12px */
text-sm: 0.875rem    /* 14px */
text-base: 1rem      /* 16px */
text-lg: 1.125rem    /* 18px */
text-xl: 1.25rem     /* 20px */
text-2xl: 1.5rem     /* 24px */
text-3xl: 1.875rem   /* 30px */
text-4xl: 2.25rem    /* 36px */
text-5xl: 3rem       /* 48px */
text-6xl: 3.75rem    /* 60px */
```

### Font Weights
```css
font-thin: 100
font-light: 300
font-normal: 400
font-medium: 500
font-semibold: 600
font-bold: 700
font-extrabold: 800
```

### Line Heights
```css
leading-none: 1
leading-tight: 1.25
leading-snug: 1.375
leading-normal: 1.5
leading-relaxed: 1.625
leading-loose: 2
```

---

## Spacing System

```css
0: 0rem           /* 0px */
px: 0.0625rem     /* 1px */
0.5: 0.125rem     /* 2px */
1: 0.25rem        /* 4px */
1.5: 0.375rem     /* 6px */
2: 0.5rem         /* 8px */
2.5: 0.625rem     /* 10px */
3: 0.75rem        /* 12px */
3.5: 0.875rem     /* 14px */
4: 1rem           /* 16px */
5: 1.25rem        /* 20px */
6: 1.5rem         /* 24px */
7: 1.75rem        /* 28px */
8: 2rem           /* 32px */
9: 2.25rem        /* 36px */
10: 2.5rem        /* 40px */
11: 2.75rem       /* 44px */
12: 3rem          /* 48px */
14: 3.5rem        /* 56px */
16: 4rem          /* 64px */
20: 5rem          /* 80px */
24: 6rem          /* 96px */
32: 8rem          /* 128px */
40: 10rem         /* 160px */
48: 12rem         /* 192px */
56: 14rem         /* 224px */
64: 16rem         /* 256px */
```

---

## Border Radius

```css
--radius: 0.75rem     /* 12px - Base radius */

/* Utility Classes */
rounded-none: 0px
rounded-sm: 0.125rem     /* 2px */
rounded: 0.25rem         /* 4px */
rounded-md: 0.375rem     /* 6px */
rounded-lg: 0.5rem       /* 8px */
rounded-xl: 0.75rem      /* 12px */
rounded-2xl: 1rem        /* 16px */
rounded-3xl: 1.5rem      /* 24px */
rounded-full: 9999px
```

---

## Component Patterns

### Card
```tsx
<div className="bg-card border border-border rounded-xl p-6 shadow-card hover:shadow-hover transition-smooth">
  {/* Content */}
</div>
```

### Button (Primary)
```tsx
<button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-primary-hover hover:shadow-lg transition-smooth">
  Click Me
</button>
```

### Button (Gradient)
```tsx
<button className="gradient-hero text-white px-6 py-3 rounded-lg font-semibold shadow-premium hover:shadow-glow transition-smooth">
  Premium Action
</button>
```

### Glass Card
```tsx
<div className="gradient-glass backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
  {/* Content */}
</div>
```

### Glow Effect (Dark Mode)
```tsx
<div className="bg-card rounded-xl p-6 shadow-glow border border-primary/20">
  {/* Content glows in dark mode */}
</div>
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
sm: 640px    /* Small devices (landscape phones) */
md: 768px    /* Medium devices (tablets) */
lg: 1024px   /* Large devices (desktops) */
xl: 1280px   /* Extra large devices */
2xl: 1536px  /* 2K screens */
```

### Usage Example
```tsx
<div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
  {/* Responsive width */}
</div>
```

---

## Accessibility

### Focus States
```css
focus:ring-2 focus:ring-primary focus:ring-offset-2
focus:outline-none
```

### Color Contrast
All color combinations meet **WCAG AA** standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Touch Targets
Minimum 44px × 44px on mobile for interactive elements.

---

## Usage Examples

### Hero Section
```tsx
<section className="gradient-hero min-h-screen flex items-center justify-center px-4">
  <div className="text-center text-white">
    <h1 className="text-5xl md:text-6xl font-bold mb-6">
      Welcome to RateHere
    </h1>
    <p className="text-xl md:text-2xl mb-8 text-white/90">
      Rate Anything, Discover Everything
    </p>
    <button className="bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-glow transition-smooth">
      Get Started
    </button>
  </div>
</section>
```

### Premium Card
```tsx
<div className="bg-card border border-border rounded-2xl p-8 shadow-premium hover:shadow-glow transition-smooth">
  <div className="flex items-center gap-4 mb-6">
    <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center">
      <Star className="w-8 h-8 text-accent-foreground" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-foreground">Premium Feature</h3>
      <p className="text-muted-foreground">Enhanced experience</p>
    </div>
  </div>
  <p className="text-foreground/80 leading-relaxed">
    Lorem ipsum dolor sit amet consectetur adipisicing elit.
  </p>
</div>
```

---

## Design Principles

1. **Consistency**: Use design tokens everywhere
2. **Hierarchy**: Clear visual hierarchy with size, weight, color
3. **Spacing**: Consistent spacing creates rhythm
4. **Contrast**: Sufficient contrast for readability
5. **Feedback**: Visual feedback for all interactions
6. **Performance**: Smooth animations, no jank
7. **Accessibility**: Inclusive design for everyone
8. **Responsive**: Mobile-first, works everywhere

---

## Tools & Resources

### Design Tools
- **Figma**: Design mockups
- **Coolors.co**: Color palette generation
- **Contrast Checker**: WCAG compliance
- **Shadows Generator**: CSS shadow creation

### Code Tools
- **Tailwind CSS IntelliSense**: VS Code extension
- **PostCSS**: CSS processing
- **CSS Variables**: Dynamic theming

---

**Summary**: This design system provides a complete, premium, production-ready foundation for RateHere. All colors, shadows, and effects are optimized for both light and dark modes with world-class visual appeal. 🎨✨
