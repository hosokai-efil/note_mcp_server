import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  getUserProfile,
  getUserArticles,
  getArticle,
  type FormattedUserProfile,
  type FormattedArticleList,
  type FormattedArticleDetail
} from "./notecom";

type Env = {
  MCP_OBJECT: DurableObjectNamespace;
};

export class NoteMCP extends McpAgent<Env> {
  server = new McpServer({
    name: "note-mcp-server",
    version: "1.0.0"
  });

  async init(): Promise<void> {
    // Tool: get_user_profile
    this.server.tool(
      "get_user_profile",
      "Get a user's profile information from note.com",
      {
        username: z.string().describe("The username (urlname) of the note.com user")
      },
      async ({ username }): Promise<{ content: { type: "text"; text: string }[] }> => {
        try {
          const profile: FormattedUserProfile = await getUserProfile(username);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(profile, null, 2)
              }
            ]
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text",
                text: `Error: ${message}`
              }
            ]
          };
        }
      }
    );

    // Tool: get_user_articles
    this.server.tool(
      "get_user_articles",
      "Get a list of articles from a note.com user",
      {
        username: z.string().describe("The username (urlname) of the note.com user"),
        page: z.number().optional().default(1).describe("Page number (default: 1)")
      },
      async ({ username, page }): Promise<{ content: { type: "text"; text: string }[] }> => {
        try {
          const articles: FormattedArticleList = await getUserArticles(username, page);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(articles, null, 2)
              }
            ]
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text",
                text: `Error: ${message}`
              }
            ]
          };
        }
      }
    );

    // Tool: get_article
    this.server.tool(
      "get_article",
      "Get the full content of an article from note.com",
      {
        note_id: z.string().describe("The note key of the article (e.g., 'n5829f47dd4da'). Use the 'key' field from get_user_articles results.")
      },
      async ({ note_id }): Promise<{ content: { type: "text"; text: string }[] }> => {
        try {
          const article: FormattedArticleDetail = await getArticle(note_id);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(article, null, 2)
              }
            ]
          };
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          return {
            content: [
              {
                type: "text",
                text: `Error: ${message}`
              }
            ]
          };
        }
      }
    );
  }
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
      return NoteMCP.serve("/mcp").fetch(request, env, ctx);
    }

    if (url.pathname === "/" || url.pathname === "") {
      return Promise.resolve(
        new Response(
          JSON.stringify({
            name: "note-mcp-server",
            version: "1.0.0",
            description: "MCP server for note.com (unofficial API)",
            mcp_endpoint: "/mcp",
            tools: [
              {
                name: "get_user_profile",
                description: "Get a user's profile information"
              },
              {
                name: "get_user_articles",
                description: "Get a list of articles from a user"
              },
              {
                name: "get_article",
                description: "Get the full content of an article"
              }
            ]
          }),
          {
            headers: { "Content-Type": "application/json" }
          }
        )
      );
    }

    return Promise.resolve(new Response("Not Found", { status: 404 }));
  }
};
