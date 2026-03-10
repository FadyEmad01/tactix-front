'use client';

import React, { memo } from 'react';
import { FieldType, FieldRotation } from '@/types/tactical-board';

interface FieldBackgroundProps {
  type: FieldType;
  rotation: FieldRotation;
}

const FieldBackground = memo<FieldBackgroundProps>(({ type, rotation }) => {
  return (
    <svg
      data-field-bg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1000 625"
      preserveAspectRatio="xMidYMid meet"
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      {/* Grass Pattern */}
      <defs>
        <pattern id="grassStripes" width="80" height="625" patternUnits="userSpaceOnUse">
          <rect width="80" height="625" fill="#2d8a3e" />
          <rect width="40" height="625" fill="#2f9142" />
        </pattern>
      </defs>
      
      <rect width="1000" height="625" fill="url(#grassStripes)" />

      {/* Field Lines */}
      <g stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none">
        {/* Outer boundary */}
        <rect x="30" y="30" width="940" height="565" />
        
        {/* Center line */}
        <line x1="500" y1="30" x2="500" y2="595" />
        
        {/* Center circle */}
        <circle cx="500" cy="312.5" r="91.5" />
        <circle cx="500" cy="312.5" r="3" fill="rgba(255,255,255,0.85)" />

        {/* Left penalty area */}
        <rect x="30" y="137.5" width="165" height="350" />
        <rect x="30" y="212.5" width="55" height="200" />
        <circle cx="135" cy="312.5" r="3" fill="rgba(255,255,255,0.85)" />
        <path d="M 195 253 A 91.5 91.5 0 0 1 195 372" />

        {/* Right penalty area */}
        <rect x="805" y="137.5" width="165" height="350" />
        <rect x="915" y="212.5" width="55" height="200" />
        <circle cx="865" cy="312.5" r="3" fill="rgba(255,255,255,0.85)" />
        <path d="M 805 253 A 91.5 91.5 0 0 0 805 372" />

        {/* Goals */}
        <rect x="5" y="262.5" width="25" height="100" strokeWidth="3" />
        <rect x="970" y="262.5" width="25" height="100" strokeWidth="3" />

        {/* Corner arcs */}
        <path d="M 30 40 A 10 10 0 0 0 40 30" />
        <path d="M 960 30 A 10 10 0 0 0 970 40" />
        <path d="M 970 585 A 10 10 0 0 0 960 595" />
        <path d="M 40 595 A 10 10 0 0 0 30 585" />
      </g>

      {/* Field type overlays */}
      {type === 'half' && (
        <rect x="500" y="0" width="500" height="625" fill="rgba(0,0,0,0.4)" />
      )}
      {type === 'third' && (
        <rect x="333" y="0" width="667" height="625" fill="rgba(0,0,0,0.4)" />
      )}
      {type === 'penalty-area' && (
        <>
          <rect x="0" y="0" width="195" height="137.5" fill="rgba(0,0,0,0.4)" />
          <rect x="0" y="487.5" width="195" height="137.5" fill="rgba(0,0,0,0.4)" />
          <rect x="195" y="0" width="805" height="625" fill="rgba(0,0,0,0.4)" />
        </>
      )}
    </svg>
  );
});

FieldBackground.displayName = 'FieldBackground';
export default FieldBackground;