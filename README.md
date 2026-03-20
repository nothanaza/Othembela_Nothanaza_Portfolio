# Portfolio Contact Form Backend

This project now includes a small Node backend for the contact form.

## 1. Install Node.js

Install Node.js 18 or newer.

## 2. Configure email settings

1. Copy `.env.example` to `.env`
2. Fill in:
   - `RESEND_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`

You can get a Resend API key from https://resend.com/.

Important:
- `CONTACT_TO_EMAIL` is the email address where you want to receive contact messages.
- `CONTACT_FROM_EMAIL` must be a sender address allowed by Resend.
- `onboarding@resend.dev` works only for testing to your own Resend account. For real use, verify your own domain in Resend and use something like `Portfolio Contact <hello@yourdomain.com>`.

## 3. Start the site

Run:

```bash
node server.js
```

Then open:

```bash
http://localhost:3000
```

## 4. Deploy

Deploy the whole project on any Node-compatible host, then add the same environment variables there.
