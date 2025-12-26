export default async function handler(req, res) {
  // 1. Sécurité : On accepte uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Récupération de la clé API depuis Vercel (Variables d'environnement)
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Erreur serveur : Clé API non configurée.' });
  }

  // 3. Récupération des données envoyées par l'application (l'ado)
  const { systemPrompt, userPrompt, jsonMode } = req.body;

  try {
    // 4. Appel à Mistral (C'est ici que la magie opère, invisible pour l'ado)
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest", // Modèle rapide et intelligent
        response_format: jsonMode ? { type: "json_object" } : { type: "text" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Erreur Mistral: ${errorData}`);
    }

    const data = await response.json();
    
    // 5. On renvoie uniquement le résultat propre au frontend
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erreur Backend:", error);
    return res.status(500).json({ error: 'Erreur de communication avec IA' });
  }
}


