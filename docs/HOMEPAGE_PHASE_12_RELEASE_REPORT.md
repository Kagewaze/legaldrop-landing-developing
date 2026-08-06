# Homepage Phase 12 — Preview Release, Production Validation and Controlled Merge

> **Status: STOPPED AT STAGE 3. The deployment mechanism cannot be determined from repository
> evidence, and no platform access is available.**
>
> **Nothing was pushed. Nothing was merged. Nothing was deployed. No tag was created.**
>
> Stages 1 and 2 passed. Stage 3 is a hard stop by its own terms — *"Do not invent a workflow. If
> the deployment mechanism cannot be determined from repository evidence or available platform
> access, stop and report the missing information."* Stages 5–10 were not attempted, because each
> depends on a workflow that has not been established.

---

## 1. Initial branch status — Stage 1 ✅ PASS

| Check | Result |
|---|---|
| Working directory | `C:\Users\Abdul\LegalDrop\legaldrop-landing-develop\legaldrop-landing-develop` |
| Branch | `homepage-redesign` ✅ |
| Working tree | **clean** |
| `f44806f` present | ✅ `docs: reconcile final homepage state` |
| `a7b0b60` present | ✅ `docs: add homepage release report` |
| Lint | ✅ no warnings or errors |
| Production build | ✅ compiled, 16/16 static pages |
| `/` route type | ✅ **`○ (Static)`** |
| `/` First Load JS | ✅ **101 kB** |
| Shared JS | ✅ **87.2 kB** |
| Already pushed or merged? | **No** — no upstream configured; `origin/main` is the only remote-tracking ref |

---

## 2. Remote-main comparison — Stage 2 ✅ PASS

`git fetch origin --prune` completed successfully. **Re-checked against the remote rather than
relying on the Phase 11 result.**

| Ref | Hash |
|---|---|
| local `main` | `318e61f6` |
| **`origin/main`** | **`318e61f6`** |
| `homepage-redesign` | `a7b0b607` |
| merge base (`main`, HEAD) | `318e61f6` |
| merge base (`origin/main`, HEAD) | `318e61f6` |

| Measure | Value |
|---|---|
| Commits on `origin/main` not in the branch | **0** |
| Commits on the branch not in `origin/main` | **56** |
| **`origin/main` moved since Phase 11?** | **No** |
| **Fast-forward merge still possible?** | **Yes** |

No new remote commits, so there are no conflict areas to report and no founder decision is required
at this stage.

---

## 3. Deployment workflow identified — Stage 3 ⛔ **HARD STOP**

**The deployment mechanism could not be determined.** This is reported rather than guessed.

### What was searched, and what was found

| Evidence source | Result |
|---|---|
| `vercel.json` · `netlify.toml` · `render.yaml` · `Dockerfile` · `docker-compose.yml` · `app.yaml` · `fly.toml` · `.do/app.yaml` · `Procfile` · `amplify.yml` | **none present** |
| `.github/` — Actions workflows | **no `.github` directory at all** |
| Hidden platform dirs (`.vercel`, `.netlify`, `.render`, `.firebase`, `.aws`, `.amplify`, …) | **none present** |
| `package.json` scripts | only `dev`, `build`, `start`, `lint` — **no deploy script** |
| `README.md` | the **unmodified Tailwind UI "Pocket" template README**. No deployment section |
| `CHANGELOG.md`, `CLAUDE.md` | **no deployment reference** |
| Deploy-platform strings in tracked files | one hit: `.gitignore` contains the stock `.vercel` line — **boilerplate from the template, not configuration** |
| Platform CLIs (`vercel`, `netlify`, `wrangler`, `flyctl`, `doctl`, `gh`, `aws`, `firebase`) | **all absent** |
| Deployment tokens in the environment (names only) | **none** |
| Git remote | `origin` → `https://github.com/Kagewaze/legaldrop-landing-developing.git` |

### The required Stage 3 record — every item is unknown

| Question | Answer |
|---|---|
| Hosting platform | ⛔ **UNKNOWN** |
| Does pushing a feature branch create a preview? | ⛔ **UNKNOWN** |
| Does pushing `main` automatically deploy production? | ⛔ **UNKNOWN** |
| Is there a manual deployment command? | ⛔ **None in the repository** |
| Does deployment require dashboard access? | ⛔ **UNKNOWN** |
| Do environment variables differ between preview and production? | ⛔ **UNKNOWN** |
| Is the custom domain attached only to production? | ⛔ **UNKNOWN — the production domain itself is not recorded anywhere in the repository** |

### Why this also blocks Stage 5

Stage 5 carries its own explicit stop condition:

> *"If pushing the branch would immediately deploy production rather than preview, stop before
> pushing and report that behaviour."*

**That condition cannot be cleared.** The most common real-world setup for a repository in this
state is a platform connected through the **GitHub integration**, which leaves *no artifact in the
repository at all* — the configuration lives entirely in the platform dashboard. Under such a setup
the branch-push behaviour is whatever the dashboard says it is, and that could be:

- a preview deployment (the usual case for a non-production branch), **or**
- nothing at all, if only `main` is watched, **or**
- a production deployment, if this branch were configured as a production branch.

The first is by far the most likely. **"Most likely" is not "determined"**, and a push is
externally visible and cannot be undone without a force-push or history rewrite — both of which
this phase forbids. So the branch was **not pushed**.

---

## 4. Environment-variable audit — Stage 4 (code side complete, platform side unverifiable)

**No secret value is printed anywhere in this report. Names and locations only.**

The **code-side** audit was completed in full, because it needs no platform access. The
**deployment-side** audit could not be performed at all.

### Complete list of variables this application reads

| Variable | Consumer | Timing | Missing-value behaviour |
|---|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `src/lib/maps-loader.js` | **inlined at build time** | ⚠️ falls back to a **hardcoded browser-key literal** in `maps-loader.js` — so a missing variable does **not** produce a visible failure |
| `GOOGLE_PLACES_API_KEY` | `src/lib/google-reviews.js` | **server runtime** | returns `null` → the reviews section is **silently absent**. No fallback |
| `NEXT_PUBLIC_API_BASE_URL` | `src/lib/config.js` | **inlined at build time** | falls back to the current production backend literal |
| `NODE_ENV` | `src/data/partners.js` | build/runtime | standard; gates a development-only warning |

**There are no other environment variables.** Notably:

| Item | How it is configured |
|---|---|
| **Google place ID** | **hardcoded constant** `ChIJ6bQwlukxK4gRFaB2nvrNqWw` in `src/lib/google-reviews.js` — no variable needed |
| **Partner-signup URL** | **hardcoded constant** `https://partner.legaldrop.ca/signup` in `src/lib/navigation.js` |
| **Contact-form destination** | `${NEXT_PUBLIC_API_BASE_URL}/contact-form` — derived, no separate variable |
| **Tracking / booking API** | `NEXT_PUBLIC_API_BASE_URL`, plus a **deliberately hardcoded** `/pay/:code` rewrite in `next.config.js` |
| **Stripe publishable key** | **fetched from the backend at runtime** — *not* a frontend environment variable |

### Status against the Stage 4 reporting categories

| Requirement | Status |
|---|---|
| Browser Google Maps/Places key | ⛔ **INACCESSIBLE FOR VERIFICATION** — no deployment access |
| Exact variable name used by `maps-loader.js` | ✅ **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`** (present in code) |
| Production/preview domain on the key's referrer allowlist | ⛔ **INACCESSIBLE** — and the production domain is not recorded in the repository |
| Server-side Google Places key | ⛔ **INACCESSIBLE** |
| Correct Google place ID | ✅ **present in code** (hardcoded); correctness against the live listing ⛔ unverified |
| Places API (New) enablement | ⛔ **INACCESSIBLE** |
| Server runtime access to the key | ⛔ **INACCESSIBLE** |
| Tracking API base URL | ✅ variable present in code; production value ⛔ unverified |
| Booking/order API base URL | ✅ same variable; production value ⛔ unverified |
| Contact-form destination | ✅ derived in code; reachability ⛔ unverified |
| Partner-signup URL | ✅ present in code (hardcoded); returned **200** during Phase 11 local testing |
| Payment public configuration | ✅ **not required** — fetched from the backend at runtime |

Locally there is **no `.env` file**, and none of the four variables is set in the shell — which is
expected for a development checkout and is why the reviews section is absent in local testing.

### ⚠️ One finding worth acting on regardless of platform

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` **falls back to a hardcoded browser-key literal**. That is
deliberate and documented in `maps-loader.js` (it stops the live tracking pages going dark before
the variable is wired), but it has a consequence for this deployment:

**A missing or misconfigured browser key will not fail loudly.** Combined with the referrer
allowlist, the failure mode is a homepage where address entry silently degrades to *"Address
suggestions are unavailable right now"* with a working `/send` fallback — a page that looks
correct. This must be verified positively on the production origin, not assumed from the absence of
errors.

---

## 5–10. Stages 5 through 10 — **NOT ATTEMPTED**

| Stage | Status |
|---|---|
| 5 — Push the release-candidate branch | ⛔ **Not attempted.** Blocked by Stage 3, and by Stage 5's own condition that pushing must not risk a production deployment |
| 6 — Preview deployment verification | ⛔ Not attempted — no preview exists. *Localhost testing is explicitly not preview validation, and none is presented as such* |
| 7 — Production-domain readiness | ⛔ Not attempted — the production domain is not known |
| 8 — Controlled merge | ⛔ **Not attempted.** No rollback tag was created and no tag was pushed |
| 9 — Production smoke test | ⛔ Not attempted |
| 10 — Rollback | ⛔ **No rollback was required, because nothing was deployed** |

**Preview URL / deployment identifier: none — no deployment was created.**

---

## 11. What is needed to resume

Four pieces of information, none of which can be derived from the repository:

1. **The hosting platform** for this frontend — e.g. Vercel, Netlify, DigitalOcean App Platform,
   Cloudflare Pages, or a self-managed host. The GitHub remote is
   `Kagewaze/legaldrop-landing-developing`.
2. **What a feature-branch push does** on that platform: create a preview, do nothing, or deploy
   production. If it deploys production, say so — the branch must not be pushed.
3. **The production custom domain**, so the browser key's HTTP-referrer allowlist can be checked
   against the exact origin.
4. **Whether dashboard access is available** to confirm `GOOGLE_PLACES_API_KEY`,
   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and `NEXT_PUBLIC_API_BASE_URL` are set for the target
   environment.

With those, Stages 3–9 can run as written.

**If no deployment pipeline exists yet**, that is a separate decision — the brief forbids creating
a new deployment architecture, so it would need explicit founder direction rather than an
engineering choice.

---

## 12. Merge readiness, restated

The merge itself remains low-risk and unchanged from Phase 11, and **`origin/main` has been
re-verified as not having moved**:

- Fast-forward available, **zero conflicts**.
- No migrations, no backend change, no API contract change, no new dependency, **no new environment
  variable**, no route added or removed.
- Lint and production build clean; `/` static at 101 kB First Load JS, 87.2 kB shared.

**But merge is correctly gated**, because Stage 4's hard-stop list cannot be cleared from here:

> *Do not merge to main when the browser key is absent; the production domain is missing from its
> referrer allowlist; the booking API destination is missing; the application cannot complete a real
> address lookup; or required production variables are unavailable.*

**Every one of those is currently in the "inaccessible for verification" state, not the "verified
present" state.** That is the difference between *"we checked and it is fine"* and *"we could not
check"*, and only the first permits a merge.

---

## 13. Commits created

| Commit | Subject |
|---|---|
| *(this report)* | `docs: record Phase 12 deployment-workflow blocker` |

No source file was changed. No tag was created.

---

## 14. Confirmation

- **Nothing was pushed.** The branch still has no upstream; `origin/main` remains the only
  remote-tracking ref.
- **Nothing was merged.** `main` is untouched at `318e61f6`.
- **Nothing was deployed.**
- **No tag was created or pushed.**
- **No force-push occurred.** No `--force`, no `--force-with-lease`.
- **No history was rewritten.** No rebase, no amend, no reset.
- **No deployment architecture was invented**, and no application functionality was changed to make
  deployment easier.
- `git fetch origin --prune` was the only network operation performed, and it is read-only.

---

**Phase 12 stopped at Stage 3. Awaiting the deployment-workflow information above.**
