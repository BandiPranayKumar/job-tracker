# 📋 Job Application Tracker — Full Stack Project Documentation

---

## PART 1 — PROJECT ANALYSIS (Original Code)

### What was good ✅
- Clean, modern UI with good visual hierarchy
- CSS Custom Properties (variables) for consistent theming
- Chart.js integration for the doughnut chart
- Hash-based SPA navigation
- Floating label form design

### Critical Issues Found ❌

| Issue | Where | Problem |
|-------|-------|---------|
| No backend at all | Entire app | All data in `localStorage` only |
| Fake auth | `loginForm` submit | Any email/password logs you in — no real validation |
| No database | `saveData()` | Data lost on different device/browser |
| No REST APIs | `saveApplication()` | Uses `localStorage.setItem` instead of `fetch()` |
| Global functions on `window` | `window.editApp`, `window.deleteApp` | Anti-pattern, pollutes global scope |
| Simulated network delay | `simulateNetworkDelay()` | Fake `setTimeout`, not real async |
| No modules | Single `script.js` | All 639 lines in one file — hard to scale |
| No error handling | Auth forms | No try/catch, no user feedback on failure |
| No pagination | `renderTable()` | All records rendered at once |
| No input sanitization on backend | N/A | No backend existed |

---

## PART 2 — FOLDER STRUCTURE

```
job-tracker/
│
├── frontend/                      ← Static files (open with Live Server)
│   ├── index.html                 ← Main HTML (semantic, accessible)
│   ├── css/
│   │   └── style.css              ← All styles (CSS3, Flexbox, Grid, Responsive)
│   └── js/
│       ├── app.js                 ← Main controller (ES6 module, entry point)
│       ├── api.js                 ← API service layer (all fetch() calls)
│       └── ui.js                  ← UI helpers (DOM manipulation, rendering)
│
├── backend/                       ← Node.js + Express REST API
│   ├── server.js                  ← Express app entry point
│   ├── package.json
│   ├── .env.example               ← Template for environment variables
│   │
│   ├── config/
│   │   └── db.js                  ← MongoDB connection (Mongoose)
│   │
│   ├── models/
│   │   ├── User.js                ← Mongoose User schema + password hashing
│   │   └── Application.js         ← Mongoose Application schema
│   │
│   ├── controllers/
│   │   ├── authController.js      ← register, login, getMe logic
│   │   └── applicationController.js ← Full CRUD + stats + search/filter/pagination
│   │
│   ├── routes/
│   │   ├── authRoutes.js          ← POST /register, POST /login, GET /me
│   │   └── applicationRoutes.js   ← GET/POST /applications, GET/PUT/DELETE /:id
│   │
│   └── middleware/
│       ├── authMiddleware.js      ← JWT verification (protect routes)
│       └── errorMiddleware.js     ← Global error handler + 404 handler
│
└── docs/
    └── PROJECT_DOCS.md            ← This file
```

---

## PART 3 — ARCHITECTURE EXPLANATION

### Request Flow (how a GET /applications works)

```
Browser (fetch)
    ↓  Authorization: Bearer <JWT>
Express server.js
    ↓  app.use('/api/applications', applicationRoutes)
applicationRoutes.js
    ↓  router.use(protect)  ← JWT is verified here
authMiddleware.js
    ↓  req.user = decoded user from token
applicationController.js → getApplications()
    ↓  Application.find({ user: req.user._id })
MongoDB (via Mongoose)
    ↓  returns documents
JSON Response → Browser
```

---

## PART 4 — FEATURES ADDED / IMPROVED

| Feature | Original | New |
|---------|----------|-----|
| Authentication | Fake (any email works) | Real JWT — bcrypt hashed passwords |
| Data storage | localStorage | MongoDB via Mongoose |
| Add application | ✅ (localStorage) | ✅ POST /api/applications |
| Edit application | ✅ (localStorage) | ✅ PUT /api/applications/:id |
| Delete application | ✅ (localStorage) | ✅ DELETE /api/applications/:id |
| Search | Client-side filter | Server-side regex query |
| Filter by status | Client-side | Server-side MongoDB query |
| Sort | Client-side | Server-side MongoDB sort |
| Pagination | ❌ None | ✅ Server-side + UI buttons |
| Dashboard stats | Computed from localStorage | MongoDB Aggregation Pipeline |
| Input validation | None | express-validator on every route |
| Error handling | alert() dialogs | Global error middleware + Toast UI |
| Code structure | 1 file, 639 lines | 8 modules across frontend + backend |
| Security | ❌ | JWT, bcrypt, CORS, security headers |

---

## PART 5 — SYLLABUS MAPPING

### Frontend Syllabus Coverage

| Feature in Project | Frontend Unit |
|-------------------|---------------|
| HTML document structure, semantic elements, forms | Unit I |
| Flexbox sidebar layout, CSS Grid for cards/dashboard | Unit I |
| CSS Custom Properties, Box Model, Responsive design | Unit I |
| Floating label CSS technique, animations (@keyframes) | Unit I |
| `@media` queries for mobile breakpoints | Unit I |
| Variables, scope, arrow functions, template literals | Unit II |
| Arrays, objects, basic event handling | Unit II |
| `DOMContentLoaded`, form submit events | Unit II |
| `async/await` for all API calls | Unit III |
| Promises — `Promise.all` in backend parallel queries | Unit III |
| ES6 modules (`import`/`export` in api.js, ui.js, app.js) | Unit III |
| Closures — debounced search timeout in `setupEventListeners` | Unit III |
| DOM traversal — `querySelectorAll`, `getElementById` | Unit IV |
| Dynamic content — `innerHTML`, `classList`, `textContent` | Unit IV |
| Event delegation — one listener on `tableBody` for all rows | Unit IV |
| Module structure — 3 separate JS files with clear roles | Unit IV |
| TypeScript-ready: JSDoc-style comments for type hints | Unit V/VI |

### Backend Syllabus Coverage

| Feature in Project | Backend Unit |
|-------------------|--------------|
| Node.js project init with `npm init`, `package.json` | Unit I |
| npm packages: express, mongoose, bcryptjs, jsonwebtoken, dotenv | Unit I |
| `async/await`, Promises throughout all controllers | Unit I |
| fs-style config loading via `dotenv` | Unit I |
| Express setup, `app.use()`, `app.listen()` | Unit II |
| GET, POST, PUT, DELETE REST routes | Unit II |
| `express.Router` — separate route files | Unit II |
| `express-validator` — input validation on all routes | Unit II |
| Error handling middleware with status codes | Unit II |
| Custom middleware: `protect` (JWT auth), `errorHandler`, `notFound` | Unit III |
| `cookie-parser` middleware | Unit III |
| JWT — `jwt.sign()`, `jwt.verify()`, Bearer token pattern | Unit III |
| Security headers set manually | Unit III |
| MongoDB — collections for Users and Applications | Unit IV |
| Mongoose — Schema definition, Models | Unit IV |
| CRUD operations — `find`, `create`, `findByIdAndUpdate`, `deleteOne` | Unit IV |
| Mongoose pre-save hook for password hashing | Unit IV |
| Pagination — `skip()`, `limit()`, `countDocuments()` | Unit IV |
| Aggregation Pipeline — `$match`, `$group`, `$sum` for stats | Unit IV |

---

## PART 6 — SETUP GUIDE

### Prerequisites
- Node.js v18+ installed
- MongoDB installed locally OR MongoDB Atlas account (free)
- VS Code with Live Server extension

---

### Step 1 — Clone / Open the Project

```bash
# If using Git:
git clone <your-repo-url>
cd job-tracker

# Or just open the folder you extracted
```

---

### Step 2 — Set Up the Backend

```bash
# Navigate to backend folder
cd backend

# Install all npm packages
npm install

# Create your .env file from the template
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobtracker
JWT_SECRET=anylongrandostring123changeme
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> **MongoDB Atlas (cloud):** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://username:password@cluster.mongodb.net/jobtracker`

---

### Step 3 — Run the Backend

```bash
# Development mode (auto-restarts on file change)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
🚀 Server running in development mode on port 5000
📡 API available at: http://localhost:5000/api
```

Test it: Open browser → `http://localhost:5000/api/health`
You should see: `{ "success": true, "message": "Job Tracker API is running!" }`

---

### Step 4 — Run the Frontend

1. Open VS Code
2. Open the `frontend/` folder
3. Right-click `index.html` → **Open with Live Server**
4. Browser opens at `http://127.0.0.1:5500`

> **Important:** The frontend uses `type="module"` scripts. You MUST open via Live Server (or any HTTP server). Opening `index.html` directly as a file (`file://`) will block ES6 modules.

---

### Step 5 — First Use

1. Click **Sign Up** and create an account
2. You'll be logged in automatically with a JWT token
3. Click **New Application** to add your first job
4. Navigate to **Applications** to see the table with search + filter
5. Dashboard auto-updates with your stats

---

### API Endpoints Reference

```
POST   /api/auth/register           Register new user
POST   /api/auth/login              Login, returns JWT
GET    /api/auth/me                 Get current user (requires JWT)

GET    /api/applications            Get all applications (+ ?search=&status=&sort=&page=&limit=)
POST   /api/applications            Create new application
GET    /api/applications/stats      Dashboard stats (aggregated)
GET    /api/applications/:id        Get single application
PUT    /api/applications/:id        Update application
DELETE /api/applications/:id        Delete application
```

---

## PART 7 — 5-MINUTE VIDEO DEMO SCRIPT

---

### [0:00 – 0:20] — Introduction

**SAY:**
"Hi! This is my Job Application Tracker — a full-stack web application
built with HTML, CSS, JavaScript on the frontend, and Node.js, Express,
and MongoDB on the backend. Let me walk you through the key features."

**DO:**
- Show the project folder structure in VS Code (both frontend/ and backend/)
- Point to the server.js, models, routes, controllers folders

---

### [0:20 – 0:50] — Backend is Running

**SAY:**
"First, let me show you the backend. I'm running a Node.js Express
server on port 5000. It connects to MongoDB using Mongoose."

**DO:**
- Show the terminal with `npm run dev` output
- Open browser → `http://localhost:5000/api/health`
- Show the JSON response: `{ "success": true, "message": "Job Tracker API is running!" }`
- Briefly show `server.js` — point to middleware, routes, error handler

---

### [0:50 – 1:30] — Sign Up & Authentication

**SAY:**
"The app has real authentication using JWT — JSON Web Tokens.
When I sign up, the password is hashed using bcrypt before saving to MongoDB.
The server returns a token which the frontend stores and attaches to every request."

**DO:**
- Open `http://127.0.0.1:5500` in browser
- Click **Sign Up** tab
- Type: Name = `Demo User`, Email = `demo@example.com`, Password = `demo123`
- Click **Sign Up**
- Show the success toast notification appear bottom-right
- Open browser DevTools → Application → Local Storage → show `jt_token` stored
- Show `authController.js` briefly — point to `bcrypt.hash()` and `jwt.sign()`

---

### [1:30 – 2:10] — Add a Job Application

**SAY:**
"Once logged in, I can add a job application. This makes a POST request
to our REST API, which validates the data using express-validator and
saves it to MongoDB."

**DO:**
- Click **New Application** button (top right)
- Modal opens — fill in:
  - Company: `Google`
  - Role: `Frontend Engineer`
  - Date: today's date
  - Status: `Applied`
  - Notes: `Applied via LinkedIn referral`
- Click **Save Application**
- Show the success toast: "Application added successfully!"
- Navigate to **Applications** tab
- Show the new row in the table with the company avatar letter
- Open Compass / Atlas → show the document saved in MongoDB

---

### [2:10 – 2:45] — Search, Filter, and Sort

**SAY:**
"All search, filtering, and sorting happens on the server side.
The frontend sends query parameters to the API, and MongoDB handles
the actual filtering using regex and sort operators."

**DO:**
- Add 2 more applications quickly (Stripe - Applied, OpenAI - Offer)
- In the search box, type: `google` → show table filters instantly (debounced)
- Clear search
- Change status filter to `Offer` → only OpenAI row shows
- Change sort to `By Company` → rows reorder alphabetically
- Show `applicationController.js` → point to the filter object and `$regex` query

---

### [2:45 – 3:15] — Edit and Delete

**SAY:**
"I can update any application's status. This sends a PUT request to the API.
Deleting sends a DELETE request — and the server checks that only the owner
can delete their own applications."

**DO:**
- Click the pencil icon on Google row
- Change Status from `Applied` to `Interview`
- Click **Save Application**
- Show badge updates from blue "Applied" to yellow "Interview"
- Click the trash icon on another row
- Confirm the dialog
- Show row disappears and toast confirms deletion

---

### [3:15 – 3:45] — Dashboard Stats

**SAY:**
"The Dashboard pulls live stats from the backend using MongoDB's
aggregation pipeline — it groups applications by status and counts them."

**DO:**
- Click **Dashboard** in sidebar
- Show the 5 summary cards updating with real numbers
- Point to the doughnut chart updating
- Show `applicationController.js` → `getStats()` function → point to the
  `Application.aggregate([{ $match }, { $group }])` code

---

### [3:45 – 4:15] — REST API in Action (Postman / Browser)

**SAY:**
"Let me show you the REST API working directly. You can test it with
any API client — the frontend is just one consumer of this API."

**DO:**
- Open browser or Postman
- GET `http://localhost:5000/api/applications` without a token → show 401 Unauthorized
- Explain: "The protect middleware blocks unauthorized access"
- Copy the token from localStorage
- Add Authorization: `Bearer <token>` header
- GET again → show the JSON array of applications
- Show the `?search=google&status=All` query param → filtered JSON response

---

### [4:15 – 4:45] — Code Quality Highlights

**SAY:**
"The code is organized into clear modules. The frontend has three files
with distinct responsibilities: api.js handles all HTTP requests, ui.js
handles all DOM updates, and app.js is the main controller that connects them."

**DO:**
- Show `frontend/js/` folder — 3 files
- Open `api.js` — show the `request()` helper function with Bearer token
- Open `ui.js` — show `renderTable()` using `map()` and template literals
- Open `app.js` — show event delegation on `tableBody` for edit/delete
- Show `backend/` folder structure — models, controllers, routes, middleware

---

### [4:45 – 5:00] — Closing

**SAY:**
"So to summarize — this is a full-stack application with:
- A Node.js Express REST API with JWT authentication
- MongoDB database with Mongoose for schema validation
- Proper middleware for auth and error handling
- A clean modular frontend with real fetch API calls and ES6 modules
- Features like server-side search, filter, sort, and pagination"

**DO:**
- Show the folder structure one final time
- Show the app running with a few applications visible
- Point to the GitHub repo (if applicable)

---

## PART 8 — VIVA QUESTIONS & ANSWERS

### Frontend

**Q1. What is the difference between `localStorage` and a backend database?**
> `localStorage` only stores data in the user's browser on that specific device. If they switch browsers, clear data, or use another device — data is lost. A backend database stores data persistently on a server, accessible from anywhere, and supports multi-user data isolation.

**Q2. What is an ES6 module? Why did you use `type="module"` in the script tag?**
> ES6 modules allow JavaScript files to use `import` and `export` to share code between files. `type="module"` tells the browser to treat the script as a module, enabling `import` statements. Without it, the browser treats the file as a regular script and `import` statements throw errors.

**Q3. What is event delegation and where did you use it?**
> Event delegation is attaching ONE event listener to a parent element instead of individual listeners on each child. In this project, one listener on `#tableBody` handles clicks on ALL edit and delete buttons inside table rows. We identify which button was clicked using `e.target.closest('[data-action]')`.

**Q4. What is the difference between `async/await` and `.then()`?**
> Both handle Promises. `async/await` is syntactic sugar that makes asynchronous code read like synchronous code, making it easier to understand. `.then()` chains are the older approach and can become deeply nested ("callback hell"). We use `async/await` throughout this project.

**Q5. What is a closure? Give an example from this project.**
> A closure is a function that retains access to variables from its outer scope even after that outer function has finished. The debounced search is an example: the `searchTimeout` variable lives in `setupEventListeners`, but the inner `setTimeout` callback still has access to it every time the input event fires.

---

### Backend

**Q6. What is middleware in Express and what middleware did you use?**
> Middleware are functions that run between receiving a request and sending a response. They have access to `req`, `res`, and `next`. In this project: `express.json()` (parse request body), `cors()` (allow frontend requests), `cookieParser()` (read cookies), `protect` (verify JWT), `errorHandler` (catch all errors).

**Q7. How does JWT authentication work?**
> 1. User logs in with email + password. 2. Server verifies credentials, signs a JWT with a secret key and user ID as payload. 3. Token sent to client — stored in localStorage. 4. Every subsequent request attaches the token as `Authorization: Bearer <token>`. 5. The `protect` middleware verifies the token using the same secret key and attaches `req.user`.

**Q8. Why do we hash passwords with bcrypt instead of storing them plain?**
> If the database is ever compromised, plain passwords expose all user accounts. bcrypt hashes are one-way — you can't reverse a hash to get the password. bcrypt also adds a "salt" (random data) so the same password always produces a different hash, preventing rainbow table attacks.

**Q9. What is the difference between `findByIdAndUpdate` with `{new: true}` vs without?**
> Without `{new: true}`, Mongoose returns the document as it was BEFORE the update. With `{new: true}`, it returns the document AFTER the update is applied. We use `{new: true}` so we can send the updated data back to the frontend.

**Q10. What is the MongoDB Aggregation Pipeline? Where did you use it?**
> The Aggregation Pipeline processes documents through a series of stages. In `getStats()`, we use: `$match` (filter by current user's ID) → `$group` (group all documents by their `status` field and count them with `$sum: 1`). This gives us `{ Applied: 3, Interview: 1, Offer: 0, Rejected: 2 }` for the dashboard.

**Q11. What is `express-validator` and why is server-side validation important?**
> `express-validator` is middleware that validates and sanitizes request data before it reaches the controller. Server-side validation is critical because client-side validation can be bypassed by anyone using Postman or curl directly against your API. Never trust data from the client.

**Q12. What does `select: false` on the password field in the Mongoose schema do?**
> It means the `password` field is excluded from query results by default. When you do `User.findOne()`, the password hash won't be returned unless you explicitly add `.select('+password')`. This prevents accidentally leaking password hashes in API responses.

**Q13. What is CORS and why did you add it?**
> CORS (Cross-Origin Resource Sharing) is a browser security policy that blocks JavaScript on one domain from making requests to a different domain. Our frontend runs on `http://127.0.0.1:5500` and our backend on `http://localhost:5000` — different origins. We configure the `cors()` middleware to explicitly allow our frontend's origin.

**Q14. What is the difference between `router.route('/')` and defining routes separately?**
> `router.route('/')` chains multiple HTTP methods (GET, POST) on the same path, reducing repetition. Instead of writing `router.get('/', ...)` and `router.post('/', ...)` separately, you write `router.route('/').get(...).post(...)`. It's cleaner and makes it obvious which methods are available on each endpoint.
