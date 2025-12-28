// ===============================
// SCANNER D'URL (sécurité basique)
// ===============================

async function analyserURL() {
    const urlInput = document.getElementById("url").value.trim();

    if (!urlInput) {
        alert("Veuillez entrer une URL.");
        return;
    }

    let url;
    try {
        url = new URL(urlInput);
    } catch {
        alert("URL invalide.");
        return;
    }

    let html = "<h2>Résultats de l'analyse</h2>";

    // Vérification HTTPS
    const httpsOK = url.protocol === "https:";
    html += `<p><strong>HTTPS :</strong> ${httpsOK ? "✔ Sécurisé" : "❌ Non sécurisé"}</p>`;

    try {
        const response = await fetch(url);

        const csp = response.headers.get("Content-Security-Policy");
        const hsts = response.headers.get("Strict-Transport-Security");
        const xframe = response.headers.get("X-Frame-Options");
        const server = response.headers.get("Server");
        const cookies = response.headers.get("Set-Cookie");

        html += "<h3>Analyse des headers</h3>";
        html += `<p><strong>CSP :</strong> ${csp ? "✔ Présent" : "❌ Absent"}</p>`;
        html += `<p><strong>HSTS :</strong> ${hsts ? "✔ Présent" : "❌ Absent"}</p>`;
        html += `<p><strong>X-Frame-Options :</strong> ${xframe ? "✔ Présent" : "❌ Absent"}</p>`;
        html += `<p><strong>Serveur :</strong> ${server ? server : "❌ Non communiqué"}</p>`;

        if (cookies) {
            const secure = cookies.includes("Secure");
            const httponly = cookies.includes("HttpOnly");
            html += `<p><strong>Cookies sécurisés :</strong> ${secure ? "✔ Oui" : "❌ Non"}</p>`;
            html += `<p><strong>HttpOnly :</strong> ${httponly ? "✔ Oui" : "❌ Non"}</p>`;
        } else {
            html += "<p><strong>Cookies :</strong> Aucun cookie détecté</p>";
        }

    } catch (err) {
html += ` <p style="color:red;"> Analyse de sécurité de l'URL est impossible : ce site bloque l’accès (CORS).<br> Pour l’analyser, ouvrez la page puis faites <strong>CTRL + U</strong> et collez le code HTML dans la zone prévue. </p>`;    }

    // ENVOI VERS LA PAGE RESULTAT
    localStorage.setItem("analyseResultat", html);
    window.location.href = "resultat.html";

    fetch(`/api/fetch?url=${encodeURIComponent(url)}`)
    .then(res => res.json())
    .then(data => {
        if (!data.ok) {
            afficherErreur("Impossible d'analyser ce site (bloqué ou invalide).");
            return;
        }

        const headers = data.headers;
        const html = data.html;

        analyserSecurite(headers);
        analyserAccessibilite(html);
    });

}



// =====================================
// SCANNER HTML COLLE (accessibilité)
// =====================================

function analyserHTML() {
    const htmlInput = document.getElementById("htmlInput").value;

    if (!htmlInput.trim()) {
        alert("Veuillez coller du code HTML.");
        return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, "text/html");

    const imagesSansAlt = doc.querySelectorAll("img:not([alt])").length;
    const labels = doc.querySelectorAll("label").length;
    const titres = doc.querySelectorAll("h1, h2, h3").length;

    let score = 0;
    let total = 3;

    function ligne(titre, ok) {
        if (ok) score++;
        return `
            <p><strong>${titre} :</strong> ${ok ? "✔ OK" : "❌ Problème"}</p>
        `;
    }

    let resultatHTML = `
        <h2>Analyse Accessibilité</h2>
        ${ligne("Images avec attribut alt", imagesSansAlt === 0)}
        ${ligne("Présence de labels", labels > 0)}
        ${ligne("Structure de titres (h1/h2/h3)", titres > 0)}
        <h3>Score : ${Math.round((score / total) * 100)}%</h3>
    `;

    // ENVOI VERS LA PAGE RESULTAT
    localStorage.setItem("analyseResultat", resultatHTML);
    window.location.href = "resultat.html";
}
