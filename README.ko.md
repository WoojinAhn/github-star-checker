# GitHub Star Checker

[English](README.md)

GitHub Actions 워크플로우로 소유한 공개(public) 레포지토리의 스타 수를 모니터링하고, 스타 변화(증가/감소)가 감지되면 GitHub Issue(기본) 또는 Gmail로 알림을 보냅니다. Private 및 Fork 레포는 제외됩니다.

> **의존성 0개 · GitHub Actions만 사용 · 워크플로우 파일 하나**

## 동작 방식

```mermaid
flowchart LR
    A["⏰ Cron (hourly)"] --> B["Fetch star counts\nfor all repos"]
    B --> C{"Stars\nchanged?"}
    C -->|Yes| D["🔔 Notify\n(Issue / Gmail)"]
    C -->|No| E["💾 Commit\nstars.json"]
    D --> E
```

1. 기본 1시간마다 자동 실행 (`workflow_dispatch`로 간격 변경 가능)
2. 인증된 사용자가 소유한 공개, 비포크(non-fork) 레포지토리의 스타 수를 조회
3. `stars.json`에 기록된 이전 수치와 비교
4. 스타 변화 알림 — GitHub Issue 생성(기본) 또는 Gmail SMTP 이메일 발송, `workflow_dispatch`로 변경 가능
5. 주간(월요일) / 월간(매월 1일) 스타 리포트 자동 생성
6. 갱신된 `stars.json`을 커밋하여 레포지토리에 반영

첫 실행 시에는 현재 스타 수만 기록하고 알림을 발송하지 않습니다.

## 참고

로컬에 클론할 필요 없습니다. 모든 로직은 GitHub Actions에서 실행됩니다. 설정과 관리는 GitHub 웹 UI에서 모두 가능합니다.

## 준비물

- [Classic Personal Access Token](https://github.com/settings/tokens/new) (`repo` + `workflow` 스코프) (예: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
  > GitHub Actions가 기본 제공하는 `GITHUB_TOKEN`은 현재 레포지토리만 접근할 수 있으므로, 전체 레포지토리 목록 조회를 위해 별도 PAT이 필요합니다.
- *(선택, `gmail` 또는 `both` 알림 채널 사용 시)* Gmail 계정 ([2단계 인증](https://myaccount.google.com/security) 활성화 필요) + [앱 비밀번호](https://myaccount.google.com/apppasswords) (예: `abcd efgh ijkl mnop`)

## 빠른 시작 (Fork)

1. 이 레포지토리를 Fork
2. **Actions** 탭에서 워크플로우 활성화 (Fork는 기본 비활성)
3. **Settings > Secrets and variables > Actions**에서 `STAR_MONITOR_TOKEN` 등록 (Gmail 시크릿은 `gmail` 또는 `both` 알림 채널 사용 시에만 필요)
4. Actions 탭에서 수동 실행하거나, 다음 스케줄 실행을 대기

<details>
<summary>수동 실행 옵션</summary>

![Workflow dispatch UI](.github/assets/screenshot-workflow-dispatch.png)

<!-- 스크린샷: Actions 탭 > "Run workflow" 드롭다운 (schedule, notification, report 옵션) -->

체크 간격, 알림 채널 변경, 리포트 수동 생성이 가능합니다.

</details>

## 레포지토리 시크릿

위에서 준비한 값으로 아래 시크릿을 등록:

| 시크릿 | 값 |
|--------|-----|
| `STAR_MONITOR_TOKEN` | Classic PAT |
| `GMAIL_USER` | 발송용 Gmail 주소 *(선택)* |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 *(선택)* |
| `NOTIFY_EMAIL` | 알림 수신 이메일 주소 *(선택)* |

또는 [GitHub CLI](https://cli.github.com/)로 등록:

```sh
gh secret set STAR_MONITOR_TOKEN
gh secret set GMAIL_USER
gh secret set GMAIL_APP_PASSWORD
gh secret set NOTIFY_EMAIL
```

## 알림 예시

### GitHub Issue

![Star notification issue](.github/assets/screenshot-issue-alert.png)

<!-- 스크린샷: "⭐ ...got 1 new star(s)!" 제목의 star-notification 라벨 Issue -->

### 이메일

![Star notification email](.github/assets/screenshot-email-alert.png)

<!-- 스크린샷: Gmail 수신함의 스타 알림 이메일 -->

```
제목: ⭐ GitHub Star Alert: 3 repo(s) changed!

⬆️ Gained:
- user/repo-a: 3 → 5 (+2)
- user/repo-b: 0 → 1 (+1)

⬇️ Lost:
- user/repo-c: 10 → 8 (-2)

Total stars: 42
Checked at: 2026-02-18T12:13:19Z
```

### 주간 / 월간 리포트

![Weekly report issue](.github/assets/screenshot-weekly-report.png)

<!-- 스크린샷: star-report 라벨의 주간/월간 요약 Issue -->

## 제한 사항

GitHub Actions 무료 티어는 월 2,000분을 제공합니다. 이 워크플로우는 1회 실행에 약 10초 소요되므로, 기본 1시간 간격 실행 시 월 ~75분 사용합니다. Actions 탭의 `workflow_dispatch`에서 간격을 변경할 수 있습니다.

## 파일 구조

```
.github/workflows/check-stars.yml  # 워크플로우 정의 (모든 로직이 인라인으로 포함)
stars.json                          # 스타 수 스냅샷 (워크플로우가 자동 갱신)
stars-history.json                  # 일별 스냅샷 (리포트용, 최근 32일 보관)
```
