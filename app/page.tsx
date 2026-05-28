import PulseDashboard from '@/components/PulseDashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-pe-bg-secondary px-[var(--pe-space-lg)] py-[var(--pe-space-lg)] text-pe-text-primary sm:px-[var(--pe-space-xl)] sm:py-[var(--pe-space-xl)] lg:px-[var(--pe-space-2xl)]">
      <div className="mx-auto max-w-[1440px]">
        <PulseDashboard />
      </div>
    </main>
  );
}
