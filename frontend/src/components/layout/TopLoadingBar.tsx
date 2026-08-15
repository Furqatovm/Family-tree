import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export const TopLoadingBar: React.FC = () => {
  const location = useLocation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const isLoading = isFetching > 0 || isMutating > 0;

  // Trigger loading animation on Route Change
  useEffect(() => {
    setIsVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(75);
    }, 150);

    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 250);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname, location.search]);

  // Trigger loading animation on Global API Fetching / Mutating
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setIsVisible(true);
      setProgress((prev) => (prev === 0 ? 25 : prev));

      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 60) return prev + 15;
          if (prev < 85) return prev + 5;
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 200);
    } else if (isVisible) {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(hideTimer);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading, isVisible]);

  if (!isVisible && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none overflow-hidden bg-transparent">
      {/* Animated Top Progress Bar Line */}
      <div
        className="h-full transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          background: 'linear-gradient(90deg, #3F6B4F 0%, #22C55E 50%, #10B981 80%, #D6A756 100%)',
          boxShadow: '0 0 12px rgba(34, 197, 94, 0.8), 0 0 6px rgba(63, 107, 79, 0.6)',
        }}
      />
    </div>
  );
};
