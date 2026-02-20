# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

GitHub star monitoring tool that runs as a GitHub Actions workflow. Every hour by default (configurable via `workflow_dispatch`), it checks star counts on all repositories owned by the authenticated user, records them in `stars.json`, and creates GitHub Issues when star increases are detected.

## Architecture

- **Single workflow**: `.github/workflows/check-stars.yml` — contains all logic inline via `actions/github-script@v7`
- **Data store**: `stars.json` — persisted via git commit by the workflow itself
- **Notifications**: Star increases create Issues in this repository with the `star-notification` label
- First run initializes `stars.json` without creating notifications

## Secrets

- `STAR_MONITOR_TOKEN` — GitHub PAT with repo access, used to list all owned repositories (the default `GITHUB_TOKEN` only sees the current repo)

## Testing Locally

The workflow can be triggered manually via `workflow_dispatch` on GitHub. There is no local test setup — the logic runs entirely within GitHub Actions using `actions/github-script`.
