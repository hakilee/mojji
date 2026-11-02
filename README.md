# 슬랙모찌

텍스트를 Slack용 GIF 이모지로 만드는 브라우저 전용 사이트입니다.

배포: https://slackmoji.haklee.me

## 시작하기

Node 24.18 이상과 Yarn 4.18.1을 사용합니다. Corepack을 사용하는 경우 `corepack enable` 후 실행하세요. Corepack이 없다면 아래의 `yarn`을 `node .yarn/releases/yarn-4.18.1.cjs`로 대체할 수 있습니다.

```sh
yarn install --immutable
yarn prepare
yarn dev
```

http://127.0.0.1:5173 에서 편집기를 엽니다.

## 기능

- 한글 포함 텍스트, 3줄·40자까지 자동 크기 조절
- Black Han Sans, Jua, Noto Sans KR 로컬 글꼴과 Google Fonts 검색·적용
- 글자별 색상·가로/세로 그라데이션·배경색·투명 배경
- 9가지 모션: 없음·두근두근·통통·슬라이드·흔들흔들·빙글빙글·둥실둥실·갸우뚱·말랑말랑
- 40자·3줄 제한 에디터와 실시간 Slack 반응 카운터 미리보기
- 128×128 GIF 다운로드, 128KiB 상한, 무한 반복

모든 렌더링은 브라우저 안에서 이루어집니다. Google Fonts는 선택 시 외부에서 글꼴 파일을 불러오며 입력 텍스트를 API 매개변수로 전송하지 않습니다. 자체 UI 규칙은 [디자인 시스템](documentation/design-system.md)에 정리되어 있습니다. GIF 투명도는 반투명이 아닌 완전 투명/불투명을 지원합니다. 슬랙의 이모지 추가 메뉴에서 다운로드한 파일을 업로드하세요. 실제 Slack 업로드는 별도 계정 권한이 필요하며 자동 검증 범위에 포함하지 않습니다.

## 개발과 검증

React 19.3.1 · TanStack Router 1.170.46 · Tailwind CSS 4.3.3 · Vite 8.3.5. 설치 시점의 stable 버전을 사용하고 `yarn.lock`으로 재현합니다. TypeScript 7.0.2 · oxlint 1.90.0 · oxfmt 0.75.0을 사용합니다.

```sh
yarn verify       # format → lint → types (including tests) → tests → build
yarn test:watch
yarn preview     # production build first
```

Husky pre-commit은 형식·린트·타입을, pre-push는 전체 검증을 실행합니다. GitHub Actions는 사용하지 않습니다. 브라우저 테스트는 Aside CLI만 사용합니다. 로컬 훅은 서버 검증을 대신하지 않습니다.

## 저장소 안내

- [AGENTS.md](AGENTS.md): 작업 진입점
- [documentation](documentation/README.md): 워크플로와 품질 지침
- [specs/editor.md](specs/editor.md): 제품 계약과 검증 연결
- [research/initialization.md](research/initialization.md): 참고 자료와 선택 근거
- `src/`: 제품 코드와 colocated TypeScript 테스트
- `public/licenses/`: 번들 글꼴의 OFL 라이선스

[GitHub 이슈](https://github.com/hakilee/slackmoji/issues)가 작업 범위를 관리합니다. PR 기반 변경, squash-only 머지, 기본 브랜치 삭제·강제 푸시 금지와 선형 이력을 GitHub ruleset으로 강제합니다. 머지한 브랜치는 GitHub가 자동 삭제합니다.

## 배포

Vercel CLI로 로컬에서 빌드한 결과만 배포합니다. [배포 가이드](documentation/deployment.md)를 참고하세요. Git 연결 자동 배포와 GitHub Actions는 사용하지 않습니다.

## 브랜드 자산

선택된 C 수다모찌의 텍스트 없는 로고 원본은 `public/logo.svg`입니다. 헤더·푸터에서 이 파일을 직접 사용하며, 정사각형 파비콘은 같은 원본에서 별도로 생성합니다. 원본 수정 후 `yarn icons`를 실행하면 PNG 파비콘, Apple touch 아이콘, Android 일반·maskable 아이콘이 재생성됩니다. Android 아이콘은 `public/site.webmanifest`에 선언하며, 오프라인 캐싱은 추가하지 않습니다.
