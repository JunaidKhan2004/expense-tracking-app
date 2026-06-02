# Spendly Email Templates — Supabase Setup Guide

## Kahan Lagana Hai

1. Supabase Dashboard kholo → https://supabase.com/dashboard
2. Apna project select karo
3. Left sidebar mein jao: **Authentication → Email Templates**

---

## Reset Password Template

1. "Reset Password" tab click karo
2. **Subject** mein likho:
   ```
   Reset your Spendly password
   ```
3. **Body** mein `reset-password.html` ka poora content paste karo
4. **Save** karo

---

## Confirm Signup Template

1. "Confirm signup" tab click karo
2. **Subject** mein likho:
   ```
   Verify your Spendly account
   ```
3. **Body** mein `confirm-signup.html` ka poora content paste karo
4. **Save** karo

---

## Important Variables (Supabase Automatic Bhejta Hai)

| Variable | Matlab |
|----------|--------|
| `{{ .ConfirmationURL }}` | Reset/verify link |
| `{{ .Token }}` | 6-digit OTP code |
| `{{ .Email }}` | User ka email |
| `{{ .SiteURL }}` | App ka URL |

---

## Deep Link Setup (Mobile App ke Liye)

Supabase Dashboard mein:
**Authentication → URL Configuration**

Redirect URLs mein yeh add karo:
```
spendly://
spendly://reset-password
spendly://auth/callback
```
