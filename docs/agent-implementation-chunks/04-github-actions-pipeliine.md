# Step 5: CI/CD automation (deployment layer)

This step is not the core feature. It is the deployment layer that keeps the core implementation working as content changes.

The purpose of GitHub Actions here is simple: automatically run the Astro build, generate the Markdown artifacts, and deploy the Worker plus built assets to Cloudflare whenever the main branch changes. This keeps the Markup-for-Agents implementation consistent with future content updates, without treating deployment automation as a separate product feature.

## What the Optional GitHub Actions Step Does

Right now, if you add a new blog post in TinaCMS locally, you must run:

1. `npm run build` (to compile HTML and generate matching `.md` assets in `/dist`)
2. `npx wrangler deploy` (to push those new static files up to the Cloudflare Worker asset layer)

The **GitHub Actions pipeline** automates those two manual terminal commands. Every time you merge code or save a TinaCMS change into your main repository branch, a remote GitHub server boots up, compiles the Astro site, and syncs the changes to Cloudflare instantly.

To automate your pipeline, you will create a GitHub Actions workflow file that runs on every push to your main branch. This runner installs Node.js, triggers the Astro 7.2 build (which generates both HTML and agent-ready Markdown files), and pushes the entire production build directory straight to Cloudflare's network using the official Wrangler Action.

### Step 1: Generate a Cloudflare API Token

GitHub needs authorization to deploy to your Cloudflare account without requiring your personal password.

1. Log into your Cloudflare Dashboard.
2. Navigate to My Profile > API Tokens > click Create Token.
3. Select the Edit Cloudflare Workers template.
4. Under Account Resources, choose your target account.
5. Under Zone Resources, choose All zones (or select your specific domain name).
6. Click Continue to summary and then Create Token.
7. Copy the long generated token string immediately. (It will only be shown once).

### Step 2: Save the Token as a GitHub Repository Secret

Store your secret keys securely within your GitHub repository settings.

1. Open your code repository on GitHub.
2. Navigate to Settings > Secrets and variables > Actions.
3. Click the New repository secret button.
4. Set the Name exactly to: `CLOUDFLARE_API_TOKEN`
5. Paste your copied API token string into the Secret input field.
6. Click Add secret.

### Step 3: Create the GitHub Actions Workflow File

Instruct GitHub to spin up a server runner whenever code shifts or a content update is committed via your CMS.

1. In your local project repository, create a nested folder structure: .`github/workflows/`.
2. Inside that folder, create a new deployment configuration file named `deploy.yml`.
3. Paste the following configuration script exactly:

```yaml
name: Deploy Astro & Markdown for Agents to Cloudflare Workers

on:
  push:
    branches:
      - main # Adjust this if your default branch is named 'master'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Install Dependencies
        run: npm ci

      - name: Build Astro Site (Generates HTML and Markdown assets)
        run: npm run build

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

### Step 4: Commit and Push to Trigger the Initial Run

Save your configuration files to GitHub to verify that your edge-worker routing and page structure compile natively in the cloud.

1. Run git add `.github/workflows/deploy.yml` in your terminal.
2. Commit the pipeline definition: `git commit -m "ci: add cloudflare worker auto-deployment pipeline"`.
3. Push up to your live server branch: `git push origin main`.

### How Your Workflow Executes Moving Forward

- **Trigger:** Every time you push code changes or update content via your TinaCMS admin interface, the pipeline wakes up automatically.
- **Compilation:** GitHub runs `npm run build` to cleanly output structural folders like `/dist/blog/` and `/dist/markdown/` simultaneously.
- **Syncing:** The `wrangler-action` directly ships the final bundled worker code and its synchronized asset assets folder layout straight onto Cloudflare's serverless edge.
