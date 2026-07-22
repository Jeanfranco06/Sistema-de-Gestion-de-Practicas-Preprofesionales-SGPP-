import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ClipboardList, GraduationCap, Building2, SearchX } from 'lucide-react';
import { useExpedientes } from '../hooks/useExpedientes';
import { useUsuarios } from '../hooks/useUsuarios';
import { useEmpresas } from '../hooks/useSedes';
import { Dialog, DialogContent, EmptyState } from '../ui';
import { cn } from '../lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Expedientes' | 'Estudiantes' | 'Empresas';
  path: string;
}

function normalize(str: string): string {
  return str?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? '';
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const { data: expedientes = [] } = useExpedientes();
  const { data: usuarios = [] } = useUsuarios();
  const { data: empresas = [] } = useEmpresas();

  const results = useMemo<SearchResult[]>(() => {
    const q = normalize(query);
    if (!q) return [];

    const expResults: SearchResult[] = expedientes
      .filter((e: Record<string, unknown>) =>
        !q || normalize(e.codigoExpediente as string).includes(q)
          || normalize(e.nombreEstudiante as string).includes(q)
          || normalize(e.apellidoEstudiante as string).includes(q)
      )
      .slice(0, 5)
      .map((e: Record<string, unknown>) => ({
        id: `exp-${e.id}`,
        title: `${e.codigoExpediente}`,
        description: `${e.nombreEstudiante} ${e.apellidoEstudiante} — ${e.nombreTipoPractica ?? ''}`.trim(),
        icon: <ClipboardList className="h-4 w-4" />,
        category: 'Expedientes' as const,
        path: `/admin/expedientes/${e.id}`,
      }));

    const estResults: SearchResult[] = usuarios
      .filter((u: Record<string, unknown>) => {
        const roles = (u.roles ?? []) as Array<string | { authority?: string }>;
        const isEst = roles.some(r => (typeof r === 'string' ? r : r.authority) === 'ESTUDIANTE');
        return isEst && (!q || normalize(u.nombres as string).includes(q) || normalize(u.apellidos as string).includes(q) || normalize(u.username as string).includes(q));
      })
      .slice(0, 5)
      .map((u: Record<string, unknown>) => ({
        id: `est-${u.id}`,
        title: `${u.nombres} ${u.apellidos}`,
        description: `@${u.username}`,
        icon: <GraduationCap className="h-4 w-4" />,
        category: 'Estudiantes' as const,
        path: '/admin/expedientes',
      }));

    const empResults: SearchResult[] = empresas
      .filter((e: Record<string, unknown>) =>
        !q || normalize(e.razonSocial as string).includes(q) || normalize(e.nombreComercial as string).includes(q)
      )
      .slice(0, 5)
      .map((e: Record<string, unknown>) => ({
        id: `emp-${e.id}`,
        title: e.razonSocial as string,
        description: (e.nombreComercial as string) || (e.ruc as string) || '',
        icon: <Building2 className="h-4 w-4" />,
        category: 'Empresas' as const,
        path: '/admin/empresas',
      }));

    return [...expResults, ...estResults, ...empResults];
  }, [query, expedientes, usuarios, empresas]);

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    results.forEach(r => {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    });
    return map;
  }, [results]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const selectItem = useCallback((result: SearchResult) => {
    onOpenChange(false);
    navigate(result.path);
  }, [navigate, onOpenChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      selectItem(results[selectedIndex]);
    }
  }, [results, selectedIndex, selectItem]);

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  let runningIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-0 overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar expedientes, estudiantes, empresas..."
            className="h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
          {query && results.length === 0 && (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="Sin resultados"
              description={`No se encontraron resultados para "${query}"`}
              className="py-8"
            />
          )}

          {[...grouped.entries()].map(([category, items]) => (
            <div key={category} className="mb-2">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {category}
              </p>
              {items.map(item => {
                runningIndex++;
                const idx = runningIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                      idx === selectedIndex
                        ? 'bg-primary-100/70 dark:bg-primary-900/30 text-foreground'
                        : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {item.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">&#8593;&#8595;</kbd> navegar</span>
            <span className="flex items-center gap-1"><kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px]">&#9166;</kbd> seleccionar</span>
          </div>
          <span>{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
