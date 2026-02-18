# GitHub Star Checker

[한국어](README.ko.md)

A GitHub Actions workflow that monitors star counts across all your repositories and sends an email notification when stars increase.

## How It Works

1. Runs every 30 minutes (or manually via `workflow_dispatch`)
2. Fetches star counts for all repositories owned by the authenticated user
3. Compares with previously recorded counts in `stars.json`
4. Sends an email via Gmail SMTP listing repos that gained stars (with total star count)
5. Commits the updated `stars.json` back to the repository

On the first run, it records the current star counts without sending notifications.

## Note

No local clone is required. All logic runs on GitHub Actions. Setup and configuration can be done entirely through the GitHub web UI.

## Prerequisites

- [Classic Personal Access Token](https://github.com/settings/tokens/new) with `repo` and `workflow` scopes
- Gmail account with [2-Step Verification](https://myaccount.google.com/security) enabled + [App Password](https://myaccount.google.com/apppasswords)

## Quick Start (Fork)

1. Fork this repository
2. Go to the **Actions** tab and enable workflows (disabled by default on forks)
3. Register the 4 secrets below in **Settings > Secrets and variables > Actions**
4. Run the workflow manually from the Actions tab, or wait for the next scheduled run

## Setup

### 1. GitHub PAT

Create a [Classic Personal Access Token](https://github.com/settings/tokens/new) with `repo` and `workflow` scopes.

> The default `GITHUB_TOKEN` provided by GitHub Actions can only access the current repository. A separate PAT is required to list all owned repositories.

### 2. Gmail App Password

1. Enable [2-Step Verification](https://myaccount.google.com/security) on your Google account
2. Generate an [App Password](https://myaccount.google.com/apppasswords) (select app name e.g. `star-checker`)

### 3. Repository Secrets

Register the following secrets in the repository:

| Secret | Description |
|--------|-------------|
| `STAR_MONITOR_TOKEN` | GitHub Classic PAT (`repo` + `workflow` scopes) |
| `GMAIL_USER` | Gmail address used for sending |
| `GMAIL_APP_PASSWORD` | Gmail app password from step 2 |
| `NOTIFY_EMAIL` | Email address to receive notifications |

```sh
gh secret set STAR_MONITOR_TOKEN
gh secret set GMAIL_USER
gh secret set GMAIL_APP_PASSWORD
gh secret set NOTIFY_EMAIL
```

## Email Example

```
Subject: ⭐ GitHub Star Alert: 2 repo(s) gained stars!

- user/repo-a: 3 → 5 (+2)
- user/repo-b: 0 → 1 (+1)

Total stars: 42
Checked at: 2026-02-18T12:13:19Z
```

## Limits

GitHub Actions free tier provides 2,000 minutes/month. This workflow takes ~10 seconds per run, so running every 30 minutes uses ~150 minutes/month.

## File Structure

```
.github/workflows/check-stars.yml  # Workflow definition (all logic is inline)
stars.json                          # Star count snapshot (auto-updated by the workflow)
```
