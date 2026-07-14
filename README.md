# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> **Seasoned astronaut?** Delete this file. Have fun!

## Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
cadencelab-astro7/
├── .vscode/
│   └── settings.json
│
├── public/
│   ├── admin/
│   │   └── index.html
│   ├── fonts/
│   │   ├── graphik/
│   │   └── tiempos/
│   ├── uploads/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── blog/
│   │   ├── NavHeader.astro
│   │   ├── Footer.astro
│   │   └── ...
│   │
│   ├── content/
│   │   ├── blog/
│   │   │   ├── adoption-fatigue.md
│   │   │   └── hello-world.md
│   │   │
│   │   └── pages/
│   │       └── ...
│   │
│   ├── layouts/
│   │   └── Layout.astro
│   │
│   ├── lib/
│   │   └── tina/
│   │       ├── data.ts
│   │       └── islands.ts
│   │
│   ├── pages/
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [year]/
│   │   │       └── [month]/
│   │   │           └── [slug].astro
│   │   │
│   │   ├── tina-island/
│   │   │   └── [name].ts
│   │   │
│   │   ├── [...slug].astro
│   │   ├── fit-check.astro
│   │   ├── index.astro
│   │   └── thanks.astro
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── ...
│   │
│   └── content.config.ts
│
├── tina/
│   ├── __generated__/
│   │   ├── client.ts
│   │   └── types.ts
│   ├── config.ts
│   └── tina-lock.json
│
├── .env
├── .env.example
├── .gitignore
├── AGENTS.md
├── astro.config.mjs
├── CLAUDE.md
├── package-lock.json
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
