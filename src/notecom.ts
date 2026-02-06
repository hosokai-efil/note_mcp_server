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
  publishAt: string | null;
  likeCount: number;
  commentCount: number;
  user: {
    id: number;
    urlname: string;
    nickname: string;
    profileImagePath: string;
    profile: string | null;
  };
  eyecatch: string | null;
  isPremium: boolean;
  isMembershipConnected: boolean;
  hashtags: { hashtag: { name: string } }[];
}

interface ArticleDetailResponse {
  data: ArticleDetail;
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

export async function getArticle(noteId: string): Promise<FormattedArticleDetail> {
  const url = `${BASE_URL}/api/v1/notes/${encodeURIComponent(noteId)}`;

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
    publishedAt: article.publishAt || "",
    likeCount: article.likeCount,
    commentCount: article.commentCount,
    isPremium: article.isPremium,
    hashtags: article.hashtags.map((h) => h.hashtag.name),
    author: {
      username: article.user.urlname,
      nickname: article.user.nickname,
      profile: article.user.profile || ""
    },
    url: `${BASE_URL}/n/${article.key}`
  };
}
