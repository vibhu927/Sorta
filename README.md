# SORTA Company — replica + CMS

Ditto-style replica of https://sorta-company.lovable.app built with Next.js 16 + Tailwind v4.
Every text, image, service, project, step, testimonial, contact option and SEO field is editable
from a password-protected admin panel. Contact form submissions land in the admin inbox only.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Admin access

- URL: `/admin` (also linked as “Admin” in the footer, like the original’s Studio Desk)
- Email: `admin@sorta.company`
- Password: the one I gave you at handover (never commit it anywhere — keep it private; you can rotate it anytime in Admin → Settings)
- Change it anytime: Admin → Settings → Change password (stored hashed in `content/admin.json`).
- Auth: bcrypt hash + HS256 JWT in an httpOnly cookie (7 days). All `/api/content`, `/api/enquiries` (GET/DELETE),
  `/api/upload`, password change require login.

## What you can edit (no code)

- Home: hero texts + image (upload), statement, about paragraphs
- Services: add / edit / delete (title, desc, number)
- Projects: add / edit / delete (slug, client, category, type, descriptions, image upload, show-on-home)
- Process steps, client logos, testimonial
- Contact: title, email, need + budget dropdown options
- SEO title/description, footer texts
- Enquiries inbox: view + delete (contact form posts here; nothing is emailed)
- Images: admin upload → `/public/uploads/...` (served directly). Seeded images live in `/public/images/`.

## Content files

- `content/site.json` — all site copy
- `content/projects.json` — work list + detail pages (`/work`, `/work/[slug]`)
- `content/enquiries.json` — inbox (empty by default)
- `content/admin.json` — email + bcrypt password hash

## Notes

- Original Lovable preview link was private; replica was built from the public `sorta-company.lovable.app`
  copy + downloaded `assets/sorta-project-*` images (now bundled locally).
- File-based CMS = perfect for 1 admin. If you outgrow it (multiple editors, heavy traffic),
  move `content/*.json` to SQLite/Postgres and uploads to S3/Vercel Blob.
