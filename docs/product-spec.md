# TablePlay — MVP Product Specification

**Working title:** TablePlay (placeholder; check name and domain availability before launch)  
**Version:** 1.0 | **Date:** 11 October 2026  
**Purpose:** Product brief and build-ready starting point for product, design, and engineering work

## 1. Product summary

TablePlay is a mobile-friendly web experience opened by scanning a QR code on a restaurant or bar table. It brings the venue’s useful table information and lightweight entertainment into one place: food and drinks menus, offers and events, children’s activities, group games, and date-night conversation games.

Guests should not need to install an app, create an account, or hand over personal details to use the core experience. Each venue can configure its own branded page and choose which sections appear. The same platform can serve a family restaurant at lunch and a lively bar in the evening.

**One-line pitch:** Scan once, find what you need, and make the time at the table more fun.

### Product goals

1. Help guests quickly find menus, offers, events, and practical venue information.
2. Give children and groups something easy and social to do while they wait.
3. Give venues a simple way to publish table content and promotions without printing new QR codes for every update.
4. Create measurable engagement that venues can use to improve service and repeat visits.

### Non-goals for the first release

- Replacing the point-of-sale (POS) system or taking payment.
- Delivering food ordering, reservations, or live bill splitting.
- Building a downloadable native app.
- Supporting public profiles, direct messages, user-generated public content, or cross-venue social networks.
- Running cash-equivalent gambling, paid chance games, or guaranteed prize mechanics.

## 2. Users and jobs to be done

| User | Need | TablePlay job |
|---|---|---|
| Parent or guardian | Keep children occupied and comfortable while waiting | Open a child-friendly activity without installing an app or giving a child an account |
| Child | Find an activity they can understand and enjoy | Play a short game, draw, or join a venue activity with clear, age-appropriate instructions |
| Couple / date | Have an easy way to start a fun conversation | Choose a light prompt game suited to a first date or established couple |
| Friends / group | Break the ice and create a shared moment | Start a quick group game that works around one or more phones |
| Guest browsing the venue | Find current food, drinks, offers, and events | See accurate venue information from one QR entry point |
| Venue owner / manager | Keep table content useful and current | Edit content, control which modules are visible, and see basic engagement data |
| Venue staff | Know what the QR experience can and cannot do | Direct guests to it and handle promotions consistently |

## 3. Product principles

- **Scan and go:** the first useful screen loads without sign-up.
- **One table, shared experience:** games should work socially, including passing one phone around; a second-phone mode can be added where useful.
- **Venue-controlled:** every promotion, menu item, event, and reward is configured by the venue.
- **Fast and accessible:** readable on small screens, usable with one hand, and not dependent on sound, color alone, or perfect connectivity.
- **Child-safe by default:** no child accounts, no public child identities, no open chat, and no unnecessary personal data collection.
- **Honest promotions:** rules, eligibility, availability, expiry, and redemption instructions are visible before participation.

## 4. Experience map

### Guest entry

1. Guest scans a table QR code.
2. A mobile web page opens with the venue name, logo, and optional table label.
3. A compact home screen shows the venue’s enabled sections: **Menu**, **Drinks**, **Kids**, **Play together**, **Date night**, **What’s on**, and **Offers**.
4. Guest chooses a section. They can return to the home screen at any time.
5. Optional table service actions (for example, “Ask for the bill” or “Get staff attention”) are shown only if the venue enables and can operationally support them.

### Navigation recommendation

Use a simple home grid or list with no more than six prominent actions at once. Put secondary sections under “More.” Venue admins can reorder and hide modules. Never make a game the only obvious way to reach the menu.

## 5. MVP feature specification

### 5.1 QR entry and venue page — P0

- Unique venue URL and QR code per venue; optionally unique table QR codes that include a non-sensitive table identifier.
- QR opens a responsive web app; no app-store download.
- Venue identity: name, logo, cover color/image, location link, opening hours, phone, accessibility notes, and optional Wi-Fi details.
- Home screen only displays modules enabled by that venue.
- Language-ready content model. MVP launches in one chosen language, with a structure that can support translations later.
- If a table code is invalid or venue content is unavailable, show a useful fallback with venue name or a friendly error and a way to retry.
- QR codes should be durable and point to a redirectable URL so the printed code can survive future product changes.

### 5.2 Food and drinks menus — P0

- Separate food and drinks categories, with sections such as starters, mains, desserts, soft drinks, cocktails, and hot drinks.
- Menu item fields: name, description, price, currency, image (optional), dietary/allergen labels, availability status, and sort order.
- Venue admin can add, edit, hide, and reorder categories and items.
- Clear indication when an item is unavailable or when prices are subject to change.
- Allergen and dietary information must be maintained by the venue and displayed clearly; include a venue-configurable note telling guests to confirm serious allergies with staff.
- MVP menu is informational. No cart, ordering, payment, or live POS stock sync.

### 5.3 Offers and “What’s on” — P0

- Offer/event card fields: title, short description, image (optional), start/end date and time, recurring schedule (optional), terms, and call to action.
- Examples: Tuesday steak and wine, Friday live music, quiz night, happy hour, kids-eat-free offer, seasonal menu, televised sports.
- Show current and upcoming items; automatically hide expired items.
- Optional “Add to calendar” link for events.
- Redemption instructions should be unambiguous (for example, “Show this screen to your server before ordering”).
- MVP does not promise real-time inventory, bookings, or guaranteed availability.

### 5.4 Kids activities — P0

Launch with three to five short activities that run in the browser and need no account:

1. **Coloring page:** choose a simple template, color with touch, clear, and optionally save locally or show the finished page to an adult. Do not upload or publish child drawings in MVP.
2. **Spot the difference / picture puzzle:** short rounds with a reset button.
3. **Mini quiz or trivia:** age-appropriate questions with instant feedback; no collection of a child’s name.
4. **Word search or simple matching game:** easy to explain and playable without sound.
5. **Venue challenge:** a venue can select a static prompt such as “Find three things that are round,” avoiding a requirement to photograph or upload evidence.

Requirements:
- Clear age range or difficulty label; no timers by default for young children.
- No external links, ads, chat, location tracking, camera, microphone, or child account creation.
- Provide a “Play together” option for parent/child participation.
- Avoid public leaderboards attached to names. If a score board is included in a venue pilot, use anonymous session nicknames or team names, moderation controls, and automatic expiry; safest MVP is a private score recap on the device.
- Make activities resilient to refresh and short connection interruptions where practical.

### 5.5 Group games — P0

Start with three low-friction modes:

- **Quick questions:** light prompts for a group to answer aloud.
- **This or that:** choose between two funny or revealing options.
- **Party picker:** the phone randomly selects a prompt, category, or player number; players can skip without penalty.

Design constraints:
- Do not require every guest to scan or enter personal details.
- Avoid coercive, humiliating, sexually explicit, or unsafe prompts; offer a “keep it family friendly” default and a venue setting for adult-only content where appropriate.
- If a game includes a “spin the bottle” style mechanic, present it as an optional randomized prompt selector, never a direction to kiss or touch someone. Add skip/pass controls and clear consent language.
- Keep games short, turn-based, and legible when one phone is passed around.

### 5.6 Date games — P0

- **First date:** easy, low-pressure conversation starters.
- **Couples:** “How well do you know each other?” / Mr & Mrs-inspired questions, answered privately or aloud.
- **Memory lane:** shared memories, preferences, and future plans.
- Controls: choose a deck, reveal one question, skip, and finish/return home.
- Do not store answers or make relationship compatibility claims.
- Keep prompts inclusive and offer a “lighter questions” setting.

### 5.7 Promotions and rewards — P1 pilot / optional P0 static offers

For the first MVP, prioritize fixed offers with clear terms. A spinning wheel can be prototyped as an on-screen reveal mechanic only after the venue defines approved prizes, odds, eligibility, expiry, redemption, and stock limits.

- A reward must be configured and approved by venue admin before publishing.
- Display the terms before the guest plays: who can participate, one play per visit or other limit, prize odds if relevant, expiry, exclusions, and how to redeem.
- Issue a one-time, short-lived redemption code or QR token only if the venue has a practical staff verification process.
- Do not offer cash, paid entries, or anything that could be interpreted as gambling without jurisdiction-specific legal review.
- A “win a free drink” mechanic must be reviewed for local promotion, alcohol, age, licensing, and responsible-service rules. Provide a non-alcoholic alternative and ensure underage guests are not offered alcohol.
- Do not let the same device repeatedly claim rewards; understand that device/session controls are imperfect and should not be presented as fraud-proof.

### 5.8 Venue admin dashboard — P0

A secure, desktop-friendly web dashboard for venue owners/managers:

- Create/edit venue profile, logo, brand color, contact details, hours, and enabled sections.
- Manage food and drinks menus.
- Create/edit/publish/unpublish offers and events with start/end dates.
- Select which games and content decks are active.
- Generate and download venue/table QR codes.
- View simple analytics: scans, unique sessions (approximate), module opens, menu views, game starts/completions, offer views, and redemption attempts where enabled.
- Basic staff/admin roles: owner and editor. MVP can begin with one admin account per venue if role management adds too much scope.
- Preview guest experience before publishing.
- Audit timestamp and editor for key content changes if feasible.

Admin usability requirements:
- Show clear saved/published state.
- Warn when an event has no end date, an offer has no terms, or a menu item lacks required price/allergen fields.
- Hide expired content automatically but retain it for analytics/history.

### 5.9 Analytics and privacy — P0

Collect only what is needed to understand product use. Suggested events: QR landing, module viewed, menu category viewed, item viewed, game started/completed, offer viewed, and redemption initiated. Avoid recording game answers, precise location, contact lists, or device advertising identifiers.

- Explain analytics in a short privacy notice.
- Use aggregate reporting; do not expose individual guest browsing to venue staff.
- Define retention period and deletion process before launch.
- Use privacy-preserving session IDs; do not claim unique-person counts if the system only estimates unique browsers.
- Add consent controls if required by the launch jurisdiction, especially for non-essential analytics or cookies.

## 6. Suggested MVP scope and release phases

| Priority | Scope | Release decision |
|---|---|---|
| P0 — launch core | QR guest page, venue profile, menu, offers/events, 3–5 kids activities, 3 group games, 2 date-game decks, admin content editing, basic analytics | Required for a useful first pilot |
| P1 — pilot enhancement | Simple verified reward token, more game decks, two-language content, staff call button, printable coloring sheets, table-level analytics | Add after validating operations and guest use |
| P2 — later | Online ordering/POS integration, bookings, bill splitting, loyalty, cross-venue rewards, guest accounts, family profiles, multiplayer across devices, richer leaderboards, AI-generated content | Consider only after pilot evidence and partner demand |

### MVP success criteria (first 6–8 week pilot)

Agree targets with pilot venues before launch. Suggested measures:

- At least 30% of table sessions open one non-menu module, or another venue-agreed engagement target.
- At least 60% of scanned sessions successfully reach the guest home screen.
- At least 50% of started games reach a completion or natural end.
- At least 80% of venue admins can update a menu or event without support after onboarding.
- No unresolved high-severity privacy, child-safety, or promotion compliance issue.
- Venue feedback shows that the product is useful enough to keep the QR on tables.

These are hypotheses, not guaranteed benchmarks. Measure a baseline and adjust by venue type.

## 7. Core user stories and acceptance criteria

### Guest: scan and find the menu

**As a guest,** I want to scan the table QR and see the current menu quickly.  
**Acceptance:** The page loads on a current iOS/Android browser; venue identity is visible; food and drinks are separately discoverable; prices and allergen notes are legible; expired content is not shown as current.

### Parent: occupy a child

**As a parent,** I want a child to start a simple game without an account.  
**Acceptance:** A child can start a selected game in no more than two taps from the home screen; instructions are short; no personal information is required; the activity does not expose public content or external links.

### Couple: start a conversation

**As a couple,** we want a question game that feels comfortable and easy to stop.  
**Acceptance:** Guests can choose a deck, reveal a prompt, skip it, and exit at any time; answers are not saved or shared.

### Venue manager: update tonight’s event

**As a manager,** I want to publish or change an event without replacing printed QR codes.  
**Acceptance:** An authorized admin can edit title, description, dates, and terms; preview the update; publish it; and see it appear through the existing QR URL.

### Venue manager: see whether it is used

**As a manager,** I want aggregate engagement data.  
**Acceptance:** Dashboard shows date range, scans/sessions, section views, and game starts/completions; counts are labelled as estimates when appropriate; no guest-level browsing history is available.

## 8. Content library ideas

### Kids and family

- Coloring sheets themed to seasons, animals, food, or venue mascots.
- “Design a dessert” drawing prompt.
- Find-it scavenger prompts that do not require photos.
- Mini riddles, spot-the-difference, memory cards, tic-tac-toe, simple word searches.
- Family trivia with easy/medium/hard decks.
- Table manners or food explorer mini-challenges, framed positively rather than as discipline.
- Venue-run monthly coloring competition with an offline paper entry option; if entries are uploaded, obtain guardian consent and define storage, moderation, and deletion first.

### Friends and groups

- Two truths and a lie (optional, no answer recording).
- “Who’s most likely to…” with a kind/funny deck and pass option.
- Music intros, trivia, would-you-rather, charades prompts, emoji story.
- Table team quiz with a shared score on one phone.
- “Pick the next round” category selector.
- Celebration mode for birthdays and special occasions.

### Couples and dates

- First-date light questions, deeper questions, couples quiz, travel dreams, food preferences, shared memories.
- “Guess their answer” reveal mechanic with private answers on one device.
- Anniversary and long-distance conversation decks.
- Keep intimate decks opt-in and clearly labelled; never make sexual content the default.

### Venue and business tools

- Rotating specials, event calendar, live music profile, performer schedule, sports fixtures, quiz sign-up link, birthday offer, feedback form, accessibility/parking/travel details, Wi-Fi details, loyalty stamp concept, table service request, “celebrate with us” page, private-event enquiry link.
- Seasonal branding and temporary campaigns.
- Featured local partner offers only with venue approval and clear sponsorship labelling.
- Staff content templates for daily specials and last-minute event changes.

## 9. Business model hypotheses

Validate willingness to pay with venue interviews before committing to pricing. Potential models:

- Monthly venue subscription, tiered by number of locations or enabled modules.
- Setup/onboarding fee for branded content and QR deployment.
- Premium add-ons for rewards, multiple languages, advanced analytics, custom games, or multi-location management.
- Avoid charging guests to play or selling guest personal data.

Key commercial questions: who owns content updates, who prints/distributes QR stands, how much time a manager will spend maintaining menus, what the venue currently pays for menu/loyalty tools, and what result would justify a recurring subscription.

## 10. Operational, safety, and compliance requirements

- Confirm local rules for promotions, prize draws, alcohol advertising/service, age restrictions, and consumer terms for every pilot market.
- Venue remains responsible for accurate menu, price, allergen, event, and promotion information; product should make ownership and last-updated status clear.
- Define a process for taking down incorrect or inappropriate content quickly.
- Games need skip/pass controls and content review. Do not encourage drinking, rapid consumption, unwanted physical contact, or risky dares.
- Child activities should avoid accounts, chat, user uploads, targeted advertising, and unnecessary tracking.
- Provide clear privacy notice, terms, accessibility basics, and a contact method.
- Protect admin access with secure authentication, least-privilege roles, and audit logs for important changes.

## 11. Technical outline for a build team

Keep the implementation stack flexible. A sensible first architecture is:

- **Guest app:** responsive web app / progressive web app, optimized for QR entry and mobile browsers.
- **Admin app:** secure responsive dashboard.
- **Backend:** API plus relational database for venues, tables, modules, menu categories/items, events, offers, game content, admin users, and analytics events.
- **Content delivery:** cache published venue content for fast loading; use a content version or timestamp for refresh.
- **QR routing:** stable short URL with venue/table identifiers; avoid embedding guest personal data in QR codes.
- **Analytics:** aggregate event pipeline with configurable retention and access controls.
- **Media:** compress images and provide sensible fallbacks; do not require large assets for core content.

Suggested entities: Venue, Table, VenueModule, MenuCategory, MenuItem, Event, Offer, Game, GameDeck, Prompt, AdminUser, AnalyticsEvent, Reward, Redemption. A table should belong to one venue; content should be venue-scoped; every published item should have status and timestamps.

Non-functional targets to confirm: fast first load on ordinary mobile data, readable at common phone widths, graceful empty/error states, secure admin authentication, backups, monitoring, and a documented recovery path. Set concrete performance and availability objectives with the engineering team.

## 12. Build and validation plan

1. **Discovery:** interview 5–10 family restaurants/bars; observe how menus, activities, and offers are currently handled; test interest in paying.
2. **Prototype:** clickable mobile guest flow and admin flow; test with parents, couples, staff, and managers.
3. **Pilot build:** deliver the P0 features for 2–3 venues with different audiences.
4. **Operational trial:** train managers, print durable QR stands, check menus/offers, test staff redemption and support procedures.
5. **Measure:** review scan-to-load, module use, game completion, menu accuracy, support requests, and venue retention intent weekly.
6. **Decide:** improve, narrow, or expand modules based on observed use and venue willingness to pay.

### Test checklist

- QR scan from iPhone and Android camera; venue/table routes resolve correctly.
- Slow or interrupted network, expired event, unavailable menu, invalid QR.
- Small screens, large text, keyboard navigation, screen reader labels, contrast, touch target sizes.
- Menu price, allergen, availability, timezone, event expiry, recurring schedule.
- Child flow: no account, no accidental external link, no public identity, parent can exit/reset.
- Games: skip/pass, safe prompt set, family/adult content labels.
- Admin: unauthorized access blocked, edits preview correctly, published changes appear without reprinting QR.
- Analytics: aggregate counts reconcile; no unintended sensitive data captured.
- Reward pilot: terms visible, redemption workflow tested by staff, expiry and one-time token behavior checked.

## 13. Open decisions for the founders

1. Which country/city is the first pilot market?
2. Is the primary initial buyer a family restaurant, casual dining group, or bar/pub?
3. Should MVP use one QR per venue, one QR per table, or both?
4. Which language(s) are required on day one?
5. Should the first version include only fixed promotions, or a tightly controlled reward experiment?
6. Who supplies and maintains menu/allergen data?
7. What is the intended subscription price and sales channel?
8. Will staff attention requests be supported, and how will they be delivered?
9. Are games branded with each venue, platform-owned, or both?
10. What minimum evidence would justify a second development phase?

## 14. Ready-to-use AI build prompt

Copy the prompt below into Claude or another product/build assistant. Attach this specification with it.

> You are a senior product manager, UX designer, and pragmatic full-stack technical lead. Use the attached TablePlay MVP Product Specification as the source of truth. First, do not code yet. Produce: (1) a concise product brief, (2) MVP requirements grouped by guest app and venue admin, (3) a prioritized user-story backlog with acceptance criteria, (4) a mobile-first screen map and key interaction flows, (5) a proposed data model and API outline, (6) a privacy/security/child-safety checklist, (7) a realistic milestone plan, and (8) a list of assumptions and unresolved decisions. Keep P0 scope small. Flag any legal, alcohol, prize, child-safety, or privacy item that needs local expert review. Do not invent integrations or claim compliance. Where details are missing, state an assumption and give options. After I approve the plan, propose the simplest architecture and then build an interactive prototype using sample venue data. Prioritize QR entry, menu, offers/events, kids games, group games, date games, and a simple venue admin editor. Do not implement payments, ordering, accounts for guests, chat, or public child leaderboards unless I explicitly add them. Make all games skippable and safe by default.

### Follow-up prompts for an AI builder

**Prototype prompt:** “Build a mobile-first clickable prototype for one sample family restaurant. Use fictional menu/event data. Make the guest QR landing, module navigation, three kids activities, two group games, one date deck, and venue admin preview/edit flow usable. Keep it in the smallest practical project structure and list what is mocked.”

**Backlog prompt:** “Turn the approved spec into engineering tickets. Each ticket must have a user story, acceptance criteria, dependencies, and a clear out-of-scope note. Separate release blockers from enhancements.”

**Review prompt:** “Review this prototype against the spec. Identify missing P0 behavior, confusing mobile flows, unsafe game mechanics, data/privacy risks, and admin tasks that are too difficult. Give specific fixes in priority order.”

## 15. Short glossary

- **QR code:** scannable code that opens a web address.
- **MVP:** minimum viable product; the smallest release that can test whether the product solves a real problem.
- **PWA:** progressive web app; a website designed to feel app-like without requiring an app-store install.
- **POS:** point-of-sale system used to manage orders and payments.
- **Redemption:** the process of confirming that a guest can use an offer or claim a prize.
- **Session:** an approximate visit from a browser; it does not necessarily identify one person.
