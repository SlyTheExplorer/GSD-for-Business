---
audience: internal
audience.type: internal
audience.confidentiality: internal
business_context.model: b2c
business_context.region: kr
voice.tone: direct
voice.perspective: first-person-plural
workstream: operations
artifact_kind: operations
---

# Operations — 페이앱

## Process

- 신규 가입 → 본인 인증(휴대폰 SMS) → 마이데이터 동의 → 카드/계좌 자동 연결 (3분 안에 완료)
- 매일 02:00 마이데이터 API 동기화 + 카드사 SMS 파싱 → 카테고리 자동분류 → 사용자 알림
- 월 1회 청구서 검증, 월말 가계부 리포트 생성
- 사용자 문의 처리: 평일 09-18시 1차 대응 (이메일+카카오톡 채널), 24시간 내 답변 보장

## Tools

- 백엔드: Supabase + Node 22 + Postgres
- 마이데이터 게이트웨이: 한국정보인증 SDK
- 카테고리 ML: 자체 훈련 LightGBM 모델
- 모니터링: Datadog Korea region
- 고객지원: Channel.io (한국 시장 표준)

## Team

5명: 대표(BD+컴플라이언스), iOS 1, Android 1, 백엔드 1, 디자이너+마케팅 1
