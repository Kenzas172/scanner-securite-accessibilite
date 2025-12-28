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

    // Message temporaire
    localStorage.setItem("analyseResultat", "<p>Analyse en cours...</p>");

    // APPEL API AVANT LE REDIRECT
    try {
        const res = await fetch(`/api/fetch?url=${encodeURIComponent(url)}`);
        const data = await res.json();

        if (!data.ok) {
            localStorage.setItem("analyseResultat",
                `<p style="color:red;">Impossible d'analyser ce site (bloqué ou invalide).</p>`
            );
            window.location.href = "resultat.html";
            return;
        }

        const headers = data.headers;
        const html = data.html;

        let resultat = "<h2>Analyse de sécurité</h2>";

        // HTTPS
        resultat += `<p><strong>HTTPS :</strong> ${url.protocol === "https:" ? "✔ Sécurisé" : "❌ Non sécurisé"}</p>`;

        // Headers
        resultat += `<p><strong>CSP :</strong> ${headers["content-security-policy"] ? "✔ Présent" : "❌ Absent"}</p>`;
        resultat += `<p><strong>HSTS :</strong> ${headers["strict-transport-security"] ? "✔ Présent" : "❌ Absent"}</p>`;
        resultat += `<p><strong>X-Frame-Options :</strong> ${headers["x-frame-options"] ? "✔ Présent" : "❌ Absent"}</p>`;
        resultat += `<p><strong>Serveur :</strong> ${headers["server"] || "❌ Non communiqué"}</p>`;

        // Cookies
        const cookies = headers["set-cookie"];
        if (cookies) {
            resultat += `<p><strong>Cookies sécurisés :</strong> ${cookies.includes("Secure") ? "✔ Oui" : "❌ Non"}</p>`;
            resultat += `<p><strong>HttpOnly :</strong> ${cookies.includes("HttpOnly") ? "✔ Oui" : "❌ Non"}</p>`;
        } else {
            resultat += "<p><strong>Cookies :</strong> Aucun cookie détecté</p>";
        }

        // Stockage final
        localStorage.setItem("analyseResultat", resultat);

    } catch (err) {
        localStorage.setItem("analyseResultat",
            `<p style="color:red;">Analyse impossible : ce site bloque l’accès (CORS).</p>`
        );
    }

    // REDIRECT APRÈS L’ANALYSE
    window.location.href = "resultat.html";
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
        return `<p><strong>${titre} :</strong> ${ok ? "✔ OK" : "❌ Problème"}</p>`;
    }

    let resultatHTML = `
        <h2>Analyse Accessibilité</h2>
        ${ligne("Images avec attribut alt", imagesSansAlt === 0)}
        ${ligne("Présence de labels", labels > 0)}
        ${ligne("Structure de titres (h1/h2/h3)", titres > 0)}
        <h3>Score : ${Math.round((score / total) * 100)}%</h3>
    `;

    localStorage.setItem("analyseResultat", resultatHTML);
    window.location.href = "resultat.html";
}

