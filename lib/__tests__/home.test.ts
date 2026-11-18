import test from 'node:test';
import assert from 'node:assert/strict';
import { HOME_QUOTES, pickNextQuote } from '../home/quotes';
import { getReservedWeatherState } from '../home/weather';
import {
  DEFAULT_DESKTOP_WIDGETS,
  formatClockParts,
  reorderDesktopWidgets,
  toggleDesktopWidgetVisibility,
  updateDesktopWidgetSize,
} from '../home/widgets';

test('pickNextQuote selects a different quote when multiple exist', () => {
  const next = pickNextQuote(HOME_QUOTES[0].id, HOME_QUOTES, () => 0);
  assert.notEqual(next.id, HOME_QUOTES[0].id);
  assert.equal(pickNextQuote('x', [HOME_QUOTES[0]]).id, HOME_QUOTES[0].id);
});

test('weather adapter returns unconfigured state with no fabricated metrics', () => {
  const state = getReservedWeatherState();
  assert.deepEqual(state, { configured: false });
});

test('widget layout reorder, resize, and toggle work without mutating inputs', () => {
  const original = [...DEFAULT_DESKTOP_WIDGETS];
  const reordered = reorderDesktopWidgets(original, 'w_note', 'w_clock');
  assert.equal(reordered[0].id, 'w_note');
  assert.equal(reordered[0].order, 0);
  assert.equal(original[0].id, 'w_clock');

  const resized = updateDesktopWidgetSize(original, 'w_custom', 'lg');
  assert.equal(resized.find((w) => w.id === 'w_custom')?.size, 'lg');

  const toggled = toggleDesktopWidgetVisibility(original, 'w_weather');
  assert.equal(toggled.find((w) => w.id === 'w_weather')?.isVisible, false);
});

test('formatClockParts formats real Date values consistently', () => {
  const sample = new Date(2026, 10, 17, 14, 5, 9);
  const partsZh = formatClockParts(sample, 'zh-CN');
  assert.equal(partsZh.timeText, '14:05');
  assert.equal(partsZh.dayNumber, '17');
  assert.equal(partsZh.periodLabel, '下午');
});
