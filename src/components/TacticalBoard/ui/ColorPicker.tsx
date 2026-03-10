'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const presetColors = [
  '#ffffff', '#000000', '#ef4444', '#f97316', '#eab308', 
  '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
  '#f43f5e', '#fb923c', '#fbbf24', '#4ade80', '#2dd4bf',
  '#60a5fa', '#a78bfa', '#f472b6', '#94a3b8', '#334155',
];

export default function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="w-full h-10 rounded border border-gray-600 flex items-center gap-2 px-2 hover:border-gray-500 transition"
      >
        <div
          className="w-6 h-6 rounded border border-gray-500"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-gray-300 uppercase">{color}</span>
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-3 bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-50"
          >
            <div className="grid grid-cols-5 gap-2 mb-3">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onChange(c);
                    setShowPicker(false);
                  }}
                  className={`w-6 h-6 rounded border-2 transition ${
                    color === c ? 'border-white scale-110' : 'border-transparent hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}