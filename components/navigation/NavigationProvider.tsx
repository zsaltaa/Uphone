'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loadActiveUserProfile,
  USER_UPDATED_EVENT,
  type UserProfileSnapshot,
} from '@/lib/storage/userService';
import type { User } from '@/types/uphone';
import { NavigationDrawer } from './NavigationDrawer';

interface NavigationContextValue {
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  user: User | null;
  avatarUrl: string | null;
  refreshUserProfile: () => Promise<void>;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [profileSnapshot, setProfileSnapshot] = useState<UserProfileSnapshot | null>(null);

  const refreshUserProfile = useCallback(async () => {
    const next = await loadActiveUserProfile();
    setProfileSnapshot(next);
  }, []);

  useEffect(() => {
    let active = true;
    loadActiveUserProfile().then((next) => {
      if (active) {
        setProfileSnapshot(next);
      }
    });

    const onUserUpdated = () => {
      void refreshUserProfile();
    };
    window.addEventListener(USER_UPDATED_EVENT, onUserUpdated);
    return () => {
      active = false;
      window.removeEventListener(USER_UPDATED_EVENT, onUserUpdated);
    };
  }, [refreshUserProfile]);

  const avatarBlob = profileSnapshot?.avatarBlob ?? null;

  const avatarUrl = useMemo(() => {
    if (!avatarBlob || typeof URL === 'undefined') {
      return null;
    }
    return URL.createObjectURL(avatarBlob);
  }, [avatarBlob]);

  useEffect(() => {
    if (!avatarUrl) {
      return;
    }
    return () => {
      URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  // Left-edge swipe-right gesture to open drawer on mobile/tablet touchscreens
  useEffect(() => {
    if (isDrawerOpen) {
      return;
    }

    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }
      const touch = event.touches[0];
      if (touch.clientX <= 36) {
        startX = touch.clientX;
        startY = touch.clientY;
        tracking = true;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!tracking || event.changedTouches.length === 0) {
        tracking = false;
        return;
      }
      const touch = event.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      tracking = false;

      if (dx > 52 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        setIsDrawerOpen(true);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDrawerOpen]);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  const value = useMemo<NavigationContextValue>(
    () => ({
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      user: profileSnapshot?.user ?? null,
      avatarUrl,
      refreshUserProfile,
    }),
    [
      isDrawerOpen,
      openDrawer,
      closeDrawer,
      toggleDrawer,
      profileSnapshot?.user,
      avatarUrl,
      refreshUserProfile,
    ],
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
      <NavigationDrawer />
    </NavigationContext.Provider>
  );
}

export function useNavigationDrawer(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigationDrawer must be used within NavigationProvider.');
  }
  return ctx;
}
