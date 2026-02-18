# GitHub Star Checker

[English](README.md)

GitHub Actions 워크플로우로 소유한 모든 레포지토리의 스타 수를 모니터링하고, 스타가 증가하면 GitHub Issue로 알려줍니다.

## 동작 방식

1. 30분마다 자동 실행 (또는 `workflow_dispatch`로 수동 실행)
2. 인증된 사용자가 소유한 모든 레포지토리의 스타 수를 조회
3. `stars.json`에 기록된 이전 수치와 비교
4. 스타가 증가한 레포마다 `star-notification` 라벨이 붙은 GitHub Issue 생성
5. 갱신된 `stars.json`을 커밋하여 레포지토리에 반영

첫 실행 시에는 현재 스타 수만 기록하고 알림을 생성하지 않습니다.

## 설정 방법

1. `repo`와 `workflow` 스코프를 가진 [Classic Personal Access Token](https://github.com/settings/tokens/new) 생성
2. 레포지토리 시크릿으로 `STAR_MONITOR_TOKEN` 이름으로 등록
   ```
   gh secret set STAR_MONITOR_TOKEN
   ```
3. 스케줄에 따라 자동 실행되며, Actions 탭에서 수동 실행도 가능

> 기본 `GITHUB_TOKEN`은 현재 레포지토리만 접근할 수 있으므로, 전체 레포지토리 목록 조회를 위해 별도 PAT이 필요합니다.

## 파일 구조

```
.github/workflows/check-stars.yml  # 워크플로우 정의 (모든 로직이 인라인으로 포함)
stars.json                          # 스타 수 스냅샷 (워크플로우가 자동 갱신)
```
