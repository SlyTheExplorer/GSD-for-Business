---
audience: internal
audience.type: internal
audience.confidentiality: internal
business_context.model: b2c
business_context.region: kr
business_context.industry: fintech
business_context.compliance_packs: [PIPA, ISMS-P, MyData]
voice.tone: direct
voice.perspective: founder
project: 페이앱 (canary fixture)
---

# OBJECTIVES — 페이앱 (Korean B2C Fintech Canary Fixture)

> This fixture is used by Plan 08 canary E2E to validate the full /brief-design pipeline
> for a Korean B2C fintech project. It exercises: PIPA + ISMS-P + MyData compliance pack
> auto-load, B2C conditional content paths in design-prompts, region:kr Korean variant
> rendering, and the CEO-personal-liability disclaimer surfacing.

## Immutable Intent

한국 B2C 사용자를 대상으로 하는 결제 앱. 사용자가 일상 결제를 더 쉽게 할 수 있도록 한다.

(English gloss: A payment app targeting Korean B2C users. Make daily payments easier
for the user.)

## Mutable Hypotheses

### target_audience

서울 거주 20-40대 직장인. 모바일 우선 사용자. 카카오/네이버 페이 사용 경험 보유.
점심 결제 / 더치페이 / 정기 구독 결제가 주요 use-case.

(English gloss: Seoul-based office workers, ages 20–40. Mobile-first. Existing
KakaoPay/NaverPay users. Primary use-cases: lunch payments, group bill splits,
recurring subscriptions.)

### monetization

거래 수수료 (transaction fee) 0.5%; 프리미엄 멤버십 월 ₩4,900 (가족 공유 결제 + 포인트
적립 2배 + 스마트 영수증 OCR).

(English gloss: 0.5% transaction fee + premium membership ₩4,900/mo with family
shared payment, 2x points, smart receipt OCR.)

### gtm_motion

앱스토어 (App Store + Google Play) + 인플루언서 마케팅 + 온라인 광고 (네이버 / 인스타
/ 유튜브). 초기 6개월 신규 사용자 거래 수수료 무료 프로모션.

(English gloss: App Store launch + influencer marketing + online ads on Naver, Instagram,
YouTube. 6-month transaction-fee-free promotion for new users.)

### compliance_packs

- **PIPA** (개인정보보호법) — 결제 정보 수집, 본인 인증 데이터, 거래 내역 처리. 2026년
  개정 PIPA에 따라 대표이사 개인 책임 적용; 과징금 상한 총매출의 10%.
- **ISMS-P** — 2027-07-01 의무화 대비. 핀테크 카테고리는 지정된 대규모 정보처리자에
  포함 가능성 높음.
- **MyData** — 금융 부문 데이터 이동성. 2026년 확장된 우선 부문(에너지/교육/고용/
  문화/여가) 중 금융이 원조 부문이며 의무 적용.

### key_competitors

- 토스 (Toss) — Korean mobile finance leader; full payment + banking + securities stack.
- 카카오페이 (KakaoPay) — Kakao messaging integration; massive existing user base.
- 네이버페이 (NaverPay) — Naver search + commerce integration; merchant-side strength.

### key_risks

- **시장 진입 장벽 (Market Entry Barrier):** 토스/카카오/네이버의 기존 시장 점유율 90%+;
  사용자 전환 비용이 매우 높음.
- **PIPA 위반 리스크 (PIPA Violation Risk):** 결제 데이터 처리 시 단일 동의 체크박스 사용
  시 PIPC 행정 처분 대상.
- **CEO 개인 책임 (CEO Personal Liability):** 2026 PIPA 개정으로 대표이사 형사 노출
  가능성. 보안 사고 시 개인 책임 발생.
