import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Card, Badge, ToastContainer, type ToastMessage } from '../../components/shared';
import { getGameSettings, saveGameSettings } from '../../utils/settings';
import { generateId } from '../../utils/helpers';
import { FiSliders, FiClock, FiCheck, FiArrowLeft } from 'react-icons/fi';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getGameSettings());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const handleSave = () => {
    saveGameSettings(settings);
    const newToast: ToastMessage = {
      id: generateId(),
      type: 'success',
      title: 'Settings Saved',
      description: 'Stage timers updated successfully.',
    };
    setToasts([newToast]);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col p-6 sm:p-10 font-sans">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-100 flex items-center gap-2">
              <FiSliders className="text-cyan-400" /> Event Settings
            </h1>
            <p className="text-xs text-slate-400">Configure timer durations and manual stage behavior</p>
          </div>
        </div>
        <Badge variant="blue">HOST CONFIG</Badge>
      </div>

      {/* Settings Options */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <Card variant="solid" hoverEffect={false} className="bg-slate-900 border-slate-800 p-6">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <FiClock className="text-cyan-400" /> Challenge Stage Timers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Input
              label="Logo Challenge Timer (Seconds)"
              type="number"
              min={5}
              max={300}
              value={settings.logoTimerDuration}
              onChange={(e) => setSettings({ ...settings, logoTimerDuration: Number(e.target.value) || 30 })}
            />

            <Input
              label="Movie Challenge Timer (Seconds)"
              type="number"
              min={5}
              max={300}
              value={settings.movieTimerDuration}
              onChange={(e) => setSettings({ ...settings, movieTimerDuration: Number(e.target.value) || 30 })}
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
          <Button variant="neon-blue" leftIcon={<FiCheck />} onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
