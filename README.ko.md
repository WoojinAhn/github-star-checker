# GitHub Star Checker

[English](README.md)

GitHub Actions 워크플로우로 소유한 모든 레포지토리의 스타 수를 모니터링하고, 스타가 증가하면 Gmail로 이메일 알림을 보냅니다.

> **의존성 0개 · GitHub Actions만 사용 · 워크플로우 파일 하나**

## 동작 방식

1. 30분마다 자동 실행 (또는 `workflow_dispatch`로 수동 실행)
2. 인증된 사용자가 소유한 모든 레포지토리의 스타 수를 조회
3. `stars.json`에 기록된 이전 수치와 비교
4. 스타가 증가한 레포 목록을 Gmail SMTP로 이메일 발송 (전체 스타 수 포함)
5. 갱신된 `stars.json`을 커밋하여 레포지토리에 반영

첫 실행 시에는 현재 스타 수만 기록하고 알림을 발송하지 않습니다.

## 참고

로컬에 클론할 필요 없습니다. 모든 로직은 GitHub Actions에서 실행됩니다. 설정과 관리는 GitHub 웹 UI에서 모두 가능합니다.

## 준비물

- [Classic Personal Access Token](https://github.com/settings/tokens/new) (`repo` + `workflow` 스코프) (예: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
  > GitHub Actions가 기본 제공하는 `GITHUB_TOKEN`은 현재 레포지토리만 접근할 수 있으므로, 전체 레포지토리 목록 조회를 위해 별도 PAT이 필요합니다.
- Gmail 계정 ([2단계 인증](https://myaccount.google.com/security) 활성화 필요) + [앱 비밀번호](https://myaccount.google.com/apppasswords) (예: `abcd efgh ijkl mnop`)

## 빠른 시작 (Fork)

1. 이 레포지토리를 Fork
2. **Actions** 탭에서 워크플로우 활성화 (Fork는 기본 비활성)
3. **Settings > Secrets and variables > Actions**에서 아래 시크릿 4개 등록
4. Actions 탭에서 수동 실행하거나, 다음 스케줄 실행을 대기

## 레포지토리 시크릿

위에서 준비한 값으로 아래 시크릿을 등록:

| 시크릿 | 값 |
|--------|-----|
| `STAR_MONITOR_TOKEN` | Classic PAT |
| `GMAIL_USER` | 발송용 Gmail 주소 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 |
| `NOTIFY_EMAIL` | 알림 수신 이메일 주소 |

또는 [GitHub CLI](https://cli.github.com/)로 등록:

```sh
gh secret set STAR_MONITOR_TOKEN
gh secret set GMAIL_USER
gh secret set GMAIL_APP_PASSWORD
gh secret set NOTIFY_EMAIL
```

## 이메일 예시

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

## 제한 사항

GitHub Actions 무료 티어는 월 2,000분을 제공합니다. 이 워크플로우는 1회 실행에 약 10초 소요되므로, 30분 간격 실행 시 월 ~150분 사용합니다.

## 파일 구조

```
.github/workflows/check-stars.yml  # 워크플로우 정의 (모든 로직이 인라인으로 포함)
stars.json                          # 스타 수 스냅샷 (워크플로우가 자동 갱신)
```
