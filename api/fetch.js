export default async function handler(req, res) {
    const url = req.query.url;

    if (!url) {
        return res.status(400).json({ error: "URL manquante" });
    }

    try {
        const response = await fetch(url, {
            method: "GET",
            redirect: "follow"
        });

        // Récupération des headers
        const headers = {};
        response.headers.forEach((value, key) => {
            headers[key] = value;
        });

        // Récupération du HTML
        const html = await response.text();

        return res.status(200).json({
            ok: true,
            status: response.status,
            headers,
            html
        });

    } catch (error) {
        return res.status(500).json({
            ok: false,
            error: "Impossible d'accéder à l'URL (bloqué ou invalide)"
        });
    }
}
