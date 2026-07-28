# Medigap Compare — Data Package

A **style-agnostic** data package for Medigap (Medicare Supplement) plan comparison. The package returns plain JavaScript objects — no HTML, no CSS, no UI framework. Each site applies its own design system.

## Install / Import

### ESM — modern bundlers and browsers

```js
// From GitHub raw (no build step needed)
import { comparePlans, getPlansSummary, getZipInfo, getPlanLetters }
  from 'https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/data-export/medigap.esm.js';

// Or after publishing to npm
import { comparePlans } from 'medigap-compare-data';
```

### UMD — browser `<script>` tag

```html
<script src="https://cdn.jsdelivr.net/gh/YOUR_USER/YOUR_REPO@main/data-export/medigap.js"></script>
<script>
  const plans = Medigap.comparePlans({ zip: '10001', age: 68, married: false });
</script>
```

### CommonJS / Node

```js
const { comparePlans } = require('./medigap.js');
```

---

## API

### `comparePlans(params)` → `MedigapPlan[]`

Returns plan objects. Your site decides how to render them.

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `zip` | string | ✓ | 5-digit US zip code |
| `age` | number | ✓ | Beneficiary age (65–99) |
| `married` | boolean | | `true` applies household discount where available |
| `planLetter` | string | | Filter to one plan letter, e.g. `"G"` |
| `sortBy` | string | | `"premium-asc"` (default) · `"premium-desc"` · `"insurer"` |

**Returned fields per plan:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique plan ID |
| `insurerName` | string | Insurer name |
| `planLetter` | string | Standardized plan letter (A, B, D, F, G, K, L, M, N) |
| `monthlyPremium` | number | Calculated monthly cost in USD |
| `annualDeductible` | number | Annual deductible in USD |
| `outOfPocketLimit` | number \| null | Annual out-of-pocket cap, or null |
| `amBestRating` | string | AM Best financial strength rating |
| `moodyRating` | string \| null | Moody's rating, or null |
| `yearsInBusiness` | number | Years insurer has been operating |
| `marriedDiscount` | boolean | Whether this insurer offers a household discount |
| `notes` | string \| null | Optional notes about this plan |
| `planType` | string | Rating method: `"attained-age"` or `"community-rated"` |
| `partBDeductibleCovered` | boolean | Whether the Medicare Part B deductible is covered |
| `foreignTravelCovered` | boolean | Whether foreign travel emergencies are covered |

---

### `getPlansSummary(params)` → `PlansSummary`

Aggregate pricing stats. Same `zip`, `age`, `married` params.

```js
{
  state: "New York",
  county: "New York County",
  totalPlans: 51,
  lowestPremium: 108.89,
  highestPremium: 263.12,
  medianPremium: 181.64,
  popularPlanLetter: "G",
  byLetter: [
    { letter: "A", count: 5, minPremium: 108.89, maxPremium: 119.22, avgPremium: 114.05 },
    { letter: "G", count: 12, minPremium: 181.64, maxPremium: 263.12, avgPremium: 209.50 },
    // ...
  ]
}
```

---

### `getZipInfo(zip)` → `ZipInfo | null`

```js
getZipInfo('90001')
// { zip: "90001", city: "Los Angeles", state: "California", stateCode: "CA",
//   county: "Los Angeles County", region: "West", costMultiplier: 1.40 }
```

---

### `getPlanLetters()` → `PlanLetterDef[]`

Coverage definitions for each standardized plan letter. Useful for building tooltips, help text, or comparison tables.

```js
[
  { letter: "G", headline: "Most Popular Comprehensive Plan",
    description: "Covers almost everything Plan F covers except the Part B deductible...",
    partACoinsurance: true, partBCoinsurance: true, partBDeductible: false,
    partADeductible: true, skilledNursing: true, foreignTravel: true,
    outOfPocketLimit: false, popularity: "Very High" },
  // ...
]
```

---

## Integration Examples

The package returns plain objects. Style them however your site requires.

### React

```jsx
import { useState } from 'react';
import { comparePlans, getPlansSummary } from './medigap.esm.js';

export function MedigapResults({ zip, age, married }) {
  const plans   = comparePlans({ zip, age, married });
  const summary = getPlansSummary({ zip, age, married });

  return (
    <div className="your-wrapper-class">
      <p>{summary.totalPlans} plans found in {summary.state}</p>
      <p>From ${summary.lowestPremium}/mo to ${summary.highestPremium}/mo</p>

      {plans.map(plan => (
        <div key={plan.id} className="your-plan-card-class">
          <span>{plan.insurerName}</span>
          <span>Plan {plan.planLetter}</span>
          <strong>${plan.monthlyPremium}/mo</strong>
          {plan.marriedDiscount && married && (
            <span className="your-badge-class">Married discount</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Vue 3

```vue
<script setup>
import { computed } from 'vue';
import { comparePlans, getPlansSummary } from './medigap.esm.js';

const props = defineProps({ zip: String, age: Number, married: Boolean });

const plans   = computed(() => comparePlans(props));
const summary = computed(() => getPlansSummary(props));
</script>

<template>
  <div class="your-wrapper-class">
    <p>{{ summary.totalPlans }} plans in {{ summary.state }}</p>
    <div v-for="plan in plans" :key="plan.id" class="your-plan-card-class">
      <span>{{ plan.insurerName }}</span>
      <span>Plan {{ plan.planLetter }}</span>
      <strong>${{ plan.monthlyPremium }}/mo</strong>
    </div>
  </div>
</template>
```

### Vanilla JavaScript

```html
<div id="medigap-results"></div>

<script type="module">
  import { comparePlans, getPlansSummary } from
    'https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/data-export/medigap.esm.js';

  function renderPlans(zip, age, married) {
    const plans   = comparePlans({ zip, age, married });
    const summary = getPlansSummary({ zip, age, married });
    const el      = document.getElementById('medigap-results');

    // Build whatever HTML structure matches your site's design
    el.innerHTML = `
      <p>${summary.totalPlans} plans in ${summary.state} · from $${summary.lowestPremium}/mo</p>
      <table>
        <thead><tr><th>Insurer</th><th>Plan</th><th>Monthly</th><th>Rating</th></tr></thead>
        <tbody>
          ${plans.map(p => `
            <tr>
              <td>${p.insurerName}</td>
              <td>${p.planLetter}</td>
              <td>$${p.monthlyPremium}</td>
              <td>${p.amBestRating}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderPlans('10001', 68, false);
</script>
```

### Svelte

```svelte
<script>
  import { comparePlans, getPlansSummary } from './medigap.esm.js';

  export let zip, age, married = false;

  $: plans   = comparePlans({ zip, age, married });
  $: summary = getPlansSummary({ zip, age, married });
</script>

<div class="your-wrapper-class">
  <p>{summary.totalPlans} plans — median ${summary.medianPremium}/mo</p>
  {#each plans as plan (plan.id)}
    <div class="your-card-class">
      <b>{plan.insurerName}</b> · Plan {plan.planLetter} · ${plan.monthlyPremium}/mo
    </div>
  {/each}
</div>
```

---

## Pricing Model

All calculation happens client-side with embedded data — no network request, no server.

```
monthlyPremium = basePremium × ageFactor × regionMultiplier × (1 − marriedDiscount)
```

| Factor | Formula / Value |
|--------|----------------|
| `ageFactor` | `1 + (age − 65) × 0.03` — 3% per year above 65 |
| `regionMultiplier` | 0.88–1.45 depending on zip code market |
| `marriedDiscount` | 7% where the insurer offers a household rate |

> **Disclaimer:** Premiums are illustrative estimates based on publicly available reference rates. Actual Medigap rates are filed state-by-state and vary by gender, tobacco use, and underwriting. Always verify with a licensed broker.

---

## Raw Data Files

Fetch directly when you want the raw source without the utility functions:

| File | Contents | Fetch URL |
|------|----------|-----------|
| `data/insurers.json` | 12 insurers with ratings | `…/data-export/data/insurers.json` |
| `data/plans.json` | 51 plan offerings | `…/data-export/data/plans.json` |
| `data/zip-codes.json` | 44 zip codes + multipliers | `…/data-export/data/zip-codes.json` |
| `data/plan-letters.json` | Coverage defs A–N | `…/data-export/data/plan-letters.json` |

---

## Covered Regions

44 representative zip codes across all US regions. For unrecognized zips, the national average multiplier (1.0) is used — premiums will still calculate correctly, just without the regional adjustment.

---

## License

Data is illustrative and provided for educational and display purposes only. Not a solicitation or offer of insurance.
