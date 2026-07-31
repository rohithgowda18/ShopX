import React, { useState, useEffect } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

type RippleButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
}

export function RippleButton({ children, className = '', onClick, ...props }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    // Haptic feedback for mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        // Ignore errors on devices that do not support vibrate
      }
    }
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timeout = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600); // Matches animation duration
      return () => clearTimeout(timeout);
    }
  }, [ripples]);

  return (
    <button
      {...props}
      className={`relative overflow-hidden ${className}`}
      onPointerDown={handlePointerDown}
      onClick={onClick}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-black/10 dark:bg-white/20 rounded-full animate-ripple pointer-events-none "
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            transformOrigin: 'center',
          }}
        />
      ))}
    </button>
  );
}
