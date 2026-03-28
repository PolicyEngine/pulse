'use client';

import { useEffect, useState } from 'react';

interface StandupItem {
  id: string;
  member: string;
  github: string;
  kind: 'authored_pr' | 'authored_issue' | 'reviewed_pr' | 'repo_commits';
  repo: string;
  repoUrl: string;
  number: number | null;
  title: string;
  url: string;
  state: string | null;
  createdAt: string;
  updatedAt: string;
  mergedAt: string | null;
  commitCount?: number;
  themeId: string;
  themeLabel: string;
  topicId: string;
  topicLabel: string;
}

interface TopicGroup {
  id: string;
  label: string;
  members: string[];
  repos: string[];
  counts: {
    totalItems: number;
    authoredPrs: number;
    authoredIssues: number;
    reviewedPrs: number;
    commitSignals: number;
    totalCommits: number;
  };
  items: StandupItem[];
}

interface ThemeGroup {
  id: string;
  label: string;
  members: string[];
  repos: string[];
  counts: {
    totalItems: number;
    authoredPrs: number;
    authoredIssues: number;
    reviewedPrs: number;
    commitSignals: number;
    totalCommits: number;
  };
  topics: TopicGroup[];
}

interface PersonSummary {
  name: string;
  github: string;
  counts: {
    authoredPrs: number;
    authoredIssues: number;
    reviewedPrs: number;
    commitSignals: number;
    totalItems: number;
    totalCommits: number;
  };
  themes: Array<{ label: string; count: number }>;
  repoCommitCounts: Array<{ repo: string; repoUrl: string; commitCount: number; topicLabel: string }>;
  items: StandupItem[];
}

interface StandupReport {
  teamName: string;
  generatedAt: string;
  generatedAtLabel: string;
  window: {
    from: string;
    to: string;
    hours: number;
    label: string;
  };
  scope: {
    focusOrgs: string[];
    focusRepos: string[];
  };
  overview: {
    memberCount: number;
    activeMemberCount: number;
    inactiveMemberCount: number;
    totalThemeCount: number;
    totalTopicCount: number;
    totalItemCount: number;
    totalCommitCount: number;
  };
  themes: ThemeGroup[];
  topics: TopicGroup[];
  people: PersonSummary[];
  inactivePeople: Array<{ name: string; github: string }>;
}

function formatItemKind(item: StandupItem) {
  if (item.kind === 'authored_pr') return 'Opened or updated PR';
  if (item.kind === 'authored_issue') return 'Opened or updated issue';
  if (item.kind === 'reviewed_pr') return 'Reviewed PR';
  return `${item.commitCount ?? 0} commits`;
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function RepoBadge({ repo }: { repo: string }) {
  return (
    <span
      className="rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-primary px-[var(--pe-space-sm)] py-[calc(var(--pe-space-xs)-1px)] text-[12px] text-pe-text-secondary"
      style={{ fontFamily: 'var(--pe-font-family-mono)' }}
    >
      {repo}
    </span>
  );
}

function TopicCluster({ topic, themeLabel }: { topic: TopicGroup; themeLabel: string }) {
  const showHeading = topic.label !== themeLabel;

  return (
    <section className="rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-secondary p-[var(--pe-space-md)]">
      {showHeading && (
        <div className="mb-[var(--pe-space-md)]">
          <h4 className="text-[17px] font-semibold text-pe-text-primary">{topic.label}</h4>
          <p className="mt-[2px] text-[13px] text-pe-text-secondary">
            {formatCountLabel(topic.counts.totalItems, 'signal', 'signals')} ·{' '}
            {formatCountLabel(topic.counts.totalCommits, 'commit', 'commits')}
          </p>
        </div>
      )}

      <div className="space-y-[var(--pe-space-sm)]">
        {topic.items.map((item) => (
          <div
            key={item.id}
            className="rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-primary px-[var(--pe-space-md)] py-[var(--pe-space-md)]"
          >
            <div className="flex flex-col gap-[var(--pe-space-xs)] lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p
                  className="text-[12px] text-pe-text-tertiary"
                  style={{ fontFamily: 'var(--pe-font-family-mono)' }}
                >
                  {item.member} · {formatItemKind(item)}
                </p>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-[2px] block text-[15px] font-medium leading-6 text-pe-text-primary hover:text-pe-primary-600"
                >
                  {item.number ? `#${item.number} · ` : ''}
                  {item.title}
                </a>
              </div>
              <p
                className="shrink-0 text-[12px] text-pe-text-tertiary"
                style={{ fontFamily: 'var(--pe-font-family-mono)' }}
              >
                {formatTimestamp(item.updatedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function PulseDashboard() {
  const [report, setReport] = useState<StandupReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      try {
        const response = await fetch('./data/standup-report.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('No generated standup report found yet.');
        }

        const data = (await response.json()) as StandupReport;
        if (!cancelled) {
          setReport(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Failed to load standup report.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-[var(--pe-radius-feature)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-2xl)] shadow-sm">
        <p className="text-[18px] text-pe-text-secondary">Loading the latest standup digest...</p>
      </div>
    );
  }

  if (!report || error) {
    return (
      <div className="rounded-[var(--pe-radius-feature)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-2xl)] shadow-sm">
        <h2 className="mb-[var(--pe-space-sm)] text-[24px] font-semibold text-pe-text-primary">
          Generate the daily digest first
        </h2>
        <p className="mb-[var(--pe-space-lg)] max-w-[48rem] text-[16px] leading-6 text-pe-text-secondary">
          {error || 'The standup dashboard needs a generated report JSON before it can render.'}
        </p>
        <code className="inline-flex rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-secondary px-[var(--pe-space-md)] py-[var(--pe-space-sm)] text-[13px] text-pe-text-primary">
          npm run standup:generate
        </code>
      </div>
    );
  }

  return (
    <div className="space-y-[var(--pe-space-lg)]">
      <section className="sticky top-[var(--pe-space-lg)] z-10 rounded-[var(--pe-radius-container)] border border-pe-border-light bg-white/95 p-[var(--pe-space-lg)] shadow-sm backdrop-blur">
        <div className="flex flex-col gap-[var(--pe-space-lg)] xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-[56rem]">
            <p className="text-[14px] font-medium text-pe-primary-600">PolicyEngine pulse</p>
            <h1 className="mt-[var(--pe-space-xs)] text-[32px] font-semibold leading-[1.1] text-pe-text-primary">
              Review the team&apos;s last day of GitHub work by theme
            </h1>
            <p className="mt-[var(--pe-space-sm)] max-w-[48rem] text-[16px] leading-6 text-pe-text-secondary">
              Start with broad themes in standup, then drop into narrower focus areas only where the team needs more
              detail. The people panel is still there to validate the rollup against raw activity.
            </p>
          </div>

          <div className="grid gap-[var(--pe-space-sm)] sm:grid-cols-2 xl:w-[420px]">
            <div className="rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-secondary px-[var(--pe-space-md)] py-[var(--pe-space-sm)]">
              <p className="text-[12px] text-pe-text-tertiary">Window</p>
              <p className="mt-[2px] text-[14px] font-medium text-pe-text-primary">{report.window.label}</p>
            </div>
            <div className="rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-secondary px-[var(--pe-space-md)] py-[var(--pe-space-sm)]">
              <p className="text-[12px] text-pe-text-tertiary">Last generated</p>
              <p className="mt-[2px] text-[14px] font-medium text-pe-text-primary">{report.generatedAtLabel}</p>
            </div>
            <div className="sm:col-span-2 rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-primary px-[var(--pe-space-md)] py-[var(--pe-space-sm)]">
              <p className="text-[12px] text-pe-text-tertiary">Command</p>
              <code className="mt-[4px] block text-[13px] text-pe-text-primary">npm run standup:generate</code>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-[var(--pe-space-lg)] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-[var(--pe-space-lg)]">
          <div className="grid gap-[var(--pe-space-md)] md:grid-cols-2 2xl:grid-cols-5">
            <div className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
              <p className="text-[12px] text-pe-text-tertiary">Active members</p>
              <p className="mt-[var(--pe-space-xs)] text-[28px] font-semibold text-pe-text-primary">
                {report.overview.activeMemberCount}/{report.overview.memberCount}
              </p>
            </div>
            <div className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
              <p className="text-[12px] text-pe-text-tertiary">Themes</p>
              <p className="mt-[var(--pe-space-xs)] text-[28px] font-semibold text-pe-text-primary">
                {report.overview.totalThemeCount}
              </p>
            </div>
            <div className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
              <p className="text-[12px] text-pe-text-tertiary">Focus areas</p>
              <p className="mt-[var(--pe-space-xs)] text-[28px] font-semibold text-pe-text-primary">
                {report.overview.totalTopicCount}
              </p>
            </div>
            <div className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
              <p className="text-[12px] text-pe-text-tertiary">Activity items</p>
              <p className="mt-[var(--pe-space-xs)] text-[28px] font-semibold text-pe-text-primary">
                {report.overview.totalItemCount}
              </p>
            </div>
            <div className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
              <p className="text-[12px] text-pe-text-tertiary">Commit signals</p>
              <p className="mt-[var(--pe-space-xs)] text-[28px] font-semibold text-pe-text-primary">
                {report.overview.totalCommitCount}
              </p>
            </div>
          </div>

          <section className="space-y-[var(--pe-space-md)]">
            <div className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
              <h2 className="text-[24px] font-semibold text-pe-text-primary">Theme review</h2>
              <p className="mt-[var(--pe-space-xs)] text-[15px] leading-6 text-pe-text-secondary">
                Use these broader sections to keep standup moving. Each theme contains narrower focus areas only when
                the work clearly clusters that way.
              </p>
            </div>

            <div className="space-y-[var(--pe-space-md)]">
              {report.themes.map((theme) => (
                <article
                  key={theme.id}
                  className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm"
                >
                  <div className="flex flex-col gap-[var(--pe-space-md)] lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-[var(--pe-space-sm)]">
                        {theme.members.map((member) => (
                          <span
                            key={`${theme.id}-${member}`}
                            className="rounded-[var(--pe-radius-element)] bg-pe-primary-50 px-[var(--pe-space-sm)] py-[calc(var(--pe-space-xs)-1px)] text-[12px] font-medium text-pe-primary-700"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                      <h3 className="mt-[var(--pe-space-md)] text-[24px] font-semibold text-pe-text-primary">
                        {theme.label}
                      </h3>
                      <p className="mt-[var(--pe-space-xs)] text-[14px] text-pe-text-secondary">
                        {formatCountLabel(theme.topics.length, 'focus area', 'focus areas')} ·{' '}
                        {formatCountLabel(theme.counts.totalItems, 'signal', 'signals')} ·{' '}
                        {formatCountLabel(theme.counts.totalCommits, 'commit', 'commits')}
                      </p>
                      <div className="mt-[var(--pe-space-md)] flex flex-wrap gap-[var(--pe-space-sm)]">
                        {theme.repos.map((repo) => (
                          <RepoBadge key={`${theme.id}-${repo}`} repo={repo} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-[var(--pe-space-lg)] space-y-[var(--pe-space-sm)]">
                    {theme.topics.map((topic) => (
                      <TopicCluster key={topic.id} topic={topic} themeLabel={theme.label} />
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-[var(--pe-space-md)]">
          <section className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
            <h2 className="text-[20px] font-semibold text-pe-text-primary">People</h2>
            <p className="mt-[var(--pe-space-xs)] text-[14px] leading-6 text-pe-text-secondary">
              Use this panel to validate the theme rollup and spot who may need a fuller verbal update.
            </p>

            <div className="mt-[var(--pe-space-lg)] space-y-[var(--pe-space-sm)]">
              {report.people.map((person) => (
                <div
                  key={person.github}
                  className="rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-secondary px-[var(--pe-space-md)] py-[var(--pe-space-md)]"
                >
                  <div className="flex items-start justify-between gap-[var(--pe-space-sm)]">
                    <div className="min-w-0">
                      <p className="text-[16px] font-medium text-pe-text-primary">{person.name}</p>
                      <p
                        className="mt-[2px] text-[12px] text-pe-text-tertiary"
                        style={{ fontFamily: 'var(--pe-font-family-mono)' }}
                      >
                        {person.github}
                      </p>
                    </div>
                    <p className="text-[18px] font-semibold text-pe-text-primary">{person.counts.totalItems}</p>
                  </div>

                  {person.themes.length > 0 && (
                    <div className="mt-[var(--pe-space-sm)] flex flex-wrap gap-[var(--pe-space-xs)]">
                      {person.themes.slice(0, 3).map((theme) => (
                        <span
                          key={`${person.github}-${theme.label}`}
                          className="rounded-[var(--pe-radius-element)] border border-pe-border-light bg-pe-bg-primary px-[var(--pe-space-sm)] py-[calc(var(--pe-space-xs)-1px)] text-[12px] text-pe-text-secondary"
                        >
                          {theme.label} · {theme.count}
                        </span>
                      ))}
                    </div>
                  )}

                  {person.repoCommitCounts.length > 0 && (
                    <div className="mt-[var(--pe-space-sm)] space-y-[var(--pe-space-xs)]">
                      {person.repoCommitCounts.slice(0, 2).map((repo) => (
                        <a
                          key={`${person.github}-${repo.repo}`}
                          href={repo.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-[var(--pe-radius-element)] bg-pe-bg-primary px-[var(--pe-space-sm)] py-[calc(var(--pe-space-xs)+1px)] text-[12px] text-pe-text-secondary hover:text-pe-primary-600"
                        >
                          <span
                            className="truncate pr-[var(--pe-space-sm)]"
                            style={{ fontFamily: 'var(--pe-font-family-mono)' }}
                          >
                            {repo.repo}
                          </span>
                          <span>{repo.commitCount}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {report.inactivePeople.length > 0 && (
            <section className="rounded-[var(--pe-radius-container)] border border-pe-border-light bg-pe-bg-primary p-[var(--pe-space-lg)] shadow-sm">
              <h2 className="text-[20px] font-semibold text-pe-text-primary">No in-scope GitHub activity</h2>
              <p className="mt-[var(--pe-space-xs)] text-[14px] leading-6 text-pe-text-secondary">
                {report.inactivePeople.map((person) => person.name).join(', ')}
              </p>
            </section>
          )}
        </aside>
      </section>
    </div>
  );
}
