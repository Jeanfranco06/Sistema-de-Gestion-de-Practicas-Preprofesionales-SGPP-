import { Sun, Moon } from 'lucide-react';
import { Button, Tooltip } from '../ui';
import { useThemeContext } from '../shared/theme/ThemeContext';

export function ThemeToggle() {
  const { mode, toggleTheme } = useThemeContext();
  const isDark = mode === 'dark';

  return (
    <Tooltip content={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'} side="bottom">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        className="h-9 w-9"
      >
        <span
          className="transition-transform duration-300 ease-in-out"
          style={{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          {isDark ? <Sun size={22} /> : <Moon size={22} />}
        </span>
      </Button>
    </Tooltip>
  );
}
