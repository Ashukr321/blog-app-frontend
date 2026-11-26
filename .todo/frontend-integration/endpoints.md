# Endpoint Reference

Base: `/v1`. 🔓 = public (token optional), 🔒 = `Authorization: Bearer <token>` required, 👤 = owner only.
Shapes for errors, pagination and auth are in [README.md](./README.md).

| #   | Method   | Path                       | Auth | Success |
| --- | -------- | -------------------------- | ---- | ------- |
| 1   | `POST`   | `/auth/register`           | 🔓   | 201     |
| 2   | `POST`   | `/auth/login`              | 🔓   | 200     |
| 3   | `GET`    | `/me/profile`              | 🔒   | 200     |
| 4   | `PATCH`  | `/me/profile`              | 🔒   | 200     |
| 5   | `GET`    | `/profiles/{userId}`       | 🔓   | 200     |
| 6   | `GET`    | `/profiles/{userId}/posts` | 🔓   | 200     |
| 7   | `GET`    | `/posts`                   | 🔓   | 200     |
| 8   | `GET`    | `/posts/by-slug/{slug}`    | 🔓   | 200     |
| 9   | `POST`   | `/posts`                   | 🔒   | 201     |
| 10  | `PATCH`  | `/posts/{postId}`          | 🔒👤 | 200     |
| 11  | `DELETE` | `/posts/{postId}`          | 🔒👤 | 204     |
| 12  | `PUT`    | `/posts/{postId}/reaction` | 🔒   | 200     |
| 13  | `DELETE` | `/posts/{postId}/reaction` | 🔒   | 200     |
| 14  | `GET`    | `/posts/{postId}/comments` | 🔓   | 200     |
| 15  | `POST`   | `/posts/{postId}/comments` | 🔒   | 201     |
| 16  | `PATCH`  | `/comments/{commentId}`    | 🔒👤 | 200     |
| 17  | `DELETE` | `/comments/{commentId}`    | 🔒👤 | 204     |
| 18  | `POST`   | `/posts/{postId}/shares`   | 🔒   | 201     |

---

## Shared objects

### `Post` (list item)

```json
{
	"id": "12",
	"title": "My first post",
	"slug": "my-first-post",
	"excerpt": "Short teaser…",
	"photoUrl": "https://res.cloudinary.com/…/cover.jpg",
	"author": { "id": "3", "displayName": "Asha", "avatarUrl": null },
	"counts": { "likes": 4, "dislikes": 0, "comments": 2, "shares": 1, "views": 57 },
	"myReaction": "like",
	"publishedAt": "2026-11-26T10:30:00.000Z"
}
```

`myReaction` is `"like" | "dislike" | null`; always `null` for guests.

### `PostDetail` = `Post` plus

```json
{
	"content": "Full body text / markdown / HTML (stored as sent)",
	"status": "published",
	"createdAt": "2026-11-26T10:00:00.000Z",
	"updatedAt": "2026-11-26T10:30:00.000Z"
}
```

`status` is `"draft" | "published"`. Drafts have `publishedAt: null`.

### `Profile`

```json
{
	"userId": "3",
	"email": "asha@example.com",
	"displayName": "Asha",
	"avatarUrl": null,
	"bio": "Writes about tea.",
	"joinedAt": "2026-11-01T08:00:00.000Z"
}
```

`email` appears **only** on `/me/profile`. Public profiles never include it.

### `Comment`

```json
{
	"id": "88",
	"body": "Great read!",
	"parentId": null,
	"author": { "id": "5", "displayName": "Ravi", "avatarUrl": null },
	"createdAt": "2026-11-26T11:00:00.000Z",
	"updatedAt": "2026-11-26T11:00:00.000Z",
	"isDeleted": false
}
```

Deleted comments stay in the list with `isDeleted: true` and `body: null` so replies keep their parent. Show "[deleted]".

---

## Auth

### 1. `POST /auth/register` 🔓

```json
{ "email": "asha@example.com", "password": "secret123", "displayName": "Asha" }
```

| Field         | Rules                                |
| ------------- | ------------------------------------ |
| `email`       | valid email, ≤255, stored lowercased |
| `password`    | 8–72 chars                           |
| `displayName` | 1–80 chars, trimmed                  |

**201**

```json
{
	"data": {
		"user": {
			"id": "3",
			"email": "asha@example.com",
			"displayName": "Asha",
			"avatarUrl": null
		},
		"accessToken": "eyJhbGciOi…",
		"expiresIn": 3600
	}
}
```

Errors: `400` validation, `409 Email already registered`, `429` (5 failed tries / 15 min).

### 2. `POST /auth/login` 🔓

```json
{ "email": "asha@example.com", "password": "secret123" }
```

**200** same body as register. Errors: `400`, `401 Invalid email or password` (same message for unknown email and wrong password), `429`.

---

## My profile

### 3. `GET /me/profile` 🔒

**200** `{ "data": Profile }` (with `email`). Use this on app start to check the stored token is still valid.

### 4. `PATCH /me/profile` 🔒

Send at least one field:

```json
{ "displayName": "Asha K", "avatarUrl": "https://res.cloudinary.com/…/a.jpg", "bio": "Hi" }
```

| Field         | Rules                                    |
| ------------- | ---------------------------------------- |
| `displayName` | 1–80 chars                               |
| `avatarUrl`   | `https://` URL ≤500, or `null` to remove |
| `bio`         | ≤300 chars, `null` or `""` to clear      |

Email and password can't be changed here. **200** `{ "data": Profile }`. Errors: `400` (empty body or bad field), `401`.

---

## Public profiles

### 5. `GET /profiles/{userId}` 🔓

**200** `{ "data": Profile }` (no `email`). `404 User not found`.

### 6. `GET /profiles/{userId}/posts?limit=&cursor=` 🔓

That author's **published** posts, newest first. **200** `{ "data": Post[], "meta": { "limit", "nextCursor" } }`. `404` if the user doesn't exist.

Note: an author's own drafts are not listed anywhere yet; only reachable by slug.

---

## Posts

### 7. `GET /posts?limit=&cursor=` 🔓

Feed of published posts, newest first. **200** `{ "data": Post[], "meta": {...} }`.

### 8. `GET /posts/by-slug/{slug}` 🔓

**200** `{ "data": PostDetail }`. Each call adds 1 to `views`, so don't refetch on every re-render.
Drafts return `404` to everyone except their author (send the token to preview your draft).

### 9. `POST /posts` 🔒

```json
{
	"title": "My first post",
	"content": "Full text",
	"excerpt": "Teaser",
	"photoUrl": "https://res.cloudinary.com/…/cover.jpg",
	"status": "published"
}
```

| Field      | Rules                                |
| ---------- | ------------------------------------ |
| `title`    | required, 1–255                      |
| `content`  | required, non-empty                  |
| `excerpt`  | ≤500, optional, `null`/`""` allowed  |
| `photoUrl` | `https://` ≤500 or `null`, optional  |
| `status`   | `"draft"` (default) or `"published"` |

The slug is generated from the title (`my-first-post`, then `-2`, `-3`… if taken). Use the returned `slug` for the post URL. **201** `{ "data": PostDetail }`. Errors: `400`, `401`, `409` (rare slug race, retry).

### 10. `PATCH /posts/{postId}` 🔒👤

Any subset of the create fields (at least one). The **slug never changes**, even if the title does, so shared links keep working. Publishing a draft sets `publishedAt` the first time only.
**200** `{ "data": PostDetail }`. Errors: `400`, `401`, `403` (not yours), `404`.

### 11. `DELETE /posts/{postId}` 🔒👤

**204**. Removes its reactions, comments and shares too. Errors: `401`, `403`, `404`.

---

## Reactions (like / dislike)

One reaction per user per post.

### 12. `PUT /posts/{postId}/reaction` 🔒

```json
{ "type": "like" }
```

`type`: `"like"` or `"dislike"`. Same type again = no change (safe on double click). Switching like → dislike moves the count.

**200**

```json
{ "data": { "myReaction": "like", "likeCount": 5, "dislikeCount": 0 } }
```

Errors: `400`, `401`, `404` (missing or unpublished post).

### 13. `DELETE /posts/{postId}/reaction` 🔒

Removes my reaction (no-op if none). **200** same shape with `myReaction: null`. Note: **200 with a body**, not 204.

---

## Comments

### 14. `GET /posts/{postId}/comments?limit=&cursor=` 🔓

All comments (top-level and replies) in one flat list, **oldest first**. Build the tree on the client with `parentId`.
**200** `{ "data": Comment[], "meta": {...} }`. `404` if the post is missing or a draft.

### 15. `POST /posts/{postId}/comments` 🔒

```json
{ "body": "Great read!", "parentId": "88" }
```

| Field      | Rules                                                            |
| ---------- | ---------------------------------------------------------------- |
| `body`     | 1–2000 chars, trimmed                                            |
| `parentId` | optional; must be a live comment on the **same** post, or `null` |

**201** `{ "data": Comment }`. Errors: `400` (incl. bad `parentId`), `401`, `404`.

### 16. `PATCH /comments/{commentId}` 🔒👤

```json
{ "body": "Edited text" }
```

**200** `{ "data": Comment }`. Show "edited" when `updatedAt !== createdAt`. Errors: `400`, `401`, `403`, `404` (also for already-deleted).

### 17. `DELETE /comments/{commentId}` 🔒👤

Soft delete. **204**. Post's comment count goes down by 1. Errors: `401`, `403`, `404`.

---

## Shares

### 18. `POST /posts/{postId}/shares` 🔒

```json
{ "platform": "whatsapp" }
```

`platform`: `whatsapp | x | facebook | linkedin | link`. Not idempotent: each call counts as a share.

**201**

```json
{ "data": { "shareCount": 3, "shareUrl": "http://localhost:9000/blog/my-first-post" } }
```

Use `shareUrl` as the link to share. Errors: `400`, `401`, `404`.
