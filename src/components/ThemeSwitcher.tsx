import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Moon, Sun, Palette, Shield } from 'lucide-react';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === 'dark' && <Moon className="h-5 w-5" />}
          {theme === 'light' && <Sun className="h-5 w-5" />}
          {theme === 'banking-blue' && <Palette className="h-5 w-5 text-blue-500" />}
          {theme === 'regulatory-green' && <Shield className="h-5 w-5 text-green-500" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('banking-blue')} className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-blue-500" />
          <span>Banking Blue</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('regulatory-green')} className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span>Regulatory Green</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;