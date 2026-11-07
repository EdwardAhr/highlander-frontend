export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-12 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-card border border-dashed border-border-strong bg-surface p-10 text-center">
      <p className="text-base font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-danger/40 bg-danger/10 p-6 text-center text-sm text-danger">
      {message}
    </div>
  );
}
