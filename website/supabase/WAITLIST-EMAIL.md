# Waitlist email (FormSubmit)

Waitlist signups on the live site are emailed to **regradeteam@gmail.com** via [FormSubmit.co](https://formsubmit.co).

## First-time setup (one time)

1. Submit a test signup on https://shadowesu.github.io/Vigilante/
2. Check **regradeteam@gmail.com** for a FormSubmit activation email
3. Click **Activate Form** — after that, every signup arrives instantly

## What each email includes

| Field | Content |
|-------|---------|
| email | Signup email |
| company | Company name |
| role | Role |
| plan | Selected plan tier |
| promo_code | Promo if applied |
| due_monthly_usd | Quoted monthly price |

## Override email (optional)

Set GitHub secret or env var:

```
NEXT_PUBLIC_WAITLIST_NOTIFY_EMAIL=you@example.com
```

Redeploy after changing.

Supabase insert still runs when keys are configured (for database backup); FormSubmit is the primary delivery on GitHub Pages.
