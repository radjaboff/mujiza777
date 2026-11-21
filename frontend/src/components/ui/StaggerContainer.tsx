'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayStart?: number;
  mode?: 'scroll' | 'mount';
}

/**
 * AliPos uslubidagi chaqqon va o'ta silliq "Stagger Cascade" animatsiyasi.
 * 40ms oraliq bilan ketma-ket domino effekti yaratadi, hech qanday qotish yoki
 * kechikishsiz chaqmoqdek tez ochiladi.
 */
export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.04,
  delayStart = 0,
  mode = 'mount',
}) => {
  return (
    <motion.div
      initial="hidden"
      animate={mode === 'mount' ? 'visible' : undefined}
      whileInView={mode === 'scroll' ? 'visible' : undefined}
      viewport={mode === 'scroll' ? { once: true, margin: '100px 0px -20px 0px' } : undefined}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delayStart,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={`w-full max-w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
  yOffset?: number;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({
  children,
  className = '',
  yOffset = 14,
}) => {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: yOffset,
        },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1], // Chaqqon, elastik va o'ta silliq
          },
        },
      }}
      style={{ willChange: 'opacity, transform' }}
      className={`w-full max-w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};
