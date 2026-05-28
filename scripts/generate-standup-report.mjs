#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const DEFAULT_THEME_RULES = [
  {
    id: 'us-policy-modeling',
    label: 'US policy modeling',
    match: [' state supplementary payment ', ' snap ', ' aca ', ' calworks ', ' tanf '],
  },
  {
    id: 'data-calibration',
    label: 'Data and calibration',
    match: [
      ' calibration',
      ' jct ',
      'tax expenditure',
      ' donor impute ',
      ' imputation ',
      ' soi ',
      ' puf ',
      ' cps ',
    ],
  },
  {
    id: 'public-tools',
    label: 'Public tools and calculators',
    match: [
      ' wealth tax',
      ' billionaire',
      ' forbes ',
      ' deduction repeal',
      ' uk land value tax ',
      ' rent control ',
      ' dashboard',
    ],
  },
  {
    id: 'uk-model-work',
    label: 'UK model and data work',
    match: [' universal credit ', ' class 2 ni ', ' scp ', ' social rent '],
  },
  {
    id: 'api-docs',
    label: 'APIs and developer docs',
    match: [' household api ', ' docker ', ' python api ', ' self serve ', ' docs '],
  },
  {
    id: 'internal-tooling',
    label: 'Internal tooling and workflows',
    match: [' skill ', ' workflow ', ' github app token', ' graphviz ', ' reactflow '],
  },
];

const DEFAULT_TOPIC_RULES = [
  {
    id: 'state-supplementary-payments',
    label: 'State supplementary payments',
    match: [' state supplementary payment ', ' ssp '],
  },
  {
    id: 'snap-rules',
    label: 'SNAP historical rules',
    match: [' snap ', ' shelter cap', 'allotments', 'asset limits'],
  },
  {
    id: 'aca-premiums',
    label: 'ACA premiums',
    match: [' aca ', 'rating area premium', 'premiums'],
  },
  {
    id: 'calworks-tanf',
    label: 'CalWORKs and TANF',
    match: ['calworks', ' tanf '],
  },
  {
    id: 'mortgage-interest',
    label: 'Mortgage interest deduction',
    match: ['mortgage', ' interest deduction', ' mid '],
  },
  {
    id: 'calibration-targets',
    label: 'Calibration and tax expenditure targets',
    match: [' calibration', ' jct ', 'tax expenditure', ' soi table', ' top tail '],
  },
  {
    id: 'cps-puf-imputation',
    label: 'CPS and PUF imputation',
    match: [' donor-impute', ' cps ', ' puf ', ' clone '],
  },
  {
    id: 'wealth-tax',
    label: 'Wealth tax tools and billionaire data',
    match: ['wealth tax', ' forbes', ' billionaire', 'migration modeling', 'departure'],
  },
  {
    id: 'deduction-repeal',
    label: 'Deduction repeal analysis',
    match: ['deduction repeal', 'repealing us tax deductions'],
  },
];

function parseArgs(argv) {
  const options = {
    hours: 24,
    config: path.join(repoRoot, 'public/data/team-members.json'),
    output: path.join(repoRoot, 'public/data/standup-report.json'),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--hours') {
      options.hours = Number(argv[i + 1]);
      i += 1;
    } else if (arg === '--from') {
      options.from = argv[i + 1];
      i += 1;
    } else if (arg === '--to') {
      options.to = argv[i + 1];
      i += 1;
    } else if (arg === '--config') {
      options.config = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    } else if (arg === '--output') {
      options.output = path.resolve(repoRoot, argv[i + 1]);
      i += 1;
    }
  }

  return options;
}

function runGhJson(args) {
  try {
    const stdout = execFileSync('gh', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(stdout);
  } catch (error) {
    const stderr = error.stderr?.toString() || error.message;
    throw new Error(`gh ${args.join(' ')} failed: ${stderr}`);
  }
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ensureDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function toSearchTimestamp(date) {
  return date.toISOString();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function normalizeText(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesRule(haystack, term) {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) {
    return false;
  }

  const pattern = normalizedTerm
    .split(/\s+/)
    .map((part) => escapeRegex(part))
    .join('\\s+');

  return new RegExp(`(^|\\s)${pattern}($|\\s)`).test(haystack);
}

function trimActionPrefix(title) {
  return title
    .replace(/^\[[^\]]+\]\s*/i, '')
    .replace(
      /^(add|fix|implement|backdate|make|update|treat|donor-impute|improve|refactor|restore|replace|switch|show|limit|create|initial|polish|clarify)\s+/i,
      '',
    )
    .replace(/\s+at\s+\/.+$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortenRepo(repoName) {
  return repoName.includes('/') ? repoName.split('/')[1] : repoName;
}

function isInScope(repoName, config) {
  if (!repoName) {
    return false;
  }

  if (!config.focusOrgs?.length && !config.focusRepos?.length) {
    return true;
  }

  const [owner] = repoName.split('/');
  return config.focusRepos?.includes(repoName) || config.focusOrgs?.includes(owner);
}

function deriveTopic(item, config) {
  const theme = deriveTheme(item, config);
  const rules = [...DEFAULT_TOPIC_RULES, ...(config.topicRules || [])];
  const haystack = normalizeText(`${item.title || ''} ${item.repo || ''}`);

  for (const rule of rules) {
    if ((rule.match || []).some((term) => matchesRule(haystack, term))) {
      return { id: slugify(rule.label), label: rule.label };
    }
  }

  if (theme) {
    return {
      id: slugify(theme.label),
      label: theme.label,
    };
  }

  if (item.repo && config.repoTopics?.[item.repo]) {
    return {
      id: slugify(config.repoTopics[item.repo]),
      label: config.repoTopics[item.repo],
    };
  }

  if (item.kind === 'repo_commits') {
    const fallback = `${shortenRepo(item.repo)} work`;
    return { id: slugify(fallback), label: fallback };
  }

  const fallback = trimActionPrefix(item.title || shortenRepo(item.repo));
  return { id: slugify(fallback), label: fallback };
}

function deriveTheme(item, config) {
  const rules = [...DEFAULT_THEME_RULES, ...(config.themeRules || [])];
  const haystack = normalizeText(`${item.title || ''} ${item.repo || ''}`);

  for (const rule of rules) {
    if ((rule.match || []).some((term) => matchesRule(haystack, term))) {
      return { id: slugify(rule.label), label: rule.label };
    }
  }

  if (item.repo && config.repoThemes?.[item.repo]) {
    return {
      id: slugify(config.repoThemes[item.repo]),
      label: config.repoThemes[item.repo],
    };
  }

  if (item.repo && config.repoTopics?.[item.repo]) {
    return {
      id: slugify(config.repoTopics[item.repo]),
      label: config.repoTopics[item.repo],
    };
  }

  if (item.kind === 'repo_commits') {
    const fallback = `${shortenRepo(item.repo)} work`;
    return { id: slugify(fallback), label: fallback };
  }

  return { id: 'misc-work', label: 'Other work' };
}

function formatTimestamp(isoString) {
  return new Date(isoString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function uniqueBy(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

const SEARCH_QUERY = `
query($searchQuery: String!) {
  search(type: ISSUE, query: $searchQuery, first: 100) {
    nodes {
      ... on PullRequest {
        number
        title
        url
        state
        isDraft
        createdAt
        updatedAt
        mergedAt
        repository {
          nameWithOwner
          url
        }
      }
      ... on Issue {
        number
        title
        url
        state
        createdAt
        updatedAt
        repository {
          nameWithOwner
          url
        }
      }
    }
  }
}
`;

const CONTRIBUTIONS_QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    login
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      restrictedContributionsCount
      commitContributionsByRepository(maxRepositories: 100) {
        repository {
          nameWithOwner
          url
        }
        contributions(first: 100) {
          nodes {
            occurredAt
            commitCount
            repository {
              nameWithOwner
              url
            }
          }
        }
      }
    }
  }
}
`;

function fetchSearchItems(query) {
  const response = runGhJson([
    'api',
    'graphql',
    '-f',
    `query=${SEARCH_QUERY}`,
    '-F',
    `searchQuery=${query}`,
  ]);
  return response.data.search.nodes || [];
}

function fetchCommitSignals(login, fromIso, toIso) {
  const response = runGhJson([
    'api',
    'graphql',
    '-f',
    `query=${CONTRIBUTIONS_QUERY}`,
    '-F',
    `login=${login}`,
    '-F',
    `from=${fromIso}`,
    '-F',
    `to=${toIso}`,
  ]);

  return response.data.user?.contributionsCollection || {
    totalCommitContributions: 0,
    restrictedContributionsCount: 0,
    commitContributionsByRepository: [],
  };
}

function mapAuthoredItems(member, nodes, config) {
  return nodes
    .filter((node) => node.repository && isInScope(node.repository.nameWithOwner, config))
    .map((node) => {
      const isPr = 'isDraft' in node;
      return {
        id: `${member.github}-${node.repository.nameWithOwner}-${node.number}-${isPr ? 'pr' : 'issue'}`,
        member: member.name,
        github: member.github,
        kind: isPr ? 'authored_pr' : 'authored_issue',
        repo: node.repository.nameWithOwner,
        repoUrl: node.repository.url,
        number: node.number,
        title: node.title,
        url: node.url,
        state: node.state,
        createdAt: node.createdAt,
        updatedAt: node.updatedAt,
        mergedAt: node.mergedAt || null,
      };
    });
}

function mapReviewedItems(member, nodes, config) {
  return nodes
    .filter((node) => node.repository && isInScope(node.repository.nameWithOwner, config))
    .map((node) => ({
      id: `${member.github}-${node.repository.nameWithOwner}-${node.number}-review`,
      member: member.name,
      github: member.github,
      kind: 'reviewed_pr',
      repo: node.repository.nameWithOwner,
      repoUrl: node.repository.url,
      number: node.number,
      title: node.title,
      url: node.url,
      state: node.state,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      mergedAt: node.mergedAt || null,
    }));
}

function mapCommitItems(member, collection, config) {
  const byRepo = new Map();

  for (const repoNode of collection.commitContributionsByRepository || []) {
    const repoName = repoNode.repository?.nameWithOwner;
    if (!repoName || !isInScope(repoName, config)) {
      continue;
    }

    const current = byRepo.get(repoName) || {
      repo: repoName,
      repoUrl: repoNode.repository.url,
      commitCount: 0,
      latestAt: null,
    };

    for (const contribution of repoNode.contributions.nodes || []) {
      current.commitCount += contribution.commitCount;
      if (!current.latestAt || contribution.occurredAt > current.latestAt) {
        current.latestAt = contribution.occurredAt;
      }
    }

    byRepo.set(repoName, current);
  }

  return [...byRepo.values()]
    .filter((entry) => entry.commitCount > 0)
    .map((entry) => ({
      id: `${member.github}-${entry.repo}-repo-commits`,
      member: member.name,
      github: member.github,
      kind: 'repo_commits',
      repo: entry.repo,
      repoUrl: entry.repoUrl,
      number: null,
      title: `${entry.commitCount} commits in ${shortenRepo(entry.repo)}`,
      url: entry.repoUrl,
      state: null,
      createdAt: entry.latestAt,
      updatedAt: entry.latestAt,
      mergedAt: null,
      commitCount: entry.commitCount,
    }));
}

function attachTopics(items, config) {
  return items.map((item) => {
    const theme = deriveTheme(item, config);
    const topic = deriveTopic(item, config);
    return {
      ...item,
      themeId: theme.id,
      themeLabel: theme.label,
      topicId: topic.id,
      topicLabel: topic.label,
    };
  });
}

function summarizePerson(member, items) {
  const repoCommitCounts = items
    .filter((item) => item.kind === 'repo_commits')
    .sort((a, b) => (b.commitCount || 0) - (a.commitCount || 0))
    .map((item) => ({
      repo: item.repo,
      repoUrl: item.repoUrl,
      commitCount: item.commitCount || 0,
      topicLabel: item.topicLabel,
    }));

  const themeCounts = new Map();
  for (const item of items) {
    const current = themeCounts.get(item.themeLabel) || 0;
    themeCounts.set(item.themeLabel, current + 1);
  }

  return {
    name: member.name,
    github: member.github,
    counts: {
      authoredPrs: items.filter((item) => item.kind === 'authored_pr').length,
      authoredIssues: items.filter((item) => item.kind === 'authored_issue').length,
      reviewedPrs: items.filter((item) => item.kind === 'reviewed_pr').length,
      commitSignals: items.filter((item) => item.kind === 'repo_commits').length,
      totalItems: items.length,
      totalCommits: repoCommitCounts.reduce((sum, item) => sum + item.commitCount, 0),
    },
    themes: [...themeCounts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)),
    repoCommitCounts,
    items: items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')),
  };
}

function buildTopics(items) {
  const topics = new Map();

  for (const item of items) {
    const current = topics.get(item.topicId) || {
      id: item.topicId,
      label: item.topicLabel,
      members: new Set(),
      repos: new Set(),
      counts: {
        totalItems: 0,
        authoredPrs: 0,
        authoredIssues: 0,
        reviewedPrs: 0,
        commitSignals: 0,
        totalCommits: 0,
      },
      items: [],
    };

    current.members.add(item.member);
    current.repos.add(item.repo);
    current.counts.totalItems += 1;
    if (item.kind === 'authored_pr') current.counts.authoredPrs += 1;
    if (item.kind === 'authored_issue') current.counts.authoredIssues += 1;
    if (item.kind === 'reviewed_pr') current.counts.reviewedPrs += 1;
    if (item.kind === 'repo_commits') {
      current.counts.commitSignals += 1;
      current.counts.totalCommits += item.commitCount || 0;
    }
    current.items.push(item);
    topics.set(item.topicId, current);
  }

  return [...topics.values()]
    .map((topic) => ({
      ...topic,
      members: [...topic.members].sort(),
      repos: [...topic.repos].sort(),
      items: topic.items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')),
    }))
    .sort((a, b) => {
      const memberDiff = b.members.length - a.members.length;
      if (memberDiff !== 0) return memberDiff;
      const itemDiff = b.counts.totalItems - a.counts.totalItems;
      if (itemDiff !== 0) return itemDiff;
      return a.label.localeCompare(b.label);
    });
}

function buildThemes(items) {
  const themes = new Map();

  for (const item of items) {
    const current = themes.get(item.themeId) || {
      id: item.themeId,
      label: item.themeLabel,
      members: new Set(),
      repos: new Set(),
      counts: {
        totalItems: 0,
        authoredPrs: 0,
        authoredIssues: 0,
        reviewedPrs: 0,
        commitSignals: 0,
        totalCommits: 0,
      },
      items: [],
    };

    current.members.add(item.member);
    current.repos.add(item.repo);
    current.counts.totalItems += 1;
    if (item.kind === 'authored_pr') current.counts.authoredPrs += 1;
    if (item.kind === 'authored_issue') current.counts.authoredIssues += 1;
    if (item.kind === 'reviewed_pr') current.counts.reviewedPrs += 1;
    if (item.kind === 'repo_commits') {
      current.counts.commitSignals += 1;
      current.counts.totalCommits += item.commitCount || 0;
    }
    current.items.push(item);
    themes.set(item.themeId, current);
  }

  return [...themes.values()]
    .map((theme) => ({
      ...theme,
      members: [...theme.members].sort(),
      repos: [...theme.repos].sort(),
      topics: buildTopics(theme.items),
      items: theme.items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')),
    }))
    .sort((a, b) => {
      const memberDiff = b.members.length - a.members.length;
      if (memberDiff !== 0) return memberDiff;
      const itemDiff = b.counts.totalItems - a.counts.totalItems;
      if (itemDiff !== 0) return itemDiff;
      return a.label.localeCompare(b.label);
    });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const config = loadJson(options.config);

  const now = options.to ? new Date(options.to) : new Date();
  const from = options.from ? new Date(options.from) : new Date(now.getTime() - options.hours * 60 * 60 * 1000);
  const fromIso = toSearchTimestamp(from);
  const toIso = toSearchTimestamp(now);

  const people = [];
  let allItems = [];

  for (const member of config.members) {
    const authoredQuery = `author:${member.github} updated:>=${fromIso} sort:updated-desc`;
    const reviewedQuery = `reviewed-by:${member.github} updated:>=${fromIso} sort:updated-desc`;

    const authoredNodes = fetchSearchItems(authoredQuery);
    const reviewedNodes = fetchSearchItems(reviewedQuery);
    const commitCollection = fetchCommitSignals(member.github, fromIso, toIso);

    const authoredItems = mapAuthoredItems(member, authoredNodes, config);
    const reviewedItems = mapReviewedItems(member, reviewedNodes, config);
    const commitItems = mapCommitItems(member, commitCollection, config);
    const items = attachTopics(
      uniqueBy([...authoredItems, ...reviewedItems, ...commitItems], (item) => item.id),
      config,
    );

    allItems = allItems.concat(items);
    people.push(
      summarizePerson(
        member,
        items,
      ),
    );
  }

  const topics = buildTopics(allItems);
  const themes = buildThemes(allItems);
  const activePeople = people.filter((person) => person.counts.totalItems > 0);
  const inactivePeople = people.filter((person) => person.counts.totalItems === 0);

  const report = {
    teamName: config.teamName,
    generatedAt: now.toISOString(),
    generatedAtLabel: formatTimestamp(now.toISOString()),
    window: {
      from: fromIso,
      to: toIso,
      hours: Number(((now.getTime() - from.getTime()) / 36e5).toFixed(2)),
      label: `${formatTimestamp(fromIso)} to ${formatTimestamp(toIso)}`,
    },
    scope: {
      focusOrgs: config.focusOrgs || [],
      focusRepos: config.focusRepos || [],
    },
    overview: {
      memberCount: config.members.length,
      activeMemberCount: activePeople.length,
      inactiveMemberCount: inactivePeople.length,
      totalThemeCount: themes.length,
      totalTopicCount: topics.length,
      totalItemCount: allItems.length,
      totalCommitCount: activePeople.reduce((sum, person) => sum + person.counts.totalCommits, 0),
    },
    themes,
    topics,
    people: people.sort((a, b) => b.counts.totalItems - a.counts.totalItems || a.name.localeCompare(b.name)),
    inactivePeople: inactivePeople.map((person) => ({
      name: person.name,
      github: person.github,
    })),
  };

  ensureDirectory(options.output);
  fs.writeFileSync(options.output, `${JSON.stringify(report, null, 2)}\n`);

  console.log(`Wrote standup report to ${path.relative(repoRoot, options.output)}`);
  console.log(
    `Active members: ${report.overview.activeMemberCount}/${report.overview.memberCount} | ` +
      `topics: ${report.overview.totalTopicCount} | items: ${report.overview.totalItemCount} | ` +
      `commit signals: ${report.overview.totalCommitCount}`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
