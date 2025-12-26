import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Book, Activity, User, 
  Play, X, Check, ArrowRight, ArrowLeft,
  Sparkles, Zap, Shield, Heart, 
  MessageCircle, Moon, Sun, Cloud,
  Mic, Image as ImageIcon, Plus, 
  Thermometer, Wind, Fingerprint, 
  Smile, Frown, Meh, Save, Trash2,
  Mail, Share2, Crown, Swords, Ghost,
  Flame, Anchor, Compass, Lock, Phone, AlertTriangle,
  SkipForward, Calendar, Clock
} from 'lucide-react';

/* -------------------------------------------------------------------------
   🧠 LYA AI ENGINE (SÉCURISÉ via PROXY)
   ------------------------------------------------------------------------- */

const callMistral = async (systemPrompt, userPrompt, jsonMode = false) => {
  try {
    // Appel vers NOTRE fichier backend sécurisé (api/chat.js)
    const response = await fetch('/api/chat', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        jsonMode
      })
    });

    if (!response.ok) throw new Error("Erreur serveur");

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error("Erreur IA (Mode simulation activé):", error);
    return null; // Déclenche le fallback (mode démo) si le serveur ne répond pas
  }
};

const LYA_AI = {
  // 1. ANALYSE HÉROS (TCC & Estime de soi)
  analyzeHero: async (scores) => {
    // FALLBACK SIMULATION (Si le serveur ne répond pas ou pas de réseau)
    const fallback = (() => {
        let archetype = "Guerrier";
        let advice = "Ta force est dans l'action.";
        if (scores.knowledge > scores.competence) { archetype = "Sage"; advice = "Ta force est ta connaissance de toi-même."; }
        else if (scores.belonging > scores.security) { archetype = "Gardien"; advice = "Ta force est ton lien aux autres."; }
        
        return {
            title: `${archetype} de Lumière`,
            stats: scores,
            mission: `Ton score de compétence est de ${Math.round((scores.competence/15)*100)}%. Pour le monter, fixe-toi un défi minuscule demain (ex: ranger un tiroir).`
        };
    })();

    const systemPrompt = `Tu es Lya, psychologue experte TCC pour ados. Analyse les scores (Compétence, Sécurité, Appartenance, Connaissance) pour créer un profil "Héros" valorisant.
    Sortie JSON impérative : { "title": "Nom de l'Archétype (ex: Gardien des Liens)", "mission": "Un défi TCC minuscule et bienveillant" }`;
    
    const userPrompt = `Scores : Compétence ${scores.competence}/15, Sécurité ${scores.security}/9, Appartenance ${scores.belonging}/9, Connaissance ${scores.knowledge}/9.`;

    const rawResponse = await callMistral(systemPrompt, userPrompt, true);
    if (!rawResponse) return fallback;

    try {
      const aiData = JSON.parse(rawResponse);
      return { title: aiData.title, stats: scores, mission: aiData.mission };
    } catch (e) { return fallback; }
  },

  // 2. ORACLE (Motivation & Sagesse)
  generateOracle: async () => {
    const SAGES = ["Le Vieux Sage", "L'Esprit de la Forêt", "Le Phénix"];
    const METAPHORS = ["La rivière ne force pas son passage, elle coule.", "Même l'arbre le plus grand a commencé comme une graine."];
    const ADVICES = ["Respire et accepte ce moment.", "Fais un pas, même petit."];
    const fallback = { 
        title: SAGES[Math.floor(Math.random() * SAGES.length)], 
        text: `"${METAPHORS[Math.floor(Math.random() * METAPHORS.length)]} ${ADVICES[Math.floor(Math.random() * ADVICES.length)]}"` 
    };
    
    const systemPrompt = `Tu es l'Oracle. Donne une métaphore courte et sage pour un ado (style Zen ou Stoïcien). JSON : { "title": "Nom du Sage", "text": "Message complet" }`;
    const rawResponse = await callMistral(systemPrompt, "Donne un oracle maintenant.", true);
    
    if (!rawResponse) return fallback;
    try { return JSON.parse(rawResponse); } catch (e) { return fallback; }
  },

  // 3. SYNTHÈSE IDENTITÉ
  synthesizeIdentity: async (answers) => {
    const systemPrompt = `Fais une synthèse "Cold Reading" bienveillante, courte et percutante (2 phrases) de la personnalité de cet ado basée sur ses réponses. Valorise son unicité.`;
    const response = await callMistral(systemPrompt, JSON.stringify(answers), false);
    return response || "Tu as une personnalité riche et des goûts bien affirmés. Ta capacité à savoir ce que tu aimes est une force. (Mode Démo)";
  },

  // 4. FEEDBACK ÉCHO
  analyzeEcho: async (history) => {
    const fallback = { observation: "Tu as traversé des émotions variées.", conseil: "N'oublie pas d'utiliser ta stratégie de gratitude." };
    
    const systemPrompt = `Tu es une IA psychologue. Analyse cette session. Il n'y a plus de thèmes affichés, déduis les zones de fragilité du contenu. 
    Sortie JSON : { "observation": "Observation empathique", "conseil": "Conseil actionnable" }`;
    const rawResponse = await callMistral(systemPrompt, JSON.stringify(history), true);
    
    if(!rawResponse) return fallback;
    try { return JSON.parse(rawResponse); } catch (e) { return fallback; }
  }
};

/* -------------------------------------------------------------------------
   DATA: CONTENU CLINIQUES & SCÉNARIOS
   ------------------------------------------------------------------------- */

const EMOTIONS = [
  { id: 'colere', emoji: '😡', label: 'Rage' },
  { id: 'peur', emoji: '😰', label: 'Stress' },
  { id: 'tristesse', emoji: '😢', label: 'Tristesse' },
  { id: 'honte', emoji: '😳', label: 'Honte' },
  { id: 'vide', emoji: '😶', label: 'Vide' },
  { id: 'calme', emoji: '😌', label: 'Calme' },
  { id: 'joie', emoji: '🤩', label: 'Joie' },
  { id: 'confiance', emoji: '🦁', label: 'Fierté' },
];

const STRATEGIES = [
  { id: 'parler', icon: <MessageCircle size={18}/>, label: "J'en parle" },
  { id: 'musique', icon: <Play size={18}/>, label: "Musique" },
  { id: 'isolement', icon: <Moon size={18}/>, label: "Je m'isole" },
  { id: 'sport', icon: <Activity size={18}/>, label: "Je bouge" },
  { id: 'scroll', icon: <Fingerprint size={18}/>, label: "Écrans" },
  { id: 'art', icon: <Sparkles size={18}/>, label: "Création" },
  { id: 'gratitude', icon: <Heart size={18}/>, label: "Gratitude" },
  { id: 'savourer', icon: <Sun size={18}/>, label: "Je savoure" },
];

// Génération de scénarios réalistes (Pool étendu)
const REALISTIC_SCENARIOS = [
  // Négatifs
  { id: 1, text: "Tu ouvres Insta et tu tombes sur une story : tous tes potes sont ensemble sans toi.", type: 'neg', theme: 'Social' },
  { id: 2, text: "Le prof rend les contrôles. Tu caches ta feuille car tu as honte de ta note.", type: 'neg', theme: 'Scolaire' },
  { id: 3, text: "Tes parents te reprochent encore d'être 'tout le temps sur ton téléphone'.", type: 'neg', theme: 'Famille' },
  { id: 4, text: "Tu as envoyé un message risqué à ton crush. 'Vu', pas de réponse depuis 2h.", type: 'neg', theme: 'Amour' },
  { id: 5, text: "Tu te regardes dans le miroir avant de sortir. Rien ne va, tu te trouves horrible.", type: 'neg', theme: 'Image' },
  { id: 6, text: "On t'interroge à l'oral. Ta gorge se serre, aucun son ne sort, tout le monde te regarde.", type: 'neg', theme: 'Scolaire' },
  { id: 7, text: "Tu entends ton prénom chuchoté dans le couloir suivi d'un rire moqueur.", type: 'neg', theme: 'Social' },
  { id: 8, text: "Dimanche soir. Tu penses à la semaine qui arrive et tu as une boule au ventre.", type: 'neg', theme: 'Avenir' },
  
  // Positifs
  { id: 20, text: "Tu as réussi un truc difficile du premier coup. Personne n'a vu, mais tu es fier(e).", type: 'pos', theme: 'Estime' },
  { id: 21, text: "Tu écoutes ta playlist à fond dans ta chambre. Tu te sens invincible.", type: 'pos', theme: 'Ressource' },
  { id: 22, text: "Quelqu'un te fait un compliment sincère sur ton style aujourd'hui.", type: 'pos', theme: 'Social' },
  { id: 23, text: "Tu as aidé un pote qui n'allait pas bien. Il te remercie.", type: 'pos', theme: 'Utilité' },
  { id: 24, text: "Tu viens de finir une série incroyable, tu ressens ce mélange de vide et de joie.", type: 'pos', theme: 'Passion' },
  
  // Neutres / Ambigus
  { id: 30, text: "Tu es seul(e) chez toi. Le silence est total.", type: 'neu', theme: 'Solitude' },
  { id: 31, text: "Tu marches dans la rue avec tes écouteurs, tu as l'impression d'être dans un clip.", type: 'neu', theme: 'Imaginaire' }
];

const HERO_QUIZ = [
  // Compétence (5)
  { cat: 'competence', q: "Quand je commence quelque chose, je le finis." },
  { cat: 'competence', q: "Je me sens capable de résoudre mes problèmes." },
  { cat: 'competence', q: "J'ai des talents dont je suis fier(e)." },
  { cat: 'competence', q: "Je réussis ce que j'entreprends aussi bien que les autres." },
  { cat: 'competence', q: "Je me sens utile au quotidien." },
  // Connaissance (3)
  { cat: 'knowledge', q: "Je sais identifier ce que je ressens." },
  { cat: 'knowledge', q: "Je connais mes forces et mes faiblesses." },
  { cat: 'knowledge', q: "J'ai mes propres opinions, même si elles sont différentes." },
  // Sécurité (3)
  { cat: 'security', q: "Je me sens en sécurité avec moi-même." },
  { cat: 'security', q: "Je n'ai pas peur de l'avenir." },
  { cat: 'security', q: "Je m'accepte physiquement." },
  // Appartenance (3)
  { cat: 'belonging', q: "Je me sens aimé(e) par mes proches." },
  { cat: 'belonging', q: "J'ai l'impression de faire partie d'un groupe." },
  { cat: 'belonging', q: "Je peux compter sur quelqu'un en cas de pépin." },
];

const IDENTITY_SHORT_QUESTIONS = [
  { id: 'surnom', label: "Mon Surnom" },
  { id: 'totem', label: "Animal Totem" },
  { id: 'force', label: "Ma Force" },
  { id: 'krypto', label: "Ma Faiblesse" },
  { id: 'hobby', label: "Passion n°1" },
  { id: 'song', label: "Chanson Hype" },
  { id: 'color', label: "Couleur" },
  { id: 'place', label: "Refuge" },
  { id: 'season', label: "Saison" },
  { id: 'dream', label: "Rêve fou" },
  { id: 'fear', label: "Peur" },
  { id: 'hero', label: "Idole" },
  { id: 'food', label: "Plat confort" },
  { id: 'word', label: "Mot préféré" },
  { id: 'mood', label: "Vibe actuelle" },
];

/* -------------------------------------------------------------------------
   COMPOSANTS UI (GLASS DESIGN)
   ------------------------------------------------------------------------- */

const GlassPanel = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`backdrop-blur-xl bg-[#1e1b4b]/70 border border-white/10 shadow-2xl rounded-[32px] overflow-hidden ${className}`}>
    {children}
  </div>
);

const ActionButton = ({ onClick, children, variant = 'primary', className = '', disabled }) => {
  const styles = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 border-none",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    accent: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30",
    gold: "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30",
    danger: "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/30",
  };
  return (
    <button 
      onClick={onClick} disabled={disabled}
      className={`px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Tag = ({ text, type = 'neutral' }) => {
  const colors = {
    neutral: 'bg-slate-700/50 text-slate-300',
    pos: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    neg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-transparent ${colors[type]}`}>
      {text}
    </span>
  );
};

const NavIcon = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`p-2 transition-colors ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>{icon}</button>
);

/* -------------------------------------------------------------------------
   MODULES
   ------------------------------------------------------------------------- */

// --- SOS MODAL ---
const SOSModal = ({ onClose }) => (
  <div className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in">
    <div className="w-full max-w-sm bg-[#1e1b4b] border border-red-500/30 rounded-[32px] p-6 text-center shadow-[0_0_50px_rgba(220,38,38,0.3)]">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-pulse">
        <AlertTriangle size={40}/>
      </div>
      <h2 className="text-3xl font-black text-white mb-2">Besoin d'aide ?</h2>
      <p className="text-slate-300 mb-8 text-sm font-medium">Tu n'es pas seul(e). Parler peut tout changer.</p>
      
      <div className="space-y-4">
        <a href="tel:3114" className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 text-lg">
          <Phone size={24}/> 31 14 (Écoute)
        </a>
        <a href="tel:15" className="block w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-transform active:scale-95 text-lg">
          <Activity size={24}/> 15 (Urgence)
        </a>
      </div>
      <button onClick={onClose} className="mt-8 text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors">Retour</button>
    </div>
  </div>
);

// --- AUTH SCREEN ---
const AuthScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.5)] mb-8 border-4 border-[#0f0b1e]">
        <Fingerprint size={40} className="text-white"/>
      </div>
      <h1 className="text-3xl font-black text-white mb-2">TheraSpace</h1>
      <p className="text-slate-400 mb-10 text-center">Ton refuge numérique.</p>
      <div className="w-full space-y-4">
        <GlassPanel className="p-4 flex items-center gap-3"><Mail className="text-slate-500" size={20}/><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent text-white w-full focus:outline-none"/></GlassPanel>
        <GlassPanel className="p-4 flex items-center gap-3"><Lock className="text-slate-500" size={20}/><input type="password" placeholder="Code secret" value={pin} onChange={(e) => setPin(e.target.value)} className="bg-transparent text-white w-full focus:outline-none font-bold tracking-widest"/></GlassPanel>
        <ActionButton onClick={() => onLogin({ name: email.split('@')[0], email })} disabled={!email || pin.length < 4} className="w-full mt-4">Entrer <ArrowRight/></ActionButton>
      </div>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ onNavigate, user }) => {
  const [showSOS, setShowSOS] = useState(false);

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6 pt-10 pb-32 space-y-8 animate-fade-in relative">
      {showSOS && <SOSModal onClose={() => setShowSOS(false)} />}
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Salut {user?.name || 'l\'ami'}</h1>
          <p className="text-indigo-300 font-medium text-sm">Espace Sécurisé</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSOS(true)} className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-colors animate-pulse-slow shadow-[0_0_15px_rgba(239,68,68,0.2)]">
             <AlertTriangle size={24} className="text-red-500"/>
          </button>
          <button onClick={() => onNavigate('profile')} className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shadow-lg hover:border-indigo-500 transition-colors">
            <User size={24} className="text-slate-400"/>
          </button>
        </div>
      </header>

      <div onClick={() => onNavigate('echo')} className="relative group cursor-pointer transform transition-transform active:scale-95">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 rounded-[32px] blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"/>
        <GlassPanel className="relative p-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-xs font-bold text-indigo-200 uppercase tracking-wider">Lya Active</span>
            </div>
            <h3 className="text-3xl font-black text-white mb-2">ÉCHO</h3>
            <p className="text-slate-300 text-sm max-w-[150px] leading-tight">Exploration guidée & feedback</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner">
            <Play fill="currentColor" size={24}/>
          </div>
        </GlassPanel>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassPanel className="p-6 hover:bg-white/5 cursor-pointer transition-colors active:scale-95" onClick={() => onNavigate('journal')}>
          <Book className="text-emerald-400 mb-4" size={28}/>
          <h4 className="font-bold text-white text-lg">Journal</h4>
          <p className="text-slate-400 text-xs">Pensées privées</p>
        </GlassPanel>
        <GlassPanel className="p-6 hover:bg-white/5 cursor-pointer transition-colors active:scale-95" onClick={() => onNavigate('hero')}>
          <Shield className="text-amber-400 mb-4" size={28}/>
          <h4 className="font-bold text-white text-lg">Héros</h4>
          <p className="text-slate-400 text-xs">Estime de soi</p>
        </GlassPanel>
      </div>
    </div>
  );
};

// --- HERO MODULE (TCC COMPLETE) ---
const HeroModule = ({ onExit }) => {
  const [step, setStep] = useState('intro'); // intro, quiz, analyzing, result
  const [scores, setScores] = useState({ competence: 0, knowledge: 0, security: 0, belonging: 0 });
  const [currentQ, setCurrentQ] = useState(0);
  const [aiResult, setAiResult] = useState(null);

  const handleAnswer = (value) => {
    const q = HERO_QUIZ[currentQ];
    const newScores = { ...scores, [q.cat]: scores[q.cat] + value };
    setScores(newScores);

    if (currentQ < HERO_QUIZ.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep('analyzing');
      LYA_AI.analyzeHero(newScores).then(res => {
        setAiResult(res);
        setStep('result');
      });
    }
  };

  const HeroCard = ({ data }) => (
    <div className="relative w-full aspect-[3/4] max-w-sm mx-auto bg-gradient-to-br from-amber-500 to-orange-700 rounded-3xl p-1 shadow-2xl animate-flip-in">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"/>
      <div className="w-full h-full bg-slate-900 rounded-[20px] p-6 flex flex-col relative overflow-hidden">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-black text-white italic">{data.title}</h3>
          <Crown className="text-amber-400" size={32}/>
        <
