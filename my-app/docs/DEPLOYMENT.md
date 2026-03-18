# Deployment Guide — AWS Amplify

Step-by-step instructions to deploy QubitLab Visualizer on AWS Amplify.

---

## Prerequisites

- An AWS account (free tier works)
- Your code pushed to a GitHub repository
- Your Supabase project URL and anon key (from Supabase dashboard)
- Your OpenAI API key (from https://platform.openai.com/api-keys)

---

## Step 1: Push your code to GitHub

1. Make sure all your changes are committed:
   ```bash
   git add -A
   git commit -m "Phase 8: production ready for deployment"
   git push origin main
   ```
2. Verify the repo has the `amplify.yml` file in the **root** of the repository (not inside `my-app/`).

---

## Step 2: Open AWS Amplify Console

1. Go to https://console.aws.amazon.com/amplify/
2. Make sure you are in your preferred AWS region (e.g., `us-east-1`).
3. Click **Create new app**.

---

## Step 3: Connect your GitHub repository

1. Select **GitHub** as the source provider.
2. Click **Authorize AWS Amplify** if prompted to grant GitHub access.
3. Select your repository: `qubit-lab-visualizer` (or whatever you named it).
4. Select the branch: `main` (or `deployement` if that's your branch).
5. Click **Next**.

---

## Step 4: Configure build settings

1. Amplify should auto-detect the `amplify.yml` in the repo root. Verify the build settings show:
   - **App root**: `my-app`
   - **Build command**: `npm run build`
   - **Output directory**: `.next`
2. If Amplify does not auto-detect the `amplify.yml`, select "Edit" and paste the contents of the `amplify.yml` file from the repo root.
3. Under **Framework**, make sure it says **Next.js - SSR** (not static).
4. Click **Next**.

---

## Step 5: Set environment variables

1. Before clicking **Save and deploy**, expand the **Advanced settings** section (or go to the **Environment variables** section).
2. Add the following environment variables:

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `OPENAI_API_KEY` | `sk-...your OpenAI key` |

3. To find your Supabase values:
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to **Settings** > **API**
   - Copy the **Project URL** and **anon public** key

---

## Step 6: Deploy

1. Click **Save and deploy**.
2. Amplify will start building. This takes 2-5 minutes.
3. Watch the build logs. You should see:
   - `npm ci` installing dependencies
   - `npm run build` compiling the Next.js app
   - Deployment completing successfully
4. If the build fails, check the logs for missing environment variables or dependency issues.

---

## Step 7: Configure Supabase for the deployed URL

Once the deployment is done, Amplify gives you a URL like `https://main.d1234abcde.amplifyapp.com`.

1. Go to your **Supabase dashboard** > **Authentication** > **URL Configuration**.
2. Add your Amplify URL to the **Site URL** field:
   ```
   https://main.d1234abcde.amplifyapp.com
   ```
3. Add the same URL to the **Redirect URLs** list:
   ```
   https://main.d1234abcde.amplifyapp.com/**
   ```
4. Click **Save**.

This is required because Supabase auth will reject redirects to URLs not in the allowed list.

---

## Step 8: Test the deployed app

1. Open the Amplify URL in your browser.
2. You should be redirected to the login page.
3. **Sign up** with a new account (or use your existing one if the Supabase project is the same).
4. After logging in, verify:
   - The Bloch sphere renders correctly
   - Gates can be applied and the sphere updates
   - Circuits can be saved and loaded
   - Run history is recorded
   - The AI chat icon appears in the bottom-right (click it and ask a question)
5. Test sign out and sign back in.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails with "module not found" | Check that `amplify.yml` has `appRoot: my-app` and `npm ci` runs in the right directory |
| Auth redirects fail or loop | Add your Amplify URL to Supabase's **Site URL** and **Redirect URLs** (Step 7) |
| AI chat returns 503 | Your `OPENAI_API_KEY` environment variable is missing or empty in Amplify |
| AI chat returns 429 | Your OpenAI account is out of credits. Add funds at https://platform.openai.com/settings/organization/billing/overview |
| Blank page after deploy | Check browser console. If it's a CORS or auth error, verify Supabase URL config |
| "middleware" deprecation warning in build logs | This is a non-blocking warning from Next.js 16. The app works correctly with the current middleware setup |
| Database tables not found (save/load fails) | Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor if you haven't already |

---

## Optional: Custom Domain

1. In the Amplify console, go to **Domain management**.
2. Click **Add domain**.
3. Follow the steps to add your custom domain and configure DNS.
