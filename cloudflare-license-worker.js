/**
 * TubeDigest AI - Cloudflare Worker License Server (Optional & 100% Free)
 * 
 * Instructions to deploy in 2 minutes:
 * 1. Go to dash.cloudflare.com -> Workers & Pages -> Create Worker
 * 2. Paste this code and click "Deploy"
 * 3. Bind a free KV namespace named "LICENSES"
 * 4. Replace the worker URL in background.js
 */

export default {
    async fetch(request, env) {
        // Enable CORS
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            });
        }

        if (request.method !== "POST") {
            return new Response("TubeDigest License API Active", { status: 200 });
        }

        try {
            const body = await request.json();
            const { action, key, email, hwid } = body;
            const clientIp = request.headers.get("CF-Connecting-IP") || "Unknown";

            if (!key || !hwid) {
                return new Response(JSON.stringify({ success: false, error: "کلید و شناسه دستگاه الزامی است." }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }

            // Check existing binding in KV
            const existing = await env.LICENSES.get(key, { type: "json" });

            if (existing) {
                // If already registered to another machine:
                if (existing.hwid !== hwid) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: "❌ این کد لایسنس قبلاً بر روی دستگاه دیگری فعال شده است. اشتراک‌گذاری یک لایسنس مجاز نمی‌باشد."
                    }), {
                        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                    });
                }

                return new Response(JSON.stringify({
                    success: true,
                    message: "✅ لایسنس مجدداً برای این دستگاه تأیید شد."
                }), {
                    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
                });
            }

            // First-time activation: lock to this device, email, and IP!
            const newRecord = {
                key,
                email: email || "unknown",
                hwid,
                ip: clientIp,
                activatedAt: new Date().toISOString()
            };

            await env.LICENSES.put(key, JSON.stringify(newRecord));

            return new Response(JSON.stringify({
                success: true,
                message: "✅ لایسنس با موفقیت به این دستگاه و حساب کاربری متصل شد!"
            }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });

        } catch (err) {
            return new Response(JSON.stringify({ success: false, error: err.message }), {
                headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
        }
    }
};
