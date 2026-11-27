# School Alumini Portal for Management

An independent student project for Lovely Professional University. The dashboard uses the LPU open-air theatre photograph and the school covers from the [reference website](https://alumni-atlas-lpu-suraj.leftniche4.chatgpt.site/). The interface uses HTML, CSS and plain JavaScript. A Node.js function handles live accounts and shared records.

## Open the dashboard

Double-click `public/index.html` to explore the sample immediately. Use the account button at the top right to switch between Student, Alumni and Administrator. Try a school card, search by profession, or open Reports for totals by school and graduation year. The sample contains 12 fictional alumni across 3 schools. Reloading resets sample edits.

## Upload the project to GitHub

1. Extract the ZIP on your computer. Open the folder containing `package.json`, `vercel.json`, `public/`, `api/` and `server/`.
2. Sign in to GitHub as **surajshrivastav02**. Open [New repository](https://github.com/new) and create **school-alumini-portal-for-management**. A private repository works with Vercel when you grant it access.
3. On the empty repository page choose **uploading an existing file**. For an initialized repository use **Add file → Upload files**. Drag in the extracted contents, keeping the folders intact. Select **Commit changes**.
4. Open the repository's **Code** tab. You should see `vercel.json` and `package.json` at the top level.

## Deploy on Vercel

1. Sign in to Vercel and open [New Project](https://vercel.com/new).
2. Choose **Continue with GitHub** or **Configure GitHub App** if prompted. Grant Vercel access to **school-alumini-portal-for-management**, then select **Import** next to it.
3. Use framework preset **Other** and root directory **./**. Leave the build, install and output overrides off. The project configuration selects `public/` for the website and Vercel packages `api/network.js` as a server function.
4. Select **Deploy**, wait for **Ready**, then choose **Visit**. The first screen is the reference dashboard. The sample works immediately.
5. To use real member accounts, complete the shared-storage steps below.

## Turn on shared registrations and management

1. Open the project in Vercel. Under **Storage** select **Connect Database** or install [Upstash for Redis](https://vercel.com/marketplace/upstash/upstash-kv). Create a dedicated database for this portal, choose a plan within your budget, and connect it to the project's **Production** environment.
2. The server reads the integration's `KV_REST_API_URL` and `KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. If connecting manually, put the URL and read/write token in **Settings → Environment Variables**.
3. For a new self-hosted installation, add `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` of at least 12 characters. The administrator signs in through the normal member form. Keep these values in Vercel.
4. Go to **Deployments**, open the latest production deployment's menu and choose **Redeploy**. Open the site, then **Student demo → Create account**. Register an alumnus with a school, graduation year, profession and mentorship preference. The live directory starts empty.
5. Open a private browser window and register a student from a different school. Request mentorship from the alumnus. In the alumni account, open **Mentorship** and approve the request. Either participant can log a session and next step. Returning users can choose **Student demo → Member sign in**.
6. Sign in as the administrator to maintain directory entries, publish events, review registrations, and inspect reporting. Email addresses are reserved for sign-in. School affiliation is self-reported.

With a connected Git repository, pushing to the production branch triggers another Vercel deployment. [Vercel Git documentation](https://vercel.com/docs/git)

## Run live accounts on your computer

Install Node.js 22 and open the extracted folder in VS Code. In the terminal run:

```sh
npm start
```

Open **http://localhost:3000**. Local records are saved in `.data/`; local sign-in sessions expire when the development server restarts. To use the administrator view locally, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in a local `.env` file and restart the server. All website assets ship in the project.

## First administrator on the published portal

If the owner requested an administrator invitation, open the private, single-use link supplied with the deployment. Set an email address and a password of at least 12 characters. It opens the live management dashboard immediately. For subsequent visits, select **Student demo → Member sign in**. The invitation expires after seven days and stops working as soon as the administrator account is created.

For a separate installation, the environment-variable administrator described above also works without an invitation. The deployment uses a dedicated Redis key prefix so this portal keeps its own accounts, sessions and records.

## Photo credits

The LPU open-air theatre photograph is by Tanya2016. The banner crops the photograph and applies a gradient overlay. The included WebP adaptation is licensed under CC BY-SA 4.0. The three discipline cover illustrations were generated for the reference site. [Original photograph](https://commons.wikimedia.org/wiki/File:Admission-block-copy.jpg) · [Photo license](https://creativecommons.org/licenses/by-sa/4.0/)
