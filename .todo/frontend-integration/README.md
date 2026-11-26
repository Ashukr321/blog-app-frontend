# Frontend Integration Guide

Everything a frontend (web or mobile) needs to talk to the blog API.

| File                           | What's in it                                          |
| ------------------------------ | ----------------------------------------------------- |
| [README.md](./README.md)       | Setup, auth, errors, pagination, a ready `api` client |
| [endpoints.md](./endpoints.md) | All 18 endpoints: request, response, errors           |
| [ui-flows.md](./ui-flows.md)   | Screen-by-screen recipes (feed, post page, editor…)   |

The machine-readable contract is [`docs/api/openapi.json`](../api/openapi.json). Swagger UI runs at `http://localhost:9000/v1/docs` (not in production).

## 1. Base URL

```
http://localhost:9000/v1        # local (PORT in .env.development)
```

Every path in these docs is relative to `/v1`, e.g. `GET /posts` → `GET http://localhost:9000/v1/posts`.

CORS is open (`cors()` with defaults), so any origin can call the API. JSON only: send `Content-Type: application/json`.

## 2. Auth

1. `POST /auth/register` or `POST /auth/login` returns `data.accessToken` (a JWT) and `data.expiresIn` (`3600` seconds).
2. Send it on every request: `Authorization: Bearer <accessToken>`.
3. There is **no refresh token**. After 1 hour the token expires; the next request with it returns `401` and the user must log in again.

How the server treats the header:

| Header sent             | Public endpoint (🔓)               | Login-required endpoint (🔒) |
| ----------------------- | ---------------------------------- | ---------------------------- |
| none                    | works as guest                     | `401 Login required`         |
| valid token             | works, plus `myReaction` filled in | works                        |
| expired / invalid token | **`401`** (even on public pages)   | `401`                        |

The last row matters: a stale token breaks public pages too. On any `401`, drop the stored token and retry/continue as guest (the client below does this).

Store the token where your app keeps secrets (memory + `localStorage`, or secure storage on mobile). Never put it in a URL.

## 3. Response shapes

Success (single resource):

```json
{ "data": { ... } }
```

Success (list):

```json
{ "data": [ ... ], "meta": { "limit": 20, "nextCursor": "eyJ..." } }
```

`204 No Content` (deletes) has no body. `201 Created` on register, create post, add comment, share.

Error (from the API):

```json
{ "status": "failure", "statusCode": 400, "message": "\"title\" is required" }
```

Error (rate limit, `429`) has a different shape:

```json
{ "success": false, "message": "Too many requests, please slow down." }
```

So always read `message`, and use the HTTP status, not `statusCode`, for logic.

| Status | Meaning for the UI                                              |
| ------ | --------------------------------------------------------------- |
| 400    | Validation failed. Show `message` next to the form.             |
| 401    | Not logged in / token expired. Clear token, show login.         |
| 403    | Not your post/comment. Hide edit/delete buttons for non-owners. |
| 404    | Not found (also: drafts of other users, deleted comments).      |
| 409    | Email already registered / slug race on create (just retry).    |
| 429    | Rate limited. Back off; show "slow down".                       |

## 4. IDs, dates, nulls

- All IDs are **strings** (`"42"`). Send them back as-is in URLs. `parentId` in a request body may be a number or numeric string.
- Dates are ISO strings (`"2026-11-26T10:30:00.000Z"`). `publishedAt` is `null` for drafts.
- Nullable fields: `photoUrl`, `excerpt`, `avatarUrl`, `bio`, `myReaction`, `parentId`, comment `body` (when deleted).

## 5. Pagination (cursor)

List endpoints (`GET /posts`, `GET /profiles/{userId}/posts`, `GET /posts/{postId}/comments`) take:

| Query    | Default | Notes                                     |
| -------- | ------- | ----------------------------------------- |
| `limit`  | 20      | 1–50                                      |
| `cursor` | —       | the previous response's `meta.nextCursor` |

`meta.nextCursor` is `null` on the last page. Treat the cursor as opaque: don't parse or build it. A tampered cursor returns `400`.

Posts come newest first; comments oldest first. Good fit for "Load more" / infinite scroll, not numbered pages.

## 6. Rate limits (per IP)

| Limiter | Applies to                                    | Limit        |
| ------- | --------------------------------------------- | ------------ |
| global  | every request                                 | 100 / 15 min |
| auth    | `/auth/register`, `/auth/login` (failed only) | 5 / 15 min   |
| api     | all other blog endpoints                      | 30 / min     |

Avoid firing a request per keystroke or per scroll pixel. Debounce search/like buttons.

## 7. Images (Cloudinary)

The API does **not** accept file uploads. Upload the image from the client straight to Cloudinary (unsigned upload preset), then send the returned `secure_url` as `photoUrl` (posts) or `avatarUrl` (profile). Only `https://` URLs up to 500 chars are accepted; send `null` to remove.

## 8. Drop-in client (fetch)

```js
// api.js
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:9000/v1";
const TOKEN_KEY = "blog.accessToken";

export const auth = {
	get token() {
		return localStorage.getItem(TOKEN_KEY);
	},
	set(token) {
		localStorage.setItem(TOKEN_KEY, token);
	},
	clear() {
		localStorage.removeItem(TOKEN_KEY);
	},
};

export class ApiError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

export async function api(path, { method = "GET", body, query } = {}) {
	const url = new URL(BASE_URL + path);
	Object.entries(query ?? {}).forEach(([k, v]) => v != null && url.searchParams.set(k, v));

	const headers = { "Content-Type": "application/json" };
	if (auth.token) headers.Authorization = `Bearer ${auth.token}`;

	const res = await fetch(url, { method, headers, body: body && JSON.stringify(body) });

	if (res.status === 204) return null;
	const json = await res.json().catch(() => ({}));

	if (!res.ok) {
		if (res.status === 401) {
			auth.clear();
			window.dispatchEvent(new Event("auth:logout")); // let the app show the login modal
		}
		throw new ApiError(res.status, json.message ?? "Something went wrong");
	}
	return json; // { data } or { data, meta }
}
```

Usage:

```js
const { data, meta } = await api("/posts", { query: { limit: 10 } });
await api(`/posts/${id}/reaction`, { method: "PUT", body: { type: "like" } });
```

Axios users: same idea with a request interceptor for the header and a response interceptor for `401`.

## 9. Quick checklist

- [ ] `BASE_URL` points to `/v1`
- [ ] Token saved after register/login, sent as `Bearer`
- [ ] `401` anywhere → clear token, show login
- [ ] Lists use `nextCursor`, stop at `null`
- [ ] IDs handled as strings
- [ ] Images uploaded to Cloudinary first, URL sent to API
- [ ] Edit/delete shown only when `author.id === me.userId`
