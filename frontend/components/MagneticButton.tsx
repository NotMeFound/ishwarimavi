import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  maxMovement?: number; // 1-3px as per requirement
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  maxMovement = 2.2, // subtle 1-3px maximum
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...rest
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isTouchRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  // Detect coarse pointers / mobile touch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia('(pointer: coarse)');
      isTouchRef.current = mql.matches;
      const handler = (e: MediaQueryListEvent) => {
        isTouchRef.current = e.matches;
      };
      if (mql.addEventListener) {
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
      }
    }
  }, []);

  const handlePointerEnter = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || shouldReduceMotion) return;
    if (e.pointerType === 'touch' || isTouchRef.current) return;
    setIsHovered(true);
  }, [disabled, shouldReduceMotion]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || shouldReduceMotion) return;
    if (e.pointerType === 'touch' || isTouchRef.current) return;
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    const targetX = Math.max(-maxMovement, Math.min(maxMovement, deltaX * maxMovement));
    const targetY = Math.max(-maxMovement, Math.min(maxMovement, deltaY * maxMovement));

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setOffset({ x: targetX, y: targetY });
    });
  }, [disabled, shouldReduceMotion, maxMovement]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setOffset({ x: 0, y: 0 });
  }, []);

  const transformStyle = shouldReduceMotion || isTouchRef.current
    ? undefined
    : `translate3d(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px, 0)`;

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: transformStyle,
        transition: isHovered
          ? 'transform 0.08s ease-out'
          : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: isHovered ? 'transform' : 'auto',
      }}
      className={`relative inline-flex items-center justify-center select-none active:scale-[0.98] transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
