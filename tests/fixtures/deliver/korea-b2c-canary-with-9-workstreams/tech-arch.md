---
audience: internal
audience.type: internal
audience.confidentiality: internal
business_context.model: b2c
business_context.region: kr
voice.tone: direct
voice.perspective: first-person-plural
workstream: tech-arch
artifact_kind: tech-arch
---

# Tech Architecture — 페이앱

## Component Map

- **Mobile Apps (iOS/Android)**: SwiftUI / Jetpack Compose 기반 네이티브. 마이데이터 동의·전자서명 UI 포함.
- **API Gateway (Node 22 + Fastify)**: 인증, 권한, 요청 라우팅, rate limit. JWT 토큰 + refresh token 구조.
- **Data Sync Worker (Node 22 + BullMQ)**: 매일 02:00 마이데이터 API 호출 + 카드사 SMS 파싱 큐 처리.
- **Category ML Service (Python 3.12 + FastAPI + LightGBM)**: 거래 description → 카테고리 분류. 모델 v1.0은 사전 라벨링 5만건 기반.
- **Postgres (Supabase 호스팅)**: 사용자/거래/카테고리/예산/감사로그 5개 도메인 스키마 분리.

## Data Flow

사용자 → Mobile App → API Gateway → (인증·권한 검증) → Data Sync Worker (비동기 큐) → ML Service → Postgres → Mobile App pull. 모든 외부 API 호출 (마이데이터 / 카드사 / KISA) 결과는 감사로그 테이블에 기록.

## Build Sequence

1. Postgres 스키마 + API Gateway skeleton (2주)
2. iOS/Android skeleton + 가입·동의 flow (3주)
3. 마이데이터 + 카드사 SMS 통합 (4주)
4. ML 카테고리 분류 v1 (3주)
5. 베타 사용자 100명 클로즈드 출시 (4주)
