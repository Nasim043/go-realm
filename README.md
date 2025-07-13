# Getting Started with Nextra

This guide will help you set up a Next.js project using **Nextra** and its **theme-docs** for building a documentation website.

## 1. Install Dependencies

First, create a Next.js app and install Nextra and the required theme:

```bash
npx create-next-app@latest
npm install nextra nextra-theme-docs
```

## 2. Update Next.js Configuration

Rename `next.config.js` to `next.config.mjs` and set up Nextra with the configuration:

```js
// next.config.mjs
import nextra from "nextra";

// Set up Nextra with its configuration
const withNextra = nextra({
  // Add Nextra-specific options here (e.g., themes, plugins)
});

// Export the final Next.js config with Nextra included
export default withNextra({
  // Add regular Next.js options here (e.g., reactStrictMode)
});
```

Additionally, in your `tsconfig.json`, add the following to the `include` array:

```json
{
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "next.config.mjs"
  ]
}
```

## 3. Add MDX Components

Create an `mdx-components.js` file in the root directory to customize the MDX components for your theme:

```js
// mdx-components.js
import { useMDXComponents as getThemeComponents } from "nextra-theme-docs"; // or nextra-theme-blog or your custom theme

// Get the default MDX components
const themeComponents = getThemeComponents();

// Merge and override components
export function useMDXComponents(components) {
  return {
    ...themeComponents,
    ...components,
  };
}
```

## 4. Set Up Root Layout

Create a `layout.jsx` file in the `app` directory for the root layout of your documentation site:

```js
// app/layout.jsx
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Banner, Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata = {
  // Define your metadata here (e.g., title, description, keywords, etc.)
  // Refer to the Next.js metadata API for more details: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
};

const banner = <Banner storageKey="some-key">Nextra 4.0 is released 🎉</Banner>;
const navbar = (
  <Navbar
    logo={<b>Nextra</b>}
    // Add additional navbar options here
  />
);
const footer = <Footer>MIT {new Date().getFullYear()} © Nextra.</Footer>;

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
      // Your additional head options (e.g., meta tags, styles)
      >
        {/* Additional tags should be passed as children of `<Head>` */}
      </Head>
      <body>
        <Layout
          banner={banner}
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/shuding/nextra/tree/main/docs"
          footer={footer}
          // Additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
```

## 5. Run the Project

Once everything is set up, you can run your project locally:

```bash
npm run dev
```

Your Nextra-based documentation website should now be running at `http://localhost:3000`.

---

### Additional Resources

- [Nextra Documentation](https://nextra.vercel.app/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

# My Nextra-Based Next.js Project

## 🔧 Setup Changes

### 1. Removed Default Page

The default Next.js page file `app/page.jsx` has been deleted to avoid conflict with custom routing and Nextra configuration.

### 2. Updated `next.config.mjs`

The `next.config.mjs` file has been configured to use Nextra and includes a redirect from `/` to `/resources`.

```js
// next.config.mjs

import withNextra from "nextra";

// Export the final Next.js config with Nextra included
export default withNextra({
  // ... Add regular Next.js options here
  async redirects() {
    return [
      {
        source: "/",
        destination: "/resources",
        permanent: true,
      },
    ];
  },
});
```
