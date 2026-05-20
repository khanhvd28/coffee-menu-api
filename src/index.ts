/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // HANDLE PREFLIGHT
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // GET MENU
    console.log("Received request:", request.method, url.pathname);
    if (url.pathname === "/menu") {
      const data =
        await env.MENU_KV.get("menu");

      console.log("Fetched menu data:", data);

      return new Response(
        data || "[]",
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // SYNC MENU
    if (
      url.pathname === "/sync" &&
      request.method === "POST"
    ) {
      const body = await request.json();

      console.log("Fetched menu data:", body);

      await env.MENU_KV.put(
        "menu",
        JSON.stringify(body)
      );

      return Response.json(
        { success: true },
        {
          headers: corsHeaders
        }
      );
    }

    return new Response(
      "Not Found",
      {
        status: 404,
        headers: corsHeaders
      }
    );
  }
} satisfies ExportedHandler<Env>;
