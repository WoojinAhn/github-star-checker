# GitHub Star Checker

[한국어](README.ko.md)

A GitHub Actions workflow that monitors star counts across your public, non-fork repositories and notifies you when stars change — via GitHub Issues (default) or Gmail SMTP.

> **0 dependencies · GitHub Actions only · Single workflow file**

## How It Works

1. Runs every hour by default (configurable via `workflow_dispatch`)
2. Fetches star counts for all public, non-fork repositories owned by the authenticated user
3. Compares with previously recorded counts in `stars.json`
4. Notifies about star changes — creates a GitHub Issue (default) or sends an email via Gmail SMTP, configurable via `workflow_dispatch`
5. Commits the updated `stars.json` back to the repository

On the first run, it records the current star counts without sending notifications.

## Note

No local clone is required. All logic runs on GitHub Actions. Setup and configuration can be done entirely through the GitHub web UI.

## Prerequisites

- [Classic Personal Access Token](https://github.com/settings/tokens/new) with `repo` and `workflow` scopes (e.g. `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
  > The default `GITHUB_TOKEN` provided by GitHub Actions can only access the current repository. A separate PAT is required to list all owned repositories.
- *(Optional, only for `gmail` or `both` notification channel)* Gmail account with [2-Step Verification](https://myaccount.google.com/security) enabled + [App Password](https://myaccount.google.com/apppasswords) (e.g. `abcd efgh ijkl mnop`)

## Quick Start (Fork)

1. Fork this repository
2. Go to the **Actions** tab and enable workflows (disabled by default on forks)
3. Register `STAR_MONITOR_TOKEN` in **Settings > Secrets and variables > Actions** (Gmail secrets only needed if using `gmail` or `both` notification channel)
4. Run the workflow manually from the Actions tab, or wait for the next scheduled run

## Repository Secrets

Register the following secrets with the values prepared above:

| Secret | Value |
|--------|-------|
| `STAR_MONITOR_TOKEN` | Classic PAT |
| `GMAIL_USER` | Gmail address for sending *(optional)* |
| `GMAIL_APP_PASSWORD` | Gmail app password *(optional)* |
| `NOTIFY_EMAIL` | Email address to receive notifications *(optional)* |

Or via [GitHub CLI](https://cli.github.com/):

```sh
gh secret set STAR_MONITOR_TOKEN
gh secret set GMAIL_USER
gh secret set GMAIL_APP_PASSWORD
gh secret set NOTIFY_EMAIL
```

## Email Example

```
Subject: ⭐ GitHub Star Alert: 3 repo(s) changed!

⬆️ Gained:
- user/repo-a: 3 → 5 (+2)
- user/repo-b: 0 → 1 (+1)

⬇️ Lost:
- user/repo-c: 10 → 8 (-2)

Total stars: 42
Checked at: 2026-02-18T12:13:19Z
```

## Limits

GitHub Actions free tier provides 2,000 minutes/month. This workflow takes ~10 seconds per run, so running every hour (default) uses ~75 minutes/month. You can change the interval from the Actions tab via `workflow_dispatch`.

## File Structure

```
.github/workflows/check-stars.yml  # Workflow definition (all logic is inline)
stars.json                          # Star count snapshot (auto-updated by the workflow)
```
