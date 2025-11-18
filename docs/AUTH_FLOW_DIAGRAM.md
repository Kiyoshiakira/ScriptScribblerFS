# Authentication Flow & 403 Error Points

This diagram shows where 403 errors can occur in the authentication flow and how to fix them.

## Sign-In Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens App                           │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   v
         ┌─────────────────────┐
         │   Login Page        │
         │  /login/page.tsx    │
         └─────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        v                     v
┌───────────────┐     ┌───────────────┐
│ Email/Password│     │ Google Sign-In│
└───────┬───────┘     └───────┬───────┘
        │                     │
        │                     │
    [ERROR 1]             [ERROR 2]
    ↓ If provider          ↓ If provider
      not enabled            not enabled
        │                     │
        ↓                     ↓
    auth/operation-       auth/operation-
    not-allowed           not-allowed
        │                     │
        │                     │
    ✅ FIX:              ✅ FIX:
    Enable Email/        Enable Google
    Password in          provider in
    Firebase Console     Firebase Console
        │                     │
        │                     │
        v                     v
┌─────────────┐       ┌─────────────┐
│Firebase Auth│       │Firebase Auth│
│  Service    │       │  Service    │
└──────┬──────┘       └──────┬──────┘
       │                     │
       │                     v
       │              ┌──────────────┐
       │              │Google OAuth  │
       │              │   Redirect   │
       │              └──────┬───────┘
       │                     │
       │                 [ERROR 3]
       │                 ↓ If domain
       │                   not authorized
       │                     │
       │                     ↓
       │                403 That's an
       │                error / unauthorized
       │                domain
       │                     │
       │                     │
       │                 ✅ FIX:
       │                 Add domain to
       │                 Authorized domains
       │                 in Firebase Console
       │                     │
       │                     v
       │              ┌──────────────┐
       │              │ Google Sign-In
       │              │    Screen    │
       │              └──────┬───────┘
       │                     │
       │                 [ERROR 4]
       │                 ↓ If OAuth consent
       │                   not configured
       │                     │
       │                     ↓
       │                access_denied /
       │                403 (scopes)
       │                     │
       │                     │
       │                 ✅ FIX:
       │                 Configure OAuth
       │                 consent screen OR
       │                 disable Drive/Docs
       │                 scopes
       │                     │
       └─────────────────────┘
                   │
                   v
           ┌──────────────┐
           │ Authenticated│
           │     User     │
           └──────┬───────┘
                   │
                   v
           ┌──────────────┐
           │ Check Firestore
           │   for profile │
           └──────┬───────┘
                   │
               [ERROR 5]
               ↓ If Firestore
                 not set up or
                 rules incorrect
                   │
                   ↓
           Missing or insufficient
           permissions
                   │
                   │
               ✅ FIX:
               Create Firestore
               database and deploy
               security rules
                   │
                   v
           ┌──────────────┐
           │ Profile exists?
           └──────┬───────┘
                   │
        ┌──────────┴──────────┐
        │                     │
     No │                     │ Yes
        │                     │
        v                     v
  ┌──────────┐         ┌──────────┐
  │Onboarding│         │ Home/    │
  │  Page    │         │Dashboard │
  └──────────┘         └──────────┘
```

## Error Reference Quick Guide

| Error Point | Error Message | Quick Fix |
|-------------|---------------|-----------|
| **ERROR 1** | `auth/operation-not-allowed` (Email/Password) | Enable Email/Password in Firebase Console → Authentication → Sign-in method |
| **ERROR 2** | `auth/operation-not-allowed` (Google) | Enable Google in Firebase Console → Authentication → Sign-in method |
| **ERROR 3** | `403 That's an error` / `auth/unauthorized-domain` | Add your domain to Firebase Console → Authentication → Sign-in method → Authorized domains |
| **ERROR 4** | `access_denied` / `403` (OAuth scopes) | Configure OAuth consent screen in Google Cloud Console OR disable Drive/Docs scopes in code |
| **ERROR 5** | `Missing or insufficient permissions` | Create Firestore database and deploy security rules: `firebase deploy --only firestore:rules` |

## Data Flow

```
User Input (email/password or Google account)
           ↓
    Firebase Authentication
           ↓
    [403 errors can occur here if setup incomplete]
           ↓
    Authentication Success
           ↓
    Firestore Database Check
           ↓
    [Permission errors can occur here]
           ↓
    User Profile Retrieved
           ↓
    Application Home Page
```

## Firebase Console Setup Checklist

Use this to verify you've completed all required setup:

```
Firebase Console (console.firebase.google.com)
├── Authentication
│   ├── ✅ Email/Password provider enabled
│   ├── ✅ Google provider enabled
│   └── ✅ Authorized domains list includes:
│       ├── ✅ localhost (for local development)
│       ├── ✅ Production domain (if applicable)
│       └── ✅ Cloud workspace domain (if applicable)
│
├── Firestore Database
│   ├── ✅ Database created
│   └── ✅ Security rules deployed
│
└── Project Settings
    └── ✅ Web app registered
        └── ✅ Config copied to .env.local

Google Cloud Console (console.cloud.google.com) [OPTIONAL]
└── OAuth Consent Screen
    ├── ⚙️ App information configured (optional)
    ├── ⚙️ Scopes added (optional, for Drive/Docs import)
    └── ⚙️ Test users added (optional, if in testing mode)
```

## Common Error Patterns

### Pattern 1: Fresh Install
```
New user → No Firebase setup → Multiple 403 errors
                                     ↓
                         Follow QUICK_START_CARD.md
                                     ↓
                         4 steps in Firebase Console
                                     ↓
                              All errors resolved
```

### Pattern 2: Local to Cloud Workspace
```
Works locally → Deploy to cloud → 403 on Google sign-in
                                         ↓
                         Domain not in authorized list
                                         ↓
                         Add workspace domain to Firebase
                                         ↓
                              Works in cloud workspace
```

### Pattern 3: Google Docs Import
```
Basic auth works → Try Docs import → access_denied
                                         ↓
                         OAuth consent screen needed
                                         ↓
                    Configure in Google Cloud Console
                         OR disable Drive/Docs scopes
                                         ↓
                              Feature works or disabled
```

## Prevention Tips

1. **Before starting development:**
   - [ ] Complete Firebase Console setup first
   - [ ] Use SETUP_CHECKLIST.md
   - [ ] Verify each step before moving on

2. **When adding new domains:**
   - [ ] Add to Firebase authorized domains immediately
   - [ ] Test sign-in after adding
   - [ ] Document the domain for team members

3. **When deploying:**
   - [ ] Add production domain to Firebase
   - [ ] Deploy Firestore rules
   - [ ] Test all auth methods in production
   - [ ] Keep .env.local in .gitignore

4. **For team members:**
   - [ ] Share QUICK_START_CARD.md
   - [ ] Ensure everyone has Firebase access
   - [ ] Document team-specific setup steps

## Troubleshooting Steps

If you encounter a 403 error, follow these steps in order:

1. **Identify the specific error message**
   - Open browser console (F12)
   - Look for error code (e.g., `auth/unauthorized-domain`)
   - Note the complete error text

2. **Find the error in the table above**
   - Match error message to Error Point
   - Follow the Quick Fix

3. **If not resolved:**
   - See [TROUBLESHOOTING_403_ERRORS.md](TROUBLESHOOTING_403_ERRORS.md)
   - Find your specific scenario
   - Follow detailed solution

4. **Still stuck?**
   - Verify all items in Firebase Console Setup Checklist
   - Clear browser cache and cookies
   - Try incognito/private browsing mode
   - Check [TROUBLESHOOTING_403_ERRORS.md](TROUBLESHOOTING_403_ERRORS.md) for advanced scenarios

## Additional Resources

- [Quick Start Card](QUICK_START_CARD.md) - 4-step fix (10 min)
- [User Setup Instructions](USER_SETUP_INSTRUCTIONS.md) - Complete Firebase setup
- [Troubleshooting 403 Errors](TROUBLESHOOTING_403_ERRORS.md) - Detailed solutions
- [Setup Checklist](SETUP_CHECKLIST.md) - Verification checklist

---

**Last Updated:** 2025-11-18
