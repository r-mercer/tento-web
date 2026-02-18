import type {
  BrandVariants,
  Theme,
} from '@fluentui/react-components';
import { createDarkTheme, createLightTheme } from '@fluentui/react-components';

/**
 * Clover brand color palette for Fluent UI
 * Green-based color scheme from #020401 (darkest) to #CBE4C3 (lightest)
 */
const cloverTheme: BrandVariants = {
  10: '#020401',
  20: '#101C09',
  30: '#142F0E',
  40: '#163D0F',
  50: '#164C0F',
  60: '#165B0E',
  70: '#136A0C',
  80: '#0E7A08',
  90: '#038A02',
  100: '#2F9723',
  110: '#50A440',
  120: '#6BB15B',
  130: '#84BE75',
  140: '#9CCA8F',
  150: '#B4D7A9',
  160: '#CBE4C3',
};

/**
 * Light theme variant with clover branding
 */
export const lightTheme: Theme = {
  ...createLightTheme(cloverTheme),
};

/**
 * Dark theme variant with clover branding
 * Customized to use brighter shades of clover for better contrast
 */
export const darkTheme: Theme = {
  ...createDarkTheme(cloverTheme),
  colorBrandForeground1: cloverTheme[110],
  colorBrandForeground2: cloverTheme[120],
};

/**
 * Export the clover brand variants for direct use if needed
 */
export { cloverTheme };
