import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts() {
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey;

    if (isMod && e.key === 'k') {
      e.preventDefault();
      setCommandPaletteOpen(prev => !prev);
    }

    if (isMod && e.key === 'n') {
      e.preventDefault();
      navigate('/notificaciones');
    }

    if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { isCommandPaletteOpen, setCommandPaletteOpen };
}
