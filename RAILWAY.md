# Deploy to Railway

Two services, one Postgres database, two persistent volumes.

## Setup

### 1. Create a Postgres database

In your Railway project, click "New" then "Database" then "PostgreSQL".

### 2. Backend (Strapi)

- Add a new service from your GitHub repo
- Set root directory to `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Add a volume at `/app/backend/public/uploads` (1 GB)
- Set these environment variables:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=1337
APP_KEYS="<generate with: openssl rand -hex 32, comma separated, 4 values>"
API_TOKEN_SALT="<openssl rand -hex 32>"
ADMIN_JWT_SECRET="<openssl rand -hex 32>"
TRANSFER_TOKEN_SALT="<openssl rand -hex 32>"
JWT_SECRET="<openssl rand -hex 32>"
ENCRYPTION_KEY="<openssl rand -hex 32>"
DATABASE_CLIENT=postgres
DATABASE_HOST=${PGHOST}
DATABASE_PORT=${PGPORT}
DATABASE_NAME=${PGDATABASE}
DATABASE_USERNAME=${PGUSER}
DATABASE_PASSWORD=${PGPASSWORD}
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

After the first deploy, seed data with: `railway run --service backend npm run data:import:seed`

### 3. Frontend (Next.js)

- Add another service from the same repo
- Set root directory to `frontend`
- Build command: `npm install && cd frontend && bash scripts/scrape-media.sh && npm run build`
- Start command: `npm run start --workspace frontend`
- Add a volume at `/app/frontend/public/media` (500 MB)
- Set these environment variables:

```env
NODE_ENV=production
STRAPI_API_URL=http://backend.railway.internal:1337/api
NEXT_PUBLIC_STRAPI_URL=https://<your-backend-public-domain>
NEXT_PUBLIC_STRAPI_API_URL=https://<your-backend-public-domain>/api
NEXT_PUBLIC_SITE_URL=https://<your-frontend-public-domain>
```

Replace the placeholder domains with your actual Railway domains. You can find them in each service's Networking settings.

### 4. Update next.config.ts

Update the image domains so Next.js can optimize Strapi media:

```ts
import type { NextConfig } from "next";

const strapiHost = new URL(
  process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"
).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: strapiHost },
    ],
  },
};

export default nextConfig;
```

Push this change before deploying the frontend.

### 5. Deploy

Push to main. Both services deploy automatically.

## How the volumes work

- **backend/public/uploads** keeps Strapi uploads alive across rebuilds
- **frontend/public/media** keeps product images/videos alive across rebuilds
- On first deploy the frontend build scrapes media from nota.uprock.pro. On future deploys the volume already has the files so the scrape step is instant.

## Troubleshooting

- Media 404: check the volume is mounted and files exist. Run `railway shell --service frontend` then `ls public/media/`
- Backend won't start: make sure NODE_ENV=production and DATABASE_CLIENT=postgres, not sqlite
- Frontend can't reach API: use the backend's public domain for NEXT_PUBLIC variables and its internal domain for STRAPI_API_URL
