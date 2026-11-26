export const schema = `
  CREATE TABLE IF NOT EXISTS saved_inventory (
    user_id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER NOT NULL
  );
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/saved-inventory") return new Response("Not found", { status: 404 });
    const userId = request.headers.get("x-websim-user-id");
    if (!userId) return Response.json({ error: "Inicia sesión para sincronizar." }, { status: 401 });

    if (request.method === "GET") {
      const row = await env.DB.prepare(
        "SELECT state_json, version, updated_at FROM saved_inventory WHERE user_id = ?"
      ).bind(userId).first();
      let state = null;
      if (row) {
        try { state = JSON.parse(row.state_json); }
        catch { return Response.json({ error: "No se pudo leer el respaldo guardado." }, { status: 500 }); }
      }
      return Response.json({ ownerId: userId, state, version: row?.version || 0, updatedAt: row?.updated_at || 0 });
    }

    if (request.method === "PUT") {
      let body;
      try { body = await request.json(); }
      catch { return Response.json({ error: "El contenido no es JSON válido." }, { status: 400 }); }
      if (!body?.state || typeof body.state !== "object" || Array.isArray(body.state) || !Array.isArray(body.state.items)) {
        return Response.json({ error: "El formato del inventario no es válido." }, { status: 400 });
      }
      const stateJson = JSON.stringify(body.state);
      if (stateJson.length > 120000) return Response.json({ error: "El respaldo supera el tamaño máximo." }, { status: 413 });
      const updatedAt = Date.now();
      await env.DB.prepare(
        "INSERT INTO saved_inventory (user_id, state_json, version, updated_at) VALUES (?, ?, 1, ?) " +
        "ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, version = saved_inventory.version + 1, updated_at = excluded.updated_at"
      ).bind(userId, stateJson, updatedAt).run();
      const version = await env.DB.prepare("SELECT version FROM saved_inventory WHERE user_id = ?").bind(userId).first("version");
      return Response.json({ ok: true, version, updatedAt });
    }

    return new Response("Method not allowed", { status: 405 });
  },
};
