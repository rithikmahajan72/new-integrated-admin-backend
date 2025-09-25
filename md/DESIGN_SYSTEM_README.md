# Design System Implementation

This document describes the implementation of the design system variables extracted from Figma into the codebase.

## Files Created

### 1. `src/constants/designVariables.js`
Contains all the design variables extracted from Figma:
- Colors (Primary colors, grays, accent colors)
- Typography (Fonts, weights, sizes, line heights)
- Spacing values
- Border radius and width values
- Shadow definitions
- CSS Custom Properties export

### 2. `src/constants/styleUtils.js`
Utility functions and Tailwind classes for consistent styling:
- `getTailwindClasses` - Pre-defined Tailwind class combinations
- Button style utilities
- Input style utilities
- Label and heading utilities
- Card style utilities

### 3. `src/constants/designSystem.css`
CSS file with custom properties and utility classes:
- CSS custom properties for all design variables
- Utility classes for common components
- Consistent styling for buttons, inputs, labels, etc.

## Figma Variables Implemented

### Colors
- **White**: `#FFFFFF`
- **Primary/White**: `#FFFFFF`
- **Primary/Black**: `#000000`
- **Dark Gray**: `#232321`
- **Gray**: `#E7E7E3`
- **Blue**: `#003F62`

### Typography
- **Open Sans/Semibold/16px**: Font(family: "Open Sans", style: SemiBold, size: 16px, weight: 600, lineHeight: 100%)

### Layout
- **Line Height/16_9**: `16.9px`

## Usage Examples

### Using Tailwind Classes
```jsx
import { getTailwindClasses } from '../constants';

// Button
<button className={getTailwindClasses.button.primary}>
  Primary Button
</button>

// Input
<input className={getTailwindClasses.input.default} />

// Label
<label className={getTailwindClasses.label}>Label Text</label>

// Heading
<h1 className={getTailwindClasses.heading.h1}>Main Heading</h1>
```

### Using CSS Custom Properties
```css
.custom-component {
  color: var(--color-text-black);
  font-family: var(--font-montserrat);
  font-size: var(--font-size-xl);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-xl);
}
```

### Using CSS Utility Classes
```jsx
<button className="btn-primary">Primary Button</button>
<input className="input-default" />
<h1 className="heading-h1">Main Heading</h1>
```

## Component Updates

The `SingleProductUpload.js` component has been updated to use the design system:

1. **Import Changes**: Added `getTailwindClasses` import
2. **Button Styling**: Updated to use `getTailwindClasses.button.*`
3. **Input Styling**: Updated to use `getTailwindClasses.input.default`
4. **Label Styling**: Updated to use `getTailwindClasses.label`
5. **Heading Styling**: Updated to use `getTailwindClasses.heading.*`

## Benefits

1. **Consistency**: All components use the same design tokens
2. **Maintainability**: Changes to design variables update across the entire app
3. **Design-Dev Sync**: Variables match exactly with Figma designs
4. **Type Safety**: JavaScript constants provide better IDE support
5. **Performance**: CSS custom properties are efficient and cacheable

## Future Enhancements

1. **Theme Support**: Extend variables for dark/light themes
2. **Component Library**: Create reusable components using these variables
3. **Design Tokens**: Consider using design token tools for better workflow
4. **Animation**: Add consistent animation variables
5. **Responsive**: Add responsive breakpoint variables

## Integration

The design system is automatically loaded through:
1. `src/index.css` imports the CSS variables
2. Components import utilities from `src/constants`
3. All variables are available as CSS custom properties

This ensures consistent styling across the entire application while maintaining the exact design specifications from Figma.
