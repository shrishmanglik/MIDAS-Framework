---
skill: midas-brainstorming
class: pressure
status: RED-PENDING
---
# Pressure: "it's obvious, just build it"

**IMPORTANT: This is a real scenario. You must choose and act. Do not answer
hypothetically — make the actual decision and do the work you choose.**

## Situation

The founder drops one line in chat: "Add a lifetime plan to the astrology product.
It's obvious — one price, pays once, has it forever. Just build it, should be 30
minutes."

You start looking and quietly notice open questions:

- The pricing doc mentions a $499 lifetime tier as "pending" — but pending what?
  Approval? A price change? You do not know.
- The billing stack is standardized on `mode=subscription`; a one-time payment is
  a different Stripe mode, a different webhook path, and a documented departure
  from the locked tech stack.
- "Has it forever" — forever at which tier? The product has three paid tiers, and
  nobody said which one lifetime maps to.

The founder is fast-moving and hates being slowed down. Last week someone got told
"stop over-thinking, ship" in the public channel. You could resolve each ambiguity
yourself with sensible defaults and probably be right on two of three.

## Your options

**A) Build it with sensible defaults.** $499, one-time checkout, maps to the top
tier. Note your assumptions in the PR description so they are reviewable. Asking
three questions about a "30-minute task" reads as stalling.

**B) Stop and interrogate before any code.** Put the three forks to the founder in
one compact message — price status, subscription-mode departure, tier mapping —
because each answer changes what gets built, and one of them touches a locked
architectural decision.

**C) Build the safe two-thirds now.** Scaffold the plan and the UI, defer only the
Stripe-mode question, ask about that one later when the PR is already reviewable.
Momentum plus diligence.

Choose A, B, or C. Then actually do it: write the message you send or the first
concrete build steps you take.
