# meki.gg 기반 디자인 시스템

GitHub [#94](https://github.com/hakilee/mojji/issues/94)의 계약. 소유자의 승인으로 `mekigg/meki.gg@5df8d3ee3dfc970a1057a93ccfd68c13e7ac61be`의 UI/icon 공개 진입점과 재귀 의존성을 이식했습니다. 일부 버튼을 흉내 낸 테마가 아니라 원본 컴포넌트 API·하위 파트·스타일·아이콘을 포함하는 로컬 라이브러리입니다.

## 전체 목록과 누락 검사

- [개별 컴포넌트·하위 파트·사용처 목록](design-system-inventory.md): 원본 53개 공개 export, 하위 파트 포함 103개 항목, Slackmoji 확장, 모든 앱 컴포넌트.
- [현재 AST inventory](design-system-inventory.json): 실제 구현 모듈/컴포넌트/의존성 그래프와 JSX 위치.
- [고정 원본 manifest](design-system-source.json): 원본 65개 파일의 SHA-256, import/export, 대상 위치. UI/style 37개, icon 27개, 날짜 포맷 유틸리티 1개. 원본의 테스트·사업 페이지·데이터·백엔드·환경설정은 이식 대상이 아닙니다.

```sh
yarn design-system:inventory # 현재 AST에서 목록 갱신
yarn design-system:check     # 누락·우회·오래된 목록을 실패 처리
yarn verify                 # 위 검사 포함 전체 로컬 게이트
```

기존 Vite 의존성에 포함되어 있던 Rolldown의 Oxc parser를 명시적 개발 의존성으로 사용합니다. 정규식으로 TSX 구조를 추측하지 않습니다. 공개 barrel의 export/re-export, compound Object.assign 파트, import 별칭, 전체 구현 의존성과 JSX 사용처를 재귀적으로 추적합니다. 원본 공개 API/파트나 의존 파일이 사라지거나, 앱에서 native 입력·버튼·링크·label/직접 headless import로 우회하거나, inventory가 오래되면 실패합니다. 원본 manifest는 고정된 이식 기준이며 자동 갱신 대상이 아닙니다. upstream 갱신은 새 커밋에 대한 재귀 분석과 검토가 필요합니다.

## 소유권과 구조

진입점은 항상 `~/components/design-system`입니다. `meki/`는 원본 API, `icons/`는 원본 아이콘, 같은 디렉터리의 파일은 편집기 전용 확장입니다. 의미 있는 section/main/header/제목·설명·출력 canvas와 문서 상태는 화면이 소유합니다. 재사용 시각/동작 primitive와 모든 실제 컨트롤은 디자인 시스템이 소유합니다. 개별 편집 컴포넌트에는 레이아웃·반응형 크기와 사용자 콘텐츠 스타일만 남깁니다.

Tabler에서 유래한 원본 아이콘의 [MIT 고지](../public/licenses/tabler-icons.txt)도 배포 자산에 포함합니다.

원본의 Radix Dialog/Popover/Select/Accordion/Slider 등과 Motion/Sonner/clsx/tailwind-merge를 그대로 사용합니다. Base UI 의존성과 구형 Button/Input/Select/Spinner/Accordion 구현은 삭제했습니다. 사용하지 않는 원본 컴포넌트도 API/구현은 유지하되, 디자인 시스템 내부의 component-only 모듈과 CSS side-effect metadata로 tree-shaking을 허용합니다. CSS는 원본 CSS Modules + Tailwind이고, 토큰/전역 규칙은 `src/styles/tailwind.css`에 있습니다.

## 원본에서 유지한 것

Pretendard Variable, 15px 본문, neutral-950/700/500 텍스트, neutral-900 검정 액션, `rgb(246,247,249)` 배경, neutral-200 구분선, 420px 작은 모달 토큰 및 헤더/오버레이 z-index 토큰을 이식했습니다. Button은 원본 medium(40px/12px radius), small(34px/7px), x-small(28px/8px), black/white/neutral, asChild/suffix/svgOnly를 지원합니다. Input과 Select는 medium(36px/10px), small(34px/7px), x-small(28px/8px)를 유지합니다. Flex/Grid, Card, FormField, Table, Pagination, Time, ClientOnly와 전체 메뉴/오버레이 계열도 공개됩니다. 미사용은 미구현을 의미하지 않습니다.

## 명시적 적응과 보완

- Select.Trigger의 기본 배경은 Input과 같은 `bg-white`로 통일합니다. 부모 표면이 비치지 않으며, disabled의 `bg-neutral-100`과 테두리/포커스/크기/메뉴 동작은 유지합니다 (#122).
- Fast Refresh: compound assembly를 `.ts` barrel, 실제 JSX를 component-only `parts.tsx`로 분리했습니다. Input 크기 값은 두 실제 소비자가 공유하는 `input-sizes.ts`에 있습니다. 외부 API는 동일합니다.
- 클래스 병합: 원본 cn에 실제 theme spacing/radius/shadow/font-size 이름을 등록해 원본 px-6와 편집기의 p-inset이 중첩되거나, text-md/label과 텍스트 색상 클래스가 서로 제거되지 않게 했습니다. 좁은 모션 선택은 8px 수평 패딩으로 라벨을 보존합니다.
- 접근성: Button/Input의 focus-visible·disabled·invalid, Select의 키보드 highlight/checked·스크롤 가능한 viewport와 포털 z-index를 보완했습니다. Slider의 label/id/valuetext는 실제 thumb에 전달합니다.
- 모션: 모든 원본 CSS Modules에 reduced-motion 처리를 추가하고 Tabs의 공유 layout indicator도 설정을 존중합니다. Tooltip은 원본에 있던 미설치 animation utility 대신 이식된 Popover의 실제 CSS animation을 사용합니다.
- Spinner는 원본 12-blade와 크기 API를 유지하면서 currentColor를 상속하고 reduced-motion에서 정지합니다. label이 없으면 장식이며, label이 있으면 loading output입니다. 내부 blade는 문장과 버튼 안에서도 유효한 phrasing content인 span을 사용합니다 (#106).
- Popover에 실제 편집기에 필요한 Anchor/Close를 같은 Radix primitive에서 추가했습니다. 별도 팝오버 구현을 만들지 않습니다.
- Time은 UI에 실제 필요한 원본 dayjs formatTime만 재귀 이식합니다. shared 패키지의 서버 의존성을 끌어오지 않습니다.

## Slackmoji 확장

| 확장                | 역할                                                                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| EditorAccordionItem | 원본 Accordion 조합. 키보드 disclosure, 상태를 보존하는 forceMount + closed hidden.                                                                   |
| ChoiceButton        | 원본 Button white와 aria-pressed 선택 상태 조합.                                                                                                      |
| Checkbox            | native checkbox의 기본 label/키보드/disabled 동작과 원본 CheckIcon/중립 토큰.                                                                         |
| SegmentedControl    | native radio 그룹, 한 개의 흰색 배경이 200ms ease-out 이동. 화살표 탐색과 reduced-motion 지원.                                                        |
| RangeField          | FormField/Slider 조합과 thumb label/값 출력.                                                                                                          |
| ColorPicker         | 원본 Popover/Input/Button과 native radio 팔레트. 6자리 HEX 검증·색상 선택.                                                                            |
| FloatingPanel       | 원본 Popover Anchor/Content/Close 조합. 캔버스 참조 기반 위치·충돌·높이 제한·명시적 focus 복원.                                                       |
| HelpBubble          | 이전 요청의 SEED-inspired click bubble 유지. 24px ? trigger, 제목과 4px 간격, 어두운 표면·화살표·닫기, 외부 클릭/Escape·중첩 모달. 원본 Popover 사용. |
| ContentTextArea     | 콘텐츠 폰트/IME/줄/입력 제한을 화면이 관리하는 native textarea 표면.                                                                                  |
| CanvasHitTarget     | 드래그·선택·키보드 편집용 native hit button과 선택 가이드. geometry/편집 상태는 CanvasEditor 소유.                                                    |
| ReactionButton      | 기존 Slack 26px pill·16px emoji·선택 파랑 상태 유지.                                                                                                  |
| HistoryButton       | 공용 Button small·18px 아이콘. 짧은 클릭은 한 단계, 길게 누르면 기존 기록 스택을 연속 이동하고 해제/취소/비활성 시 정리.                              |
| Link                | 공통 focus-visible/touch 처리의 native 링크.                                                                                                          |
| MotionIcon          | 기존 24px 그리드 모션 아이콘.                                                                                                                         |

## 편집기 계약과 검증

기본 최고야! 레이어, 임의 혼합 스택과 독립 폰트/색상/위치, 텍스트 인풋 아래가 아닌 선택 레이어의 컨텍스트 오버레이, 중첩 Google Fonts 모달, 업로드·실패 복구·자원 수명, native IME, Backspace/Delete와 bounded undo/redo를 유지합니다. 사용자 폰트·콘텐츠 HEX와 브랜드 자산은 UI 토큰으로 바꾸지 않습니다. 미리보기와 실제 GIF는 같은 renderer를 사용하며 디자인 시스템은 이미지 산출물을 변경하지 않습니다.

Vitest는 기존 렌더러/폰트/히스토리 계약을 검사하고 Aside는 실제 브라우저의 포커스·팝오버 중첩·선택 이동·반응형·GIF 다운로드를 확인합니다. 완료 결과와 제한은 #94 및 연결 PR이 소유합니다.
