import React from 'react';
import { NotificationState } from '../types';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

interface NotificationToastProps {
  notification: NotificationState;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose
}) => {
  if (!notification.show) return null;

  let borderColor = 'border-[#00D9FF]';
  let bgColor = 'bg-[#002D28]/95';
  let textColor = 'text-[#00D9FF]';
  let glowStyle = 'shadow-[0_0_25px_rgba(0,217,255,0.4)]';
  let Icon = Info;

  if (notification.type === 'correct') {
    borderColor = 'border-[#10B981]';
    textColor = 'text-[#34D399]';
    glowStyle = 'shadow-[0_0_30px_rgba(16,185,129,0.5)]';
    Icon = CheckCircle2;
  } else if (notification.type === 'wrong') {
    borderColor = 'border-[#EF4444]';
    textColor = 'text-[#F87171]';
    glowStyle = 'shadow-[0_0_30px_rgba(239,68,68,0.5)]';
    Icon = XCircle;
  } else if (notification.type === 'warning') {
    borderColor = 'border-[#F59E0B]';
    textColor = 'text-[#FBBF24]';
    glowStyle = 'shadow-[0_0_25px_rgba(245,158,11,0.4)]';
    Icon = AlertTriangle;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-3rem)] animate-in fade-in slide-in-from-bottom-5 duration-200"
    >
      <div
        className={`p-4 rounded-2xl border-2 ${borderColor} ${bgColor} ${glowStyle} backdrop-blur-md flex items-start gap-3.5 relative`}
      >
        <div className={`p-1.5 rounded-lg bg-black/40 ${textColor} shrink-0`}>
          <Icon size={22} />
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2">
            <h4 className={`font-tech font-bold text-sm sm:text-base tracking-wide uppercase ${textColor}`}>
              {notification.title}
            </h4>
            {notification.points !== undefined && notification.points > 0 && (
              <span className="px-2 py-0.5 rounded text-[11px] font-tech font-extrabold bg-[#10B981] text-black">
                +{notification.points} POIN
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-[#F5F2E8] mt-1 leading-snug">
            {notification.message}
          </p>

          {notification.explanation && (
            <p className="mt-2 text-[11px] text-[#CBD5E1]/90 italic border-t border-white/10 pt-1.5 line-clamp-3">
              💡 {notification.explanation}
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-[#94A3B8] hover:text-white text-xs p-1"
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
