---
title: I built a GitHub star monitor in a single YAML file — zero dependencies, zero config
published: false
description: Fork one repo, add one secret, and never miss a GitHub star again. No server, no dependencies, just GitHub Actions.
tags: github, opensource, actions, automation
cover_image: https://raw.githubusercontent.com/WoojinAhn/github-star-checker/master/.github/assets/screenshot-workflow-dispatch.png
---

GitHub doesn't notify you when someone stars your repo. Or unstars it. You either refresh your profile page like a maniac, or you just... never find out.

Tools like [star-history.com](https://star-history.com) let you look up trends, but you have to visit the site every time. GitHub Apps like [Star Notifier](https://github.com/marketplace/star-notifier) automate it, but now a third-party service is handling your tokens. Self-hosted solutions like [github-star-notifier](https://github.com/omkarcloud/github-star-notifier) need a server running somewhere.

I wanted something **automatic** that requires **zero infrastructure**. So I built it using nothing but GitHub Actions.

## What it does

**GitHub Star Checker** monitors star counts across all your public repositories and notifies you when stars change — gains or losses.

- Runs every hour by default (configurable from the GitHub UI)
- Sends alerts via **GitHub Issues** or **Gmail**
- Generates **weekly and monthly reports**
- All logic lives in a **single workflow file**

No server, no database, no dependencies — just one YAML file and GitHub's free compute.

## How it works

![GitHub Actions workflow dispatch UI showing schedule, notification channel, and report options](https://raw.githubusercontent.com/WoojinAhn/github-star-checker/master/.github/assets/screenshot-workflow-dispatch.png)

1. A cron job triggers every hour on GitHub Actions
2. Fetches star counts for all your public, non-fork repos via the GitHub API
3. Compares with the previous snapshot stored in `stars.json`
4. If anything changed → sends a notification
5. Commits the updated data back to the repo

The workflow updates itself — including the schedule and notification settings — so you configure everything from the GitHub UI. No code editing needed.

Since it runs in its own forked repo, your existing repositories stay completely untouched.

## What the notifications look like

### GitHub Issue alert

![GitHub Issue notification showing a new star gain on a repository](https://raw.githubusercontent.com/WoojinAhn/github-star-checker/master/.github/assets/screenshot-issue-alert.png)

### Email alert

![Gmail inbox showing a GitHub star change alert email](https://raw.githubusercontent.com/WoojinAhn/github-star-checker/master/.github/assets/screenshot-email-alert.png)

### Weekly report

![GitHub Issue showing a weekly star summary report with total counts](https://raw.githubusercontent.com/WoojinAhn/github-star-checker/master/.github/assets/screenshot-weekly-report.png)

## Setup in 60 seconds

1. [**Fork the repo**](https://github.com/WoojinAhn/github-star-checker/fork)
2. Enable workflows in the Actions tab
3. Add your [Personal Access Token](https://github.com/settings/tokens/new) (`repo` + `workflow` scopes) as `STAR_MONITOR_TOKEN` in Settings > Secrets
4. Run the workflow — done.

The first run records your current star counts. From the second run onward, you'll get notified about any changes.

**That's it.** No YAML to write, no config files to edit, no CLI to install.

## Why not just use a GitHub App?

Fair question. Apps like Star Notifier are convenient — install and go. But:

- They're **third-party services** processing your GitHub data
- You can't customize the logic or notification format
- If the service goes down or gets discontinued, you lose it

This project is **entirely yours**. It's a fork in your account, running on GitHub's own infrastructure. You can read every line of code, modify anything, and it'll keep running as long as GitHub Actions exists.

## Interesting technical bits

- **Self-modifying YAML**: When you change settings via `workflow_dispatch`, the workflow uses `sed` to update its own cron schedule and env variables, then commits the change. Future runs pick up the new settings automatically.
- **Zero-conflict git strategy**: The workflow stashes local changes, rebases on remote, then pops — handling concurrent scheduled runs gracefully.
- **32-day history retention**: Daily snapshots are stored in `stars-history.json` for weekly/monthly reports, with automatic pruning.

## Limitations

Being honest about the trade-offs:

- **Not real-time**: GitHub Actions cron can delay 5–30 minutes. This is periodic monitoring, not instant webhook-based alerts.
- **Notification channels**: Currently supports GitHub Issues and Gmail. No Slack/Discord/Telegram yet (PRs welcome!).
- **Commit history**: The workflow commits `stars.json` updates to the forked repo. This is by design (persistence without external storage), but your fork's commit log will grow over time.
- **API usage**: Each run makes one paginated API call. Even with 100+ repos, it stays well within GitHub's rate limits.

## Try it out

👉 [**github.com/WoojinAhn/github-star-checker**](https://github.com/WoojinAhn/github-star-checker)

Fork it, set one secret, and forget about it. You'll know when your stars move.

If you find it useful, a ⭐ would be appreciated — and yes, I'll get notified about it 😄
