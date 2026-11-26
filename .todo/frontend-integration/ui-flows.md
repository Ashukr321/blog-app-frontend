# UI Flows

Recipes per screen, using the `api()` client from [README.md](./README.md#8-drop-in-client-fetch). Endpoint details are in [endpoints.md](./endpoints.md).

## App start

```js
let me = null;
if (auth.token) {
	try {
		me = (await api("/me/profile")).data;
	} catch {
		/* 401 already cleared the token: continue as guest */
	}
}
```

Keep `me` in your global state (context/store). `me.userId` decides which edit/delete buttons to show.

## Register / Login

```js
async function login(email, password) {
	const { data } = await api("/auth/login", { method: "POST", body: { email, password } });
	auth.set(data.accessToken);
	return data.user; // { id, email, displayName, avatarUrl }
}
```

- Show `400` messages under the form, `401` as "Invalid email or password", `409` as "Email already registered".
- `429`: disable the button and say "try again in 15 minutes".
- Optional: set a timer for `expiresIn` seconds to log out proactively (there's no refresh token).

Logout is client-only: `auth.clear()` and reset state.

## Login-gated actions

Like, comment, share and "write post" need login. For guests, open the login modal instead of calling the API. Also listen for `auth:logout` (fired by the client on any `401`) to open it when a token expires mid-session.

## Feed (`/` page)

```js
const [posts, setPosts] = useState([]);
const [cursor, setCursor] = useState(undefined); // undefined = first page, null = no more

async function loadMore() {
	if (cursor === null) return;
	const { data, meta } = await api("/posts", { query: { limit: 10, cursor } });
	setPosts(p => [...p, ...data]);
	setCursor(meta.nextCursor); // null → hide "Load more"
}
```

Card shows: `photoUrl`, `title`, `excerpt`, `author`, `counts`, `publishedAt`. Link to `/blog/{slug}`.
Author page uses the same pattern with `/profiles/{userId}/posts`, plus `/profiles/{userId}` for the header.

## Post page (`/blog/:slug`)

```js
const { data: post } = await api(`/posts/by-slug/${encodeURIComponent(slug)}`);
```

- Fetch once per page view: this call increments `views`.
- `404` → "Post not found" page.
- Owner (`post.author.id === me?.userId`) sees Edit / Delete.
- If `post.status === "draft"`, show a "Draft — only you can see this" banner.

### Like / dislike buttons

```js
async function toggle(type) {
	const res =
		post.myReaction === type
			? await api(`/posts/${post.id}/reaction`, { method: "DELETE" })
			: await api(`/posts/${post.id}/reaction`, { method: "PUT", body: { type } });
	const { myReaction, likeCount, dislikeCount } = res.data;
	setPost(p => ({
		...p,
		myReaction,
		counts: { ...p.counts, likes: likeCount, dislikes: dislikeCount },
	}));
}
```

The server is idempotent, so a double click won't double count. Optimistic updates are fine; replace them with the response numbers.

### Share

```js
async function share(platform) {
	const { data } = await api(`/posts/${post.id}/shares`, { method: "POST", body: { platform } });
	const url = encodeURIComponent(data.shareUrl);
	const links = {
		whatsapp: `https://wa.me/?text=${url}`,
		x: `https://twitter.com/intent/tweet?url=${url}`,
		facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
		linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
	};
	if (platform === "link") await navigator.clipboard.writeText(data.shareUrl);
	else window.open(links[platform], "_blank", "noopener");
	setPost(p => ({ ...p, counts: { ...p.counts, shares: data.shareCount } }));
}
```

Sharing requires login. For guests you can still open the share link (build it from your own site URL + slug) without calling the API; it just won't be counted.

## Comments

Load all pages (or page with "Load more"), then build the tree client-side:

```js
function buildTree(comments) {
	const byId = new Map(comments.map(c => [c.id, { ...c, replies: [] }]));
	const roots = [];
	for (const c of byId.values()) {
		const parent = c.parentId && byId.get(c.parentId);
		(parent ? parent.replies : roots).push(c);
	}
	return roots; // oldest first, as returned
}
```

If you paginate, a reply can arrive before its parent's page is loaded only when the parent is older, which can't happen here (oldest first), so the tree is safe to build incrementally.

- Add: `POST /posts/{postId}/comments` with `{ body }` or `{ body, parentId }`; append the returned comment and bump `counts.comments`.
- Edit: `PATCH /comments/{id}` with `{ body }`; replace in place.
- Delete: `DELETE /comments/{id}` (204); mark `isDeleted: true, body: null` locally and decrement `counts.comments`.
- Render deleted ones as "[deleted]" with no actions; hide them if they have no replies.

## Post editor

1. Upload the cover image to Cloudinary → get `secure_url`.
2. Create:

    ```js
    const { data } = await api("/posts", {
    	method: "POST",
    	body: { title, content, excerpt, photoUrl, status: publish ? "published" : "draft" },
    });
    navigate(`/blog/${data.slug}`);
    ```

3. Edit: `PATCH /posts/{id}` with only the changed fields. The slug stays the same.
4. Publish a draft: `PATCH /posts/{id}` with `{ "status": "published" }`.
5. Delete: confirm dialog → `DELETE /posts/{id}` → go to the feed.

Map `400` messages (e.g. `"title" is required`) to the form; `403` means the user isn't the author.

## Settings / profile edit

```js
const { data } = await api("/me/profile", {
	method: "PATCH",
	body: { displayName, bio, avatarUrl }, // send only what changed; null clears avatar/bio
});
setMe(data);
```

## Known gaps (backend)

- No "my drafts" list endpoint; drafts are only reachable by slug right after creation.
- No refresh token; users re-login every hour.
- No server-side image upload; use Cloudinary from the client.
- No search, tags or categories yet.
