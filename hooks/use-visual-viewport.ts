'use client';

import { useEffect, useState } from 'react';

export interface VisualViewportState {
  height: number | null;
  keyboardOffset: number;
  isKeyboardOpen: boolean;
}

/**
 * Tracks mobile virtual keyboard height via window.visualViewport
 * and updates --uphone-keyboard-offset on documentElement.
 */
export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    height: null,
    keyboardOffset: 0,
    isKeyboardOpen: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const vv = window.visualViewport;
    if (!vv) {
      return;
    }

    const update = () => {
      const offset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      const keyboardOpen = offset > 120;
      document.documentElement.style.setProperty('--uphone-keyboard-offset', `${offset}px`);
      setState({
        height: Math.round(vv.height),
        keyboardOffset: offset,
        isKeyboardOpen: keyboardOpen,
      });
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      document.documentElement.style.setProperty('--uphone-keyboard-offset', '0px');
    };
  }, []);

  return state;
}
