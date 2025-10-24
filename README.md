# @emd-cloud/create-app

A comprehensive project scaffolder for creating EMD Cloud applications with your choice of framework, language, styling, and state management solutions.

## Quick Start

```bash
npm create @emd-cloud/app@latest
```

Or with a specific project name:

```bash
npm create @emd-cloud/app@latest my-emd-app
```

## Features

✨ **Multiple Framework Support**
- Vite + React (Standard and SWC)
- Next.js 15+ (App Router)
- Future: Vue, Svelte, Solid, Vanilla

🎯 **Language & Compiler Options**
- JavaScript
- TypeScript
- SWC Compiler (Rust-based, faster builds)

🎨 **Styling Solutions**
- Vanilla CSS
- SCSS/SASS
- Tailwind CSS
- Tailwind CSS + shadcn/ui (TypeScript only)

⚡ **State Management**
- None (basic setup)
- Redux Toolkit
- Effector
- TanStack Query

🛠️ **Developer Tools**
- ESLint (Standard, Airbnb, or None)
- Prettier formatting
- Git initialization
- Auto package manager detection

## Installation Methods

### Using npm
```bash
npm create @emd-cloud/app@latest
```

### Using yarn
```bash
yarn create @emd-cloud/app
```

### Using pnpm
```bash
pnpm create @emd-cloud/app
```

### Using bun
```bash
bun create @emd-cloud/app
```

## Interactive Prompts

When you run the command, you'll be guided through the following options:

1. **Project Name** - The name of your new project
2. **Framework** - Choose between React (Vite) or Next.js
3. **Language** - JavaScript or TypeScript
4. **Styling** - CSS approach (options depend on your selections)
5. **State Management** - State solution (Redux, Effector, TanStack Query, or None)
6. **Package Manager** - npm, yarn, pnpm, or bun (auto-detected by default)
7. **Git Repository** - Initialize git with first commit
8. **ESLint/Prettier** - Code quality configuration

## Template Structure

### Vite + React Templates
- **Lightweight** and **fast** development experience
- Hot Module Replacement (HMR)
- Instant startup
- Optimized production builds with Rollup
- Best for SPAs and component libraries

**Compiler Options:**
- **Standard**: Uses Babel for transformation
- **SWC**: Uses SWC (Speedy Web Compiler) for 20x faster compilation

### Next.js Templates
- **Full-stack** capabilities with server and client components
- Built-in API routes
- Image optimization
- Font optimization
- SEO-friendly by default
- App Router (newest architecture)

## Framework Selection Guide

### Choose Vite + React if you need:
- A lightweight, fast SPA
- Maximum control over build configuration
- Faster development experience
- Smaller bundle size

### Choose Next.js if you need:
- Full-stack capabilities
- Server-side rendering
- Static site generation
- API routes
- Image/font optimization
- Built-in SEO features

## Styling Guide

### Vanilla CSS
- No dependencies
- Smallest footprint
- Full control
- Best for simple projects

### SCSS/SASS
- Variables and mixins
- Nested selectors
- Mixins and functions
- Better organization for larger projects

### Tailwind CSS
- Utility-first approach
- Rapid UI development
- Consistent design system
- Smaller final bundle (with purging)

### Tailwind + shadcn/ui
- Pre-built, accessible components
- Built on Radix UI
- Customizable with Tailwind
- TypeScript first
- Best for feature-rich applications

## State Management Guide

### None
- Suitable for simple applications
- Use React Context or local state
- Recommended for getting started

### Redux Toolkit
- Predictable state management
- Great for large applications
- Large ecosystem
- DevTools for debugging
- Learning curve

### Effector
- Modern, fast state management
- TypeScript-first
- Great DX with TypeScript
- Less boilerplate than Redux
- Smaller bundle size

### TanStack Query
- Server state management
- Perfect for data fetching
- Automatic caching and synchronization
- Excellent for REST/GraphQL APIs
- Works with any state manager

## After Creation

Once your project is created, navigate to it and follow the displayed instructions:

```bash
cd my-emd-app
npm install  # or your preferred package manager
npm run dev  # Start development server
```

## Development Commands

### Vite + React
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run type-check  # Check TypeScript types (TS only)
```

### Next.js
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## EMD Cloud Integration

All templates come pre-configured with **@emd-cloud/react-components**, which provides React hooks and components for seamless EMD Cloud integration.

### ApplicationProvider Setup

The templates are pre-configured with ApplicationProvider wrapping your app:

**React (Vite):**
```javascript
import { ApplicationProvider } from '@emd-cloud/react-components'

function App() {
  return (
    <ApplicationProvider
      app={import.meta.env.VITE_EMD_APP_ID || 'your-app-id'}
      apiUrl="https://api.emd.one"
      authToken={localStorage.getItem('emd_auth_token') || undefined}
    >
      <YourComponents />
    </ApplicationProvider>
  )
}
```

**Next.js:**
```javascript
import { ApplicationProvider } from '@emd-cloud/react-components'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ApplicationProvider
          app={process.env.NEXT_PUBLIC_EMD_APP_ID || 'your-app-id'}
          apiUrl="https://api.emd.one"
        >
          {children}
        </ApplicationProvider>
      </body>
    </html>
  )
}
```

### Using EMD Cloud Hooks

```javascript
import { useAuth, useDatabase, useWebhook } from '@emd-cloud/react-components'

function MyComponent() {
  const { userInfo, logInUser, logOutUser } = useAuth()
  const { getRows, createRow } = useDatabase()
  const { callWebhook } = useWebhook()

  // Use the hooks in your component
}
```

For full documentation on available hooks and components, visit the [@emd-cloud/react-components documentation](https://github.com/EMD-Cloud/react-components).

## Environment Variables

Create a `.env.local` file in your project root:

```bash
# For Vite projects
VITE_API_URL=https://api.example.com

# For Next.js projects
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Customization

After project creation, you can:

- Modify ESLint config (`.eslintrc.json`)
- Update Prettier config (`.prettierrc.json`)
- Configure Tailwind (for Tailwind projects)
- Add environment variables
- Install additional dependencies

## Project Structure

```
my-emd-app/
├── src/                 # Vite + React only
│   ├── App.jsx/tsx
│   ├── main.jsx/tsx
│   └── ...
├── app/                 # Next.js only
│   ├── layout.jsx/tsx
│   ├── page.jsx/tsx
│   └── ...
├── public/              # Static assets
├── package.json
├── tsconfig.json        # TypeScript config
├── .eslintrc.json       # ESLint config
├── .prettierrc.json     # Prettier config
├── .gitignore
└── README.md
```

## Support

For issues, feature requests, or questions:
- GitHub Issues: [Create an issue](https://github.com/emd-cloud/create-app/issues)
- Documentation: [EMD Cloud Docs](https://docs.emd-cloud.dev)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit PRs.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.
