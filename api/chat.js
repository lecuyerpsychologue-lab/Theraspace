export default async function handler(req, res) {
  // 1. On accepte que les demandes POST (envoi de données)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // 2. On récupère la clé cachée dans les coffres de Vercel
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Erreur Serveur: Clé API manquante' });
  }

  // 3. On prépare la discussion
  const { systemPrompt, userPrompt, jsonMode } = req.body;

  try {
    // 4. Le serveur Vercel appelle Mistral (Invisible pour l'ado)
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "mistral-small-latest",
        response_format: jsonMode ? { type: "json_object" } : { type: "text" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    // 5. Gestion des erreurs Mistral
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API Error: ${errorText}`);
    }

    const data = await response.json();
    
    // 6. On renvoie la réponse propre à l'application
    return res.status(200).json(data);

  } catch (error) {
    console.error("Erreur Backend:", error);
    return res.status(500).json({ error: 'Erreur de communication IA' });
  }
}
