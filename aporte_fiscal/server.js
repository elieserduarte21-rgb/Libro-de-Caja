export const schema = `
  CREATE TABLE IF NOT EXISTS contribution_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    values_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS contribution_templates_user_date
    ON contribution_templates (user_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS application_state (
    user_id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`;

function signedInUser(request) {
  return request.headers.get("x-websim-user-id");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isStateRoute = url.pathname === "/api/state";
    if (!isStateRoute && url.pathname !== "/api/templates" && !url.pathname.startsWith("/api/templates/")) {
      return new Response("Not found", { status: 404 });
    }
    const userId = signedInUser(request);
    if (!userId && ((request.method === "GET" && url.pathname === "/api/templates") || (request.method === "GET" && isStateRoute))) {
      return Response.json(isStateRoute ? { state: null, signInRequired: true } : { templates: [], signInRequired: true });
    }
    if (!userId) return Response.json({ error: "Inicia sesión en Websim para guardar y sincronizar tus datos." }, { status: 401 });

    try {
      if (request.method === "GET" && isStateRoute) {
        const row = await env.DB.prepare("SELECT state_json, updated_at FROM application_state WHERE user_id = ?").bind(userId).first();
        return Response.json(row ? { state: JSON.parse(row.state_json), updated_at: row.updated_at } : { state: null });
      }

      if (request.method === "PUT" && isStateRoute) {
        const body = await request.json();
        if (!body || !body.state || typeof body.state !== "object" || Array.isArray(body.state)) {
          return Response.json({ error: "El estado de la app no es válido." }, { status: 400 });
        }
        const stateJson = JSON.stringify(body.state);
        if (stateJson.length > 60000) return Response.json({ error: "El estado supera el tamaño permitido." }, { status: 400 });
        const updatedAt = Date.now();
        await env.DB.prepare(
          "INSERT INTO application_state (user_id, state_json, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at"
        ).bind(userId, stateJson, updatedAt).run();
        return Response.json({ ok: true, updated_at: updatedAt });
      }

      if (request.method === "GET" && url.pathname === "/api/templates") {
        const { results } = await env.DB.prepare(
          "SELECT id, name, values_json, created_at FROM contribution_templates WHERE user_id = ? ORDER BY created_at DESC LIMIT 200"
        ).bind(userId).all();
        return Response.json({ templates: results.map((row) => ({
          id: row.id, name: row.name, values: JSON.parse(row.values_json), created_at: row.created_at
        })) });
      }

      if (request.method === "POST" && url.pathname === "/api/templates") {
        const body = await request.json();
        if (!body || typeof body.name !== "string" || !body.name.trim() || !body.values || typeof body.values !== "object" || Array.isArray(body.values)) {
          return Response.json({ error: "Completa un nombre y los datos de la plantilla." }, { status: 400 });
        }
        const name = body.name.trim().slice(0, 48);
        const valuesJson = JSON.stringify(body.values);
        if (valuesJson.length > 60000) return Response.json({ error: "La plantilla supera el tamaño permitido." }, { status: 400 });
        const id = crypto.randomUUID();
        const createdAt = Date.now();
        await env.DB.prepare(
          "INSERT INTO contribution_templates (id, user_id, name, values_json, created_at) VALUES (?, ?, ?, ?, ?)"
        ).bind(id, userId, name, valuesJson, createdAt).run();
        return Response.json({ template: { id, name, values: body.values, created_at: createdAt } });
      }

      if (request.method === "DELETE" && url.pathname.startsWith("/api/templates/")) {
        const id = decodeURIComponent(url.pathname.slice("/api/templates/".length));
        if (!id || id.length > 80) return Response.json({ error: "Plantilla no válida." }, { status: 400 });
        const result = await env.DB.prepare("DELETE FROM contribution_templates WHERE id = ? AND user_id = ?").bind(id, userId).run();
        if (!result.meta.changes) return Response.json({ error: "No se encontró la plantilla." }, { status: 404 });
        return Response.json({ ok: true });
      }

      return new Response("Method not allowed", { status: 405 });
    } catch (error) {
      console.error("Template API error:", error);
      return Response.json({ error: "No se pudo completar la operación." }, { status: 500 });
    }
  },
};
