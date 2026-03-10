'use client';

import React, { memo, useCallback } from 'react';
import { useTacticalStore } from '@/stores/tacticalStore';
import { FieldRotation } from '@/types/tactical-board';

interface TeamSettingsProps {
  onClose: () => void;
}

const TeamSettings = memo<TeamSettingsProps>(({ onClose }) => {
  const currentProject = useTacticalStore((s) => s.currentProject);
  const updateHomeTeam = useTacticalStore((s) => s.updateHomeTeam);
  const updateAwayTeam = useTacticalStore((s) => s.updateAwayTeam);
  const setFieldType = useTacticalStore((s) => s.setFieldType);
  const setFieldRotation = useTacticalStore((s) => s.setFieldRotation);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!currentProject) return null;

  const fieldTypes = [
    { type: 'full' as const, label: 'Full' },
    { type: 'half' as const, label: 'Half' },
    { type: 'third' as const, label: 'Third' },
    { type: 'penalty-area' as const, label: 'Penalty' },
  ];

  const rotations: { value: FieldRotation; label: string }[] = [
    { value: 0, label: '0°' },
    { value: 90, label: '90°' },
    { value: 180, label: '180°' },
    { value: 270, label: '270°' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Home Team */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Home Team</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Name</label>
                <input
                  type="text"
                  value={currentProject.homeTeam.name}
                  onChange={(e) => updateHomeTeam({ name: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Primary</label>
                <input
                  type="color"
                  value={currentProject.homeTeam.primaryColor}
                  onChange={(e) => updateHomeTeam({ primaryColor: e.target.value })}
                  className="w-full h-10 cursor-pointer rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Border</label>
                <input
                  type="color"
                  value={currentProject.homeTeam.secondaryColor}
                  onChange={(e) => updateHomeTeam({ secondaryColor: e.target.value })}
                  className="w-full h-10 cursor-pointer rounded"
                />
              </div>
            </div>
          </div>

          {/* Away Team */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Away Team</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-400 mb-1 block">Name</label>
                <input
                  type="text"
                  value={currentProject.awayTeam.name}
                  onChange={(e) => updateAwayTeam({ name: e.target.value })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Primary</label>
                <input
                  type="color"
                  value={currentProject.awayTeam.primaryColor}
                  onChange={(e) => updateAwayTeam({ primaryColor: e.target.value })}
                  className="w-full h-10 cursor-pointer rounded"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Border</label>
                <input
                  type="color"
                  value={currentProject.awayTeam.secondaryColor}
                  onChange={(e) => updateAwayTeam({ secondaryColor: e.target.value })}
                  className="w-full h-10 cursor-pointer rounded"
                />
              </div>
            </div>
          </div>

          {/* Field Layout */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Field Layout</h3>
            <div className="grid grid-cols-4 gap-2">
              {fieldTypes.map((field) => (
                <button
                  key={field.type}
                  onClick={() => setFieldType(field.type)}
                  className={`p-2 rounded-lg border-2 transition text-xs sm:text-sm ${
                    currentProject.fieldType === field.type
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {field.label}
                </button>
              ))}
            </div>
          </div>

          {/* Field Rotation */}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-3">Field Rotation</h3>
            <div className="grid grid-cols-4 gap-2">
              {rotations.map((rot) => (
                <button
                  key={rot.value}
                  onClick={() => setFieldRotation(rot.value)}
                  className={`p-2 rounded-lg border-2 transition text-xs sm:text-sm ${
                    currentProject.fieldRotation === rot.value
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {rot.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
});

TeamSettings.displayName = 'TeamSettings';
export default TeamSettings;