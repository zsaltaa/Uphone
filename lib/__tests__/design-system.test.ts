import test from 'node:test';
import assert from 'node:assert/strict';
import {
  customThemeToCssVars,
  DEFAULT_CUSTOM_THEME_TOKENS,
  FONT_PRESETS,
} from '../theme/tokens';
import {
  drawerLeftVariants,
  modalVariants,
  pageTransitionVariants,
  popoverMenuVariants,
  UPHONE_SPRING,
} from '../motion/presets';

test('customThemeToCssVars maps custom theme tokens to CSS variable names', () => {
  const vars = customThemeToCssVars({
    bg: '#101010',
    accent: '#2f6f5e',
    bubbleSelf: '#2f6f5e',
    popoverBg: 'rgba(255, 255, 255, 0.9)',
  });

  assert.equal(vars['--uphone-bg'], '#101010');
  assert.equal(vars['--uphone-accent'], '#2f6f5e');
  assert.equal(vars['--uphone-bubble-self'], '#2f6f5e');
  assert.equal(vars['--uphone-popover-bg'], 'rgba(255, 255, 255, 0.9)');
  assert.ok(DEFAULT_CUSTOM_THEME_TOKENS.surface.length > 0);
});

test('FONT_PRESETS includes Chinese-friendly fallback stacks', () => {
  assert.ok(FONT_PRESETS.jakarta.cssFamily.includes('PingFang SC'));
  assert.ok(FONT_PRESETS.system.cssFamily.includes('SF Pro Text'));
  assert.ok(FONT_PRESETS.serif.cssFamily.includes('Noto Serif SC'));
});

test('motion presets define compositor-safe variants and spring physics', () => {
  assert.equal(UPHONE_SPRING.type, 'spring');
  assert.ok('initial' in pageTransitionVariants && 'animate' in pageTransitionVariants);
  assert.ok('initial' in drawerLeftVariants && 'animate' in drawerLeftVariants);
  assert.ok('initial' in modalVariants && 'animate' in modalVariants);
  assert.ok('initial' in popoverMenuVariants && 'animate' in popoverMenuVariants);
});
