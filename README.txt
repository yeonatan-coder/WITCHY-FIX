Witchy Unified (Ready Base)

If you see: npm ENOENT ... could not read package.json in the root folder,
it means you ran npm from the repo root. This project keeps the frontend under ./frontend.

Run:
  1) RUN_THIS.cmd  (recommended)
or:
  2) cd frontend
     npm install
     npm run dev

Backend runs on http://127.0.0.1:8000
Frontend runs on http://127.0.0.1:5173/home

Demo:
  Open /auth/jwt/login -> click Seed Demo -> login:
    admin@demo.local / admin
    owner@demo.local / owner
    cust@demo.local / cust
