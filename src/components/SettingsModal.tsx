import React from 'react';
import { Settings } from '../types';
import { soundManager } from '../utils/audio';
import { X, Volume2, VolumeX, Music, Smartphone, Sun, Sliders } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdateSettings: (newSettings: Settings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onUpdateSettings }: Props) {
  if (!isOpen) return null;

  const handleChange = (partial: Partial<Settings>) => {
    const updated = { ...settings, ...partial };
    onUpdateSettings(updated);
    soundManager.updateSettings(updated);
    soundManager.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Arena Settings</h3>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            aria-label="Close settings"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="py-5 space-y-6">
          {/* Sound FX Toggle & Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-sm font-semibold text-white">Sound Effects</div>
                  <div className="text-xs text-slate-400">Audio feedback on clicks, hits, and bells</div>
                </div>
              </div>
              <button
                onClick={() => handleChange({ soundEnabled: !settings.soundEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.soundEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {settings.soundEnabled && (
              <div className="pt-1">
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => handleChange({ soundVolume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Procedural Lo-fi Ambient Music */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Music className="w-4 h-4 text-indigo-400" />
                <div>
                  <div className="text-sm font-semibold text-white">Lo-Fi Procedural Synth Chords</div>
                  <div className="text-xs text-slate-400">Calm generative ambient focus soundscape</div>
                </div>
              </div>
              <button
                onClick={() => handleChange({ musicEnabled: !settings.musicEnabled })}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.musicEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    settings.musicEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {settings.musicEnabled && (
              <div className="pt-1">
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => handleChange({ musicVolume: parseFloat(e.target.value) })}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Haptic Vibration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-sm font-semibold text-white">Haptic Vibration</div>
                <div className="text-xs text-slate-400">Tactile impulses on supported mobile devices</div>
              </div>
            </div>
            <button
              onClick={() => handleChange({ hapticsEnabled: !settings.hapticsEnabled })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.hapticsEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.hapticsEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Done Button */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
