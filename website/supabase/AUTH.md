# Supabase Auth — Magic Link Setup

Run once in [Supabase Dashboard](https://supabase.com/dashboard/project/lshqzxgzehgmzgeilvmy/auth/url-configuration).

## URL Configuration

**Site URL** (set to your primary public URL):

```
https://shadowesu.github.io/Vigilante
```

**Redirect URLs** — add all of these (one per line):

```
http://localhost:3000/auth/callback
https://shadowesu.github.io/Vigilante/auth/callback
```

When you move to a custom domain, also add:

```
https://vigilant.app/auth/callback
```

## Email provider

1. Go to **Authentication → Providers → Email**
2. Enable **Email** provider
3. Enable **Confirm email** only if you want double opt-in (optional for magic link)
4. For production deliverability, configure **Custom SMTP** under Project Settings → Auth

## Test

1. Open `/auth` on your site
2. Enter email → check inbox (and spam)
3. Click link → should land on `/auth/callback` then redirect to `/app` (or `/preview` on GitHub Pages)

If you see "redirect URL not allowed", the exact callback URL in the email must match a Redirect URL above.
