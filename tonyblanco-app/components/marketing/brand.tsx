import { cn } from '@/lib/utils';

export function HaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-5 w-5', className)}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="7.5" height="36" rx="2" fill="currentColor" />
      <rect x="34.5" y="6" width="7.5" height="36" rx="2" fill="currentColor" />
      <rect x="6" y="20" width="36" height="6.5" rx="2" fill="currentColor" />
      <path
        d="M24,10.5 L16.5,17.5 M24,10.5 L31.5,17.5 M16.5,17.5 L31.5,17.5"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
        opacity="0.38"
      />
      <circle cx="24" cy="10.5" r="2.2" fill="currentColor" />
      <circle cx="16.5" cy="17.5" r="1.8" fill="currentColor" />
      <circle cx="31.5" cy="17.5" r="1.8" fill="currentColor" />
    </svg>
  );
}

type BrandLogoProps = {
  size?: 'sm' | 'md';
  className?: string;
  variant?: 'default' | 'on-dark';
};

export function BrandLogo({ size = 'md', className, variant = 'default' }: BrandLogoProps) {
  const tileSize = size === 'sm' ? 'h-7 w-7 rounded-lg' : 'h-[34px] w-[34px] rounded-[10px]';
  const wordmarkSize = size === 'sm' ? 'text-[17px]' : 'text-[19px]';
  const onDark = variant === 'on-dark';

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center justify-center border',
          onDark ? 'border-white/35 text-white' : 'border-[var(--ha-acc)] text-[var(--ha-acc)]',
          tileSize,
        )}
      >
        <HaIcon />
      </div>
      <span
        className={cn(
          'font-[family-name:var(--font-cormorant)] font-semibold tracking-[0.01em]',
          onDark ? 'text-white' : 'text-[var(--ha-ink)]',
          wordmarkSize,
        )}
      >
        Holistica Aplicada
      </span>
    </div>
  );
}

export function MarketingContainer({
  children,
  className,
  narrow,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1180px] px-7',
        narrow && 'max-w-[920px]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ha-acc)]">
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <h2
      id={id}
      className={cn(
        'font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,2.625rem)] font-semibold leading-[1.12] text-balance text-[var(--ha-ink)]',
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function FeatureIcon({ paths }: { paths: [string, string] }) {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--ha-acc)"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[0]} />
      <path d={paths[1]} />
    </svg>
  );
}

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[20px] border border-[var(--ha-line-soft)] bg-[var(--ha-surface)] shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop-blur-md',
        className,
      )}
    >
      <div className="flex items-center gap-[7px] border-b border-[var(--ha-line-soft)] px-[18px] py-[13px]">
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
        <span className="ml-2.5 text-xs text-[var(--ha-ink-3)]">Panel del terapeuta</span>
      </div>
      <div className="flex flex-col gap-[18px] p-[22px]">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pacientes', value: '24' },
            { label: 'Sesiones · sem', value: '9' },
            { label: 'Análisis', value: '132', accent: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className={cn(
                'rounded-xl border p-3.5',
                stat.accent
                  ? 'border-[rgba(212,175,55,0.25)] bg-[rgba(212,175,55,0.08)]'
                  : 'border-[var(--ha-line-soft)] bg-white/[0.04]',
              )}
            >
              <div
                className={cn(
                  'mb-1.5 text-[11px] uppercase tracking-[0.08em]',
                  stat.accent ? 'text-[var(--ha-acc)]' : 'text-[var(--ha-ink-3)]',
                )}
              >
                {stat.label}
              </div>
              <div
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  stat.accent ? 'text-[var(--ha-acc)]' : 'text-[var(--ha-ink)]',
                )}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ha-ink-3)]">
            Próximas sesiones
          </div>
          {[
            { initials: 'MG', name: 'María G. — seguimiento', time: '10:30', color: 'rgba(212,175,55,0.15)', text: '#D4AF37' },
            { initials: 'JR', name: 'Javier R. — primera sesión', time: '12:00', color: 'rgba(124,92,255,0.18)', text: '#B3A4FF' },
            { initials: 'AP', name: 'Ana P. — revisión de análisis', time: '17:15', color: 'rgba(34,211,238,0.14)', text: '#7DE3F4' },
          ].map((session) => (
            <div
              key={session.initials}
              className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-[11px]"
            >
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                style={{ backgroundColor: session.color, color: session.text }}
              >
                {session.initials}
              </span>
              <span className="flex-1 text-sm text-[var(--ha-ink)]">{session.name}</span>
              <span className="text-xs tabular-nums text-[var(--ha-ink-2)]">{session.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}