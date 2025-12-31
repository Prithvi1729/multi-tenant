# Multi-Tenant

This repository demonstrates a simple multi-tenant Angular app (two tenants) with dynamic theming, per-tenant layout, and role-based access control (Admin/User).

- Node.js (16+)
- Firebase CLI (for production deployment)

Quick start (dev)
1. Install dependencies:
```bash
npm install
```
2. Run dev server (bind to all hosts for local subdomain testing):
```bash
# dev server bound to all interfaces
npm start -- --host 0.0.0.0
```

User credentials (local test data)
- Tenant 1 Admin: `admin1` / `passAdmin1`
- Tenant 1 User:  `user1`  / `passUser1`
- Tenant 2 Admin: `admin2` / `passAdmin2`
- Tenant 2 User:  `user2`  / `passUser2`

Notes about login/tenant enforcement
- The app loads the tenant configuration based on hostname (first subdomain) or `?tenant=` query parameter.
- `AuthService.login()` enforces that the user's `tenantId` matches the detected tenant. Trying to log in as `admin2` on tenant1.local will be rejected.
- To clear a session in the browser console:
```js
localStorage.removeItem('mt_current_user')
```

Firebase Hosting (two subdomains)
1. Install Firebase tools and login:
```bash
npm i -g firebase-tools
firebase login
```
2. Create two Firebase Hosting sites in your Firebase project (or one project with two sites). Follow the Firebase console to add custom domains `tenant1.domain.com` and `tenant2.domain.com` and verify ownership.
3. Configure hosting targets locally:
```bash
# example: apply targets linking a local name to a Firebase site name
firebase target:apply hosting tenant1 <FIREBASE_SITE_ID_FOR_TENANT1>
firebase target:apply hosting tenant2 <FIREBASE_SITE_ID_FOR_TENANT2>
```
4. Example `firebase.json` for two hosting targets (same build output):
```json
{
  "hosting": [
    {
      "target": "tenant1",
      "public": "dist/multi-tenant",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "tenant2",
      "public": "dist/multi-tenant",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```
5. Build and deploy per target:
```bash
npm run build
firebase deploy --only hosting:tenant1
firebase deploy --only hosting:tenant2
```

Files of interest
- `src/assets/tenants.json` — tenant IDs, logos, colors, layout type
- `src/assets/users.json` — development credentials
- `src/app/services/tenant.service.ts` — tenant detection + theme application
- `src/app/services/auth.service.ts` — login/logout and tenant enforcement

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

