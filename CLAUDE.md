# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

GitHub star monitoring tool that runs as a GitHub Actions workflow. Every hour by default (configurable via `workflow_dispatch`), it checks star counts on all repositories owned by the authenticated user, records them in `stars.json`, and notifies you when stars change (increase or decrease).

## Architecture

- **Single workflow**: `.github/workflows/check-stars.yml` — contains all logic inline via `actions/github-script@v7`
- **Data store**: `stars.json` (latest snapshot) + `stars-history.json` (daily snapshots, 32-day retention for weekly/monthly reports) — persisted via git commit by the workflow itself
- **Notifications**: Configurable via `NOTIFICATION_CHANNEL` env — `issue` (default), `gmail`, or `both`. Changeable via `workflow_dispatch`. Alerts use the `star-notification` label, reports use `star-report`
- **Reports**: Weekly (Monday UTC 00:xx) and monthly (1st UTC 00:xx) star summary reports generated automatically. Can also be triggered manually via `workflow_dispatch` report input
- First run initializes `stars.json` without creating notifications

## Secrets

- `STAR_MONITOR_TOKEN` — GitHub PAT with repo access, used to list all owned repositories (the default `GITHUB_TOKEN` only sees the current repo)

## Testing Locally

The workflow can be triggered manually via `workflow_dispatch` on GitHub. There is no local test setup — the logic runs entirely within GitHub Actions using `actions/github-script`.
