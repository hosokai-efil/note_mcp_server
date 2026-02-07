/**
 * note.com unofficial API client
 *
 * Note: These are unofficial endpoints and may change without notice.
 */

const BASE_URL = "https://note.com";

// Type definitions for note.com API responses

export interface UserProfile {
  id: number;
  urlname: string;
  nickname: string;
  noteCount: number;
  followingCount: number;
  followerCount: number;
  profile: string | null;
  profileImagePath: string;
  twitterNickname: string | null;
  facebookNickname: string | null;
  instagramNickname: string | null;
  youtubeNickname: string | null;
  likeAppealText: string | null;
  createdAt: string;
}

interface UserProfileResponse {
  data: UserProfile;
}

export interface ArticleSummary {
  id: number;
  key: string;
  type: string;
  name: string;
  body: string | null;
  status: string;
  publishAt: string | null;
  likeCount: number;
  commentCount: number;
  user: {
    id: number;
    urlname: string;
    nickname: string;
    profileImagePath: string;
  };
  eyecatch: string | null;
  isPremium: boolean;
  isMembershipConnected: boolean;
}

interface ArticleListResponse {
  data: {
    contents: ArticleSummary[];
    isLastPage: boolean;
    totalCount: number;
  };
}

export interface ArticleDetail {
  id: number;
  key: string;
  type: string;
  name: string;
  body: string;
  status: string;
  publish_at: string | null;
  like_count: number;
  comment_count: number;
  user: {
    id: number;
    urlname: string;
    nickname: string;
    profile_image_path: string;
    profile: string | null;
  };
  eyecatch: string | null;
  price: number;
  can_read: boolean;
  note_url: string;
  hashtag_notes: { hashtag: { name: string } }[];
}

interface ArticleDetailResponse {
  data: ArticleDetail;
}

// Comment types for v3 note_comments API

interface RichTextNode {
  type: string;
  value?: string;
  children?: RichTextNode[];
  tag_name?: string;
}

interface NoteCommentUser {
  key: string;
  urlname: string;
  nickname: string;
  profile_image_url: string;
}

interface NoteComment {
  key: string;
  comment: RichTextNode;
  like_count: number;
  reply_count: number;
  is_edited: boolean;
  created_at: string;
  user: NoteCommentUser;
}

interface NoteCommentsResponse {
  data: NoteComment[];
  total_count: number;
  current_page: number;
  next_page: number | null;
}

export interface FormattedComment {
  key: string;
  body: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  createdAt: string;
  author: {
    username: string;
    nickname: string;
  };
}

export interface FormattedCommentList {
  noteKey: string;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  comments: FormattedComment[];
}

function extractTextFromRichText(node: RichTextNode): string {
  if (node.type === "text" && node.value) {
    return node.value;
  }
  if (node.children) {
    return node.children.map(extractTextFromRichText).join("");
  }
  return "";
}

// Draft creation types for v1 API

interface CreateDraftResponse {
  data?: {
    id: number;
    key: string;
    name: string;
    status: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface FormattedDraftResult {
  success: boolean;
  noteKey: string;
  noteId: number;
  title: string;
  editUrl: string;
}

// Formatted response types for MCP tools

export interface FormattedUserProfile {
  username: string;
  nickname: string;
  profile: string;
  noteCount: number;
  followerCount: number;
  followingCount: number;
  profileImage: string;
  twitter: string | null;
  instagram: string | null;
  createdAt: string;
  profileUrl: string;
}

export interface FormattedArticleSummary {
  id: number;
  key: string;
  title: string;
  description: string;
  publishedAt: string;
  likeCount: number;
  commentCount: number;
  isPremium: boolean;
  eyecatch: string | null;
  url: string;
}

export interface FormattedArticleList {
  username: string;
  page: number;
  totalCount: number;
  isLastPage: boolean;
  articles: FormattedArticleSummary[];
}

export interface FormattedArticleDetail {
  id: number;
  key: string;
  title: string;
  body: string;
  publishedAt: string;
  likeCount: number;
  commentCount: number;
  isPremium: boolean;
  hashtags: string[];
  author: {
    username: string;
    nickname: string;
    profile: string;
  };
  url: string;
}

// API client functions

export async function getUserProfile(username: string): Promise<FormattedUserProfile> {
  const url = `${BASE_URL}/api/v2/creators/${encodeURIComponent(username)}`;

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; note-mcp-server/1.0)"
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User not found: ${username}`);
    }
    throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as UserProfileResponse;
  const user = json.data;

  return {
    username: user.urlname,
    nickname: user.nickname,
    profile: user.profile || "",
    noteCount: user.noteCount,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    profileImage: user.profileImagePath,
    twitter: user.twitterNickname,
    instagram: user.instagramNickname,
    createdAt: user.createdAt,
    profileUrl: `${BASE_URL}/${user.urlname}`
  };
}

export async function getUserArticles(username: string, page: number = 1): Promise<FormattedArticleList> {
  const url = `${BASE_URL}/api/v2/creators/${encodeURIComponent(username)}/contents?kind=note&page=${page}`;

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; note-mcp-server/1.0)"
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`User not found: ${username}`);
    }
    throw new Error(`Failed to fetch user articles: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as ArticleListResponse;
  const data = json.data;

  const articles: FormattedArticleSummary[] = data.contents.map((article) => ({
    id: article.id,
    key: article.key,
    title: article.name,
    description: article.body || "",
    publishedAt: article.publishAt || "",
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    isPremium: article.isPremium,
    eyecatch: article.eyecatch,
    url: `${BASE_URL}/n/${article.key}`
  }));

  return {
    username,
    page,
    totalCount: data.totalCount,
    isLastPage: data.isLastPage,
    articles
  };
}

export async function getComments(noteKey: string, page: number = 1): Promise<FormattedCommentList> {
  const url = `${BASE_URL}/api/v3/notes/${encodeURIComponent(noteKey)}/note_comments?page=${page}`;

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; note-mcp-server/1.0)"
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Article not found: ${noteKey}`);
    }
    throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as NoteCommentsResponse;

  const comments: FormattedComment[] = json.data.map((c) => ({
    key: c.key,
    body: extractTextFromRichText(c.comment),
    likeCount: c.like_count,
    replyCount: c.reply_count,
    isEdited: c.is_edited,
    createdAt: c.created_at,
    author: {
      username: c.user.urlname,
      nickname: c.user.nickname
    }
  }));

  return {
    noteKey,
    totalCount: json.total_count,
    currentPage: json.current_page,
    hasNextPage: json.next_page !== null,
    comments
  };
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function uid(): string {
  const id = generateUUID();
  return ` name="${id}" id="${id}"`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function convertInline(text: string): string {
  return escapeHtml(text)
    // bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    // italic: *text* or _text_ (not inside words)
    .replace(/(?<!\w)\*([^*]+?)\*(?!\w)/g, "<em>$1</em>")
    .replace(/(?<!\w)_([^_]+?)_(?!\w)/g, "<em>$1</em>")
    // inline code: `code`
    .replace(/`([^`]+?)`/g, "<code>$1</code>")
    // links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function textToHtml(text: string): string {
  const lines = text.split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Code block: ```
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      if (i < lines.length) i++; // skip closing ```
      html.push(`<pre${uid()}>${codeLines.join("\n")}</pre>`);
      continue;
    }

    // Heading: ## or ###
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      html.push(`<h2${uid()}>${convertInline(h2Match[1])}</h2>`);
      i++;
      continue;
    }
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      html.push(`<h3${uid()}>${convertInline(h3Match[1])}</h3>`);
      i++;
      continue;
    }

    // Blockquote: >
    if (line.trim().startsWith("> ") || line.trim() === ">") {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith("> ") || lines[i].trim() === ">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      html.push(`<blockquote${uid()}><p${uid()}>${convertInline(quoteLines.join("<br>"))}</p></blockquote>`);
      continue;
    }

    // Unordered list: - or *
    if (/^[\-\*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[\-\*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[\-\*]\s+/, ""));
        i++;
      }
      const listItems = items.map((item) => `<li><p${uid()}>${convertInline(item)}</p></li>`).join("");
      html.push(`<ul${uid()}>${listItems}</ul>`);
      continue;
    }

    // Ordered list: 1. 2. 3.
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      const listItems = items.map((item) => `<li><p${uid()}>${convertInline(item)}</p></li>`).join("");
      html.push(`<ol${uid()}>${listItems}</ol>`);
      continue;
    }

    // Horizontal rule: --- or ***
    if (/^(---|\*\*\*|___)\s*$/.test(line.trim())) {
      html.push(`<hr${uid()}>`);
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-empty lines
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].trim().startsWith("```") && !/^#{2,3}\s/.test(lines[i]) && !/^>\s?/.test(lines[i].trim()) && !/^[\-\*]\s+/.test(lines[i].trim()) && !/^\d+\.\s+/.test(lines[i].trim()) && !/^(---|\*\*\*|___)\s*$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      html.push(`<p${uid()}>${convertInline(paraLines.join("<br>"))}</p>`);
    }
  }

  return html.join("");
}

function parseApiResponse(responseText: string): Record<string, unknown> {
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 500)}`);
  }

  if (json.error) {
    const err = json.error;
    if (typeof err === "object" && err !== null && (err as Record<string, unknown>).message === "not_login") {
      throw new Error("Authentication failed: Invalid or expired session cookie. Please get a fresh '_note_session_v5' cookie from your browser.");
    }
    throw new Error(`API error: ${JSON.stringify(json.error)}`);
  }

  return json;
}

function buildAuthHeaders(sessionCookie: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "X-Requested-With": "XMLHttpRequest",
    "Origin": "https://note.com",
    "Referer": "https://note.com/notes/new",
    "Cookie": `_note_session_v5=${sessionCookie}`
  };
}

export async function createDraft(
  title: string,
  body: string,
  sessionCookie: string
): Promise<FormattedDraftResult> {
  const headers = buildAuthHeaders(sessionCookie);

  // Step 1: Create empty note to get ID
  const createRes = await fetch(`${BASE_URL}/api/v1/text_notes`, {
    method: "POST",
    headers,
    body: JSON.stringify({ name: title, template_key: null })
  });

  const createText = await createRes.text();
  if (!createRes.ok) {
    throw new Error(`Failed to create note: HTTP ${createRes.status}: ${createText}`);
  }

  const createJson = parseApiResponse(createText);
  const noteData = createJson.data as Record<string, unknown> | undefined;
  if (!noteData || !noteData.id) {
    throw new Error(`Failed to create note: no ID returned: ${createText.substring(0, 500)}`);
  }

  const noteId = noteData.id as number;
  const noteKey = noteData.key as string;

  // Step 2: Save body via draft_save
  const htmlBody = textToHtml(body);
  const bodyLength = htmlBody.replace(/<[^>]*>/g, "").length;

  const saveRes = await fetch(`${BASE_URL}/api/v1/text_notes/draft_save?id=${noteId}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: title,
      body: htmlBody,
      body_length: bodyLength,
      index: false,
      is_lead_form: false
    })
  });

  const saveText = await saveRes.text();
  if (!saveRes.ok) {
    throw new Error(`Failed to save draft body: HTTP ${saveRes.status}: ${saveText}`);
  }

  parseApiResponse(saveText);

  return {
    success: true,
    noteKey,
    noteId,
    title,
    editUrl: `${BASE_URL}/notes/${noteKey}/edit`
  };
}

export async function getArticle(noteId: string): Promise<FormattedArticleDetail> {
  const url = `${BASE_URL}/api/v3/notes/${encodeURIComponent(noteId)}`;

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; note-mcp-server/1.0)"
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Article not found: ${noteId}`);
    }
    throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as ArticleDetailResponse;
  const article = json.data;

  return {
    id: article.id,
    key: article.key,
    title: article.name,
    body: article.body,
    publishedAt: article.publish_at || "",
    likeCount: article.like_count,
    commentCount: article.comment_count,
    isPremium: article.price > 0,
    hashtags: (article.hashtag_notes || []).map((h) => h.hashtag.name),
    author: {
      username: article.user.urlname,
      nickname: article.user.nickname,
      profile: article.user.profile || ""
    },
    url: article.note_url || `${BASE_URL}/n/${article.key}`
  };
}
