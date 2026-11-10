const DEFAULT_MODEL = "@cf/meta/llama-4-scout-17b-16e-instruct";

const CORS_HEADERS = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Authorization, Content-Type",
	"Access-Control-Max-Age": "86400",
};

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json", ...CORS_HEADERS },
	});
}

export default {
	async fetch(request, env) {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: CORS_HEADERS });
		}

		if (request.method !== "POST" || new URL(request.url).pathname !== "/") {
			return json({ error: "Use POST / with a JSON body." }, 405);
		}

		// Fail closed: if API_KEY was never set, every request is unauthorized.
		const auth = request.headers.get("Authorization") || "";
		if (!env.API_KEY || auth !== `Bearer ${env.API_KEY}`) {
			return json({ error: "Unauthorized" }, 401);
		}

		let body;
		try {
			body = await request.json();
		} catch {
			return json({ error: "Request body must be valid JSON." }, 400);
		}

		const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
		const messages = Array.isArray(body.messages) ? body.messages : null;
		if (!prompt && !messages) {
			return json({ error: "Provide either 'prompt' (string) or 'messages' (array)." }, 400);
		}

		const model = typeof body.model === "string" && body.model ? body.model : DEFAULT_MODEL;

		const options = {};
		if (messages) {
			options.messages = messages;
		} else {
			options.prompt = prompt;
		}
		if (Number.isFinite(body.max_tokens)) {
			options.max_tokens = Math.min(Math.max(Math.trunc(body.max_tokens), 1), 4096);
		}
		if (Number.isFinite(body.temperature)) {
			options.temperature = Math.min(Math.max(body.temperature, 0), 1);
		}

		try {
			const result = await env.AI.run(model, options);
			const response = typeof result?.response === "string" ? result.response : result;
			return json({ model, response });
		} catch (err) {
			return json({ error: "Generation failed", details: String(err?.message || err) }, 500);
		}
	},
};
