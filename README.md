# GitHub Star Checker

[한국어](README.ko.md)

A GitHub Actions workflow that monitors star counts across all your repositories and notifies you via GitHub Issues when stars increase.

## How It Works

1. Runs every 30 minutes (or manually via `workflow_dispatch`)
2. Fetches star counts for all repositories owned by the authenticated user
3. Compares with previously recorded counts in `stars.json`
4. Creates a GitHub Issue with the `star-notification` label for each repo that gained stars
5. Commits the updated `stars.json` back to the repository

On the first run, it records the current star counts without creating any notifications.

## Setup

1. Create a [Classic Personal Access Token](https://github.com/settings/tokens/new) with `repo` and `workflow` scopes
2. Add it as a repository secret named `STAR_MONITOR_TOKEN`
   ```
   gh secret set STAR_MONITOR_TOKEN
   ```
3. The workflow will start running on schedule, or trigger it manually from the Actions tab

> The default `GITHUB_TOKEN` only has access to the current repository. A separate PAT is required to list all owned repositories.

## File Structure

```
.github/workflows/check-stars.yml  # Workflow definition (all logic is inline)
stars.json                          # Star count snapshot (auto-updated by the workflow)
```
