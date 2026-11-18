'use client';

import React, { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'squircle';

export interface AvatarProps {
  src?: string | null;
  alt: string;
  fallbackText?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  xs: 'h-7 w-7 text-[11px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-18 w-18 text-lg',
};

const SHAPE_CLASSES: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  squircle: 'rounded-[24%]',
};

export function Avatar({
  src,
  alt,
  fallbackText,
  size = 'md',
  shape = 'squircle',
  className,
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src && failedSrc !== src);
  const label = (fallbackText || alt || '').trim().slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-[var(--uphone-border)] bg-[var(--uphone-surface-muted)] font-semibold text-[var(--uphone-text-muted)] select-none',
        SIZE_CLASSES[size],
        SHAPE_CLASSES[shape],
        className,
      )}
    >
      {showImage ? (
        // Supports local IndexedDB Blob object URLs and arbitrary user-provided avatars.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src ?? null)}
          className="h-full w-full object-cover"
        />
      ) : label ? (
        <span aria-label={alt}>{label}</span>
      ) : (
        <User className="h-1/2 w-1/2" strokeWidth={1.75} aria-label={alt} />
      )}
    </div>
  );
}
