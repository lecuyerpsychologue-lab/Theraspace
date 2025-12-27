
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return res.status(200).json({ demo: true });

  const { mode, data, context } = req.body;
  
  // Prompt système général pour garantir le ton
  let systemPrompt = "Tu es Lya, IA psychologue experte TCC pour ados. Ton ton est cool, direct, empathique et constructif.";
  let userPrompt = "";
  let jsonFormat = true;

  switch (mode) {
    case 'ANALYZE_HERO':
      systemPrompt += ` Génère un programme de 60 jours (8 semaines) pour booster l'estime de soi.
      JSON : {
        "archetype": "Nom Archétype (ex: Le Gardien)",
        "analysis": "Analyse valorisante en 2 phrases.",
        "roadmap": [ { "week": 1, "focus": "Thème", "tasks": ["Tâche 1", "Tâche 2", "Tâche 3"] }, ... ]
      }`;
      userPrompt = `Scores : ${JSON.stringify(data)}`;
      break;

    case 'GENERATE_ORACLE':
      // On demande explicitement de la variété à chaque appel
      systemPrompt += ` Tu es un Sage Ancien. Génère un conte philosophique unique, court et une morale liés au profil de l'ado (Identité: ${JSON.stringify(context || {})}).
      Ne répète jamais les mêmes histoires.
      JSON : { "title": "Titre", "story": "Histoire courte (max 4 phrases)", "moral": "Conseil direct" }`;
      userPrompt = "Génère une nouvelle sagesse maintenant.";
      break;

    case 'SYNTHESIZE_IDENTITY':
      systemPrompt += " Fais un portrait psychologique 'Cold Reading' bienveillant en 3 phrases basé sur ces réponses.";
      userPrompt = `Réponses : ${JSON.stringify(data)}`;
      jsonFormat = false;
      break;

    case 'GENERATE_SCENARIOS':
      // Demande de 20 situations
      systemPrompt += ` Génère une liste de 20 situations ados réalistes, modernes et variées (Collège, Lycée, Réseaux, Famille, Amour).
      Mélange équitablement les situations Positives, Négatives et Neutres.
      JSON : [{"id": 1, "text": "Situation...", "type": "neg/pos/neu"}]`;
      userPrompt = "Génère 20 situations nouvelles.";
      break;

    case 'ANALYZE_ECHO':
        systemPrompt += ` Analyse la session de jeu. JSON: { "observation": "Observation empathique", "conseil": "Conseil TCC actionnable" }`;
        userPrompt = `Session : ${JSON.stringify(data)}`;
        break;
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "mistral-small-latest",
        response_format: jsonFormat ? { type: "json_object" } : { type: "text" },
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
      })
    });
    const result = await response.json();
    const content = result.choices[0].message.content;
    return res.status(200).json(jsonFormat ? JSON.parse(content) : { text: content });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}


