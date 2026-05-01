# Promo Fields

**Title** — Promo name shown as the title in the "How it works" modal (e.g. "Tramplin x Seeker Promo")

1. **showStartsAt** — When the backend starts including this promo in API responses
2. **showEndsAt** — When the backend stops including this promo in API responses
3. **startsAt** — When the promo campaign officially starts. If in the future, renders PromoCardUpcoming with countdown; if absent, campaign is always active
4. **endsAt** — When the promo campaign ends. Optional — some campaigns run until the target is reached
5. **type** — Badge label displayed in the card header (e.g. "Promo")
6. **cardHeaderTitle**— Campaign type descriptor used in the card header (e.g. "Stake to get $50K")
7. **howItWorks** — Markdown body for the "How it works" modal — supports bold, lists, and horizontal rules
8. **prize** — Human-readable prize value shown in the progress label (e.g. "$50K")
9. **winnersAmount** — Number of winners as a string; `"1"` renders "1 winner", anything else renders "N winners" (e.g. 1)
10. **targetAmount** — Goal the campaign must reach (in units determined by `targetType`) to unlock the prize (e.g. 10000)
11. **targetType** — Text type after targetAmount
12. **minStakeAmountInSOL** — Minimum stake required to qualify for the promo, (e.g. 10)
13. **winnerWalletAddresses** — Wallet addresses of winners — only populated after the draw; drives the PromoCardCompleted view
