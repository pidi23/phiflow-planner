import React, { useMemo, useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const I18N = {
  DE: {
    appTitle: "PhiFlow – 2‑Wochen Planner",
    appDesc: "Baue ein individuelles Immersionsprogramm. Startdatum wählen, Bausteine filtern, Slots füllen – Totals & Radar folgen automatisch.",
    startDate: "Startdatum",
    category: "Kategorie",
    slot: "Slot",
    flowType: "Flow-Typ",
    search: "Suche",
    buildingBlocks: "Bausteine",
    elements: "Elemente",
    export: "Export",
    json: "JSON",
    csv: "CSV",
    print: "Drucken / PDF",
    plannerTitle: "Wochenplan (2 Wochen)",
    date: "Datum",
    day: "Tag",
    morning: "Vormittag",
    afternoon: "Nachmittag",
    evening: "Abend",
    select: "— auswählen —",
    rTotals: "Reflexion",
    aTotals: "Aktion",
    iTotals: "Integration",
    totals: "Totals",
    radar: "FLOW-Radar",
    radarHint: "Anzeige auf 1–5 Skala. Der Plan-Durchschnitt (1–3 → skaliert) wird dem gewählten Flow-Ziel gegenübergestellt.",
    tipsTitle: "Hinweise zur Nutzung",
    tips: [
      "Pro Slot (VM/NM/AB) einen Baustein wählen. Leerlassen ist okay.",
      "Filter links nutzen, um passende Module nach Persönlichkeit & Zielen zu finden.",
      "Export (CSV/JSON) für Weiterverarbeitung; ‘Drucken’ erzeugt ein PDF.",
      "Flow bedeutet Balance: Für schüchterne Personen lieber dosierte Aktion im sicheren Rahmen."
    ],
    login: "Login",
    username: "Nutzername",
    logout: "Logout",
    save: "Speichern",
    load: "Laden",
    saved: "Gespeichert",
    language: "Sprache",
    editor: "Bausteine bearbeiten",
    addBlock: "Baustein hinzufügen",
    title: "Titel",
    categoryCol: "Kategorie",
    slotCol: "Slot",
    weights: "R/A/I",
    types: "Eignung (Flow)",
    notes: "Hinweise",
    actions: "Aktionen",
    edit: "Bearbeiten",
    remove: "Löschen",
    cancel: "Abbrechen",
    saveBlock: "Speichern"
  },
  FR: {
    appTitle: "PhiFlow – Planificateur sur 2 semaines",
    appDesc: "Compose un programme d’immersion. Choisis la date de début, filtre les modules, remplis les créneaux – totaux & radar se calculent automatiquement.",
    startDate: "Date de début",
    category: "Catégorie",
    slot: "Créneau",
    flowType: "Type de flow",
    search: "Recherche",
    buildingBlocks: "Modules",
    elements: "éléments",
    export: "Export",
    json: "JSON",
    csv: "CSV",
    print: "Imprimer / PDF",
    plannerTitle: "Plan hebdomadaire (2 semaines)",
    date: "Date",
    day: "Jour",
    morning: "Matin",
    afternoon: "Après‑midi",
    evening: "Soir",
    select: "— sélectionner —",
    rTotals: "Réflexion",
    aTotals: "Action",
    iTotals: "Intégration",
    totals: "Totaux",
    radar: "FLOW‑Radar",
    radarHint: "Affichage sur une échelle 1–5. La moyenne du plan (1–3 → mise à l’échelle) est comparée à la cible Flow.",
    tipsTitle: "Conseils d’utilisation",
    tips: [
      "Choisis au plus un module par créneau (matin/après‑midi/soir). Laisser vide est possible.",
      "Utilise les filtres pour trouver des modules adaptés à ta personnalité et tes objectifs.",
      "Export (CSV/JSON) pour le traitement ultérieur ; ‘Imprimer’ génère un PDF.",
      "Le flow = équilibre : pour les personnes timides, privilégier une action dosée et cadrée."
    ],
    login: "Connexion",
    username: "Nom d’utilisateur",
    logout: "Déconnexion",
    save: "Enregistrer",
    load: "Charger",
    saved: "Enregistré",
    language: "Langue",
    editor: "Éditer les modules",
    addBlock: "Ajouter un module",
    title: "Titre",
    categoryCol: "Catégorie",
    slotCol: "Créneau",
    weights: "R/A/I",
    types: "Adéquation (Flow)",
    notes: "Notes",
    actions: "Actions",
    edit: "Éditer",
    remove: "Supprimer",
    cancel: "Annuler",
    saveBlock: "Enregistrer"
  }
};

const CATEGORIES = ["Alle", "Kurs", "Aktion", "Reflexion", "Integration"];
const SLOTS = ["Alle", "Vormittag", "Nachmittag", "Abend"];
const FLOW_TYPES = ["Alle", "Entdecker", "Behutsamer Lerner", "Reflexiver Gestalter", "Pragmatiker"];

const DEFAULT_MODULES = [
  { title: "Sprachkurs: Alltagskommunikation", category: "Kurs", slot: "Vormittag", R: 1, A: 2, I: 2, types: ["Alle"], notes: "Grundlagen & Redemittel für Alltagssituationen." },
  { title: "Sprachkurs: Beruf & Bewerbung", category: "Kurs", slot: "Vormittag", R: 1, A: 2, I: 2, types: ["Pragmatiker","Reflexiver Gestalter"], notes: "Fokus: Fachsprache, CV/Interview." },
  { title: "Stadtführung mit Sprachaufgaben", category: "Aktion", slot: "Nachmittag", R: 1, A: 3, I: 2, types: ["Entdecker","Pragmatiker"], notes: "Mini-Aufträge: Fragen stellen, Infos sammeln." },
  { title: "Tandemgespräch (1:1, 60–90 Min)", category: "Aktion", slot: "Nachmittag", R: 1, A: 3, I: 2, types: ["Alle"], notes: "Mit Local Buddy; Themenwahl frei." },
  { title: "Marktbesuch & Einkaufsdialoge", category: "Aktion", slot: "Nachmittag", R: 1, A: 3, I: 3, types: ["Pragmatiker","Entdecker"], notes: "Lebensnahes Üben + Integration zu Hause (Kochen)." },
  { title: "Gemeinsames Kochen (Gastfamilie)", category: "Integration", slot: "Abend", R: 1, A: 2, I: 3, types: ["Pragmatiker","Behutsamer Lerner"], notes: "Alltagskommunikation in der Küche." },
  { title: "Soziales Engagement (2–3 Std)", category: "Aktion", slot: "Nachmittag", R: 1, A: 3, I: 3, types: ["Entdecker","Pragmatiker"], notes: "Freiwilligenarbeit / Community-Projekt." },
  { title: "Museum/Exkursion + Sprachauftrag", category: "Aktion", slot: "Nachmittag", R: 2, A: 2, I: 2, types: ["Reflexiver Gestalter","Behutsamer Lerner"], notes: "Kurzrecherche + Nachbereitung." },
  { title: "Audio-Log / Journal (10 Min)", category: "Reflexion", slot: "Abend", R: 3, A: 1, I: 1, types: ["Behutsamer Lerner","Reflexiver Gestalter"], notes: "Kurze strukturierte Reflexion." },
  { title: "Peer-Reflexion (Kleingruppe)", category: "Reflexion", slot: "Abend", R: 3, A: 1, I: 1, types: ["Behutsamer Lerner","Reflexiver Gestalter"], notes: "Leitfragen, Erfolge & Hürden." },
  { title: "Vereins-/Meet-up-Besuch", category: "Integration", slot: "Abend", R: 1, A: 2, I: 3, types: ["Entdecker","Pragmatiker"], notes: "Alltagsnahe Kontakte & Routinen." },
  { title: "Projektarbeit + Präsentation", category: "Kurs", slot: "Vormittag", R: 2, A: 2, I: 2, types: ["Alle"], notes: "Kleines Thema bearbeiten, vorstellen." },
  { title: "Betriebserkundung / Job Shadowing", category: "Aktion", slot: "Nachmittag", R: 1, A: 3, I: 2, types: ["Pragmatiker","Reflexiver Gestalter"], notes: "Einblicke in Arbeitswelt." },
  { title: "Wochenbilanz & Transferplan", category: "Reflexion", slot: "Vormittag", R: 3, A: 1, I: 2, types: ["Alle"], notes: "Flow-Momente, nächste Schritte, Routinen." },
  { title: "Outdoor-Aktivität mit Locals", category: "Aktion", slot: "Nachmittag", R: 1, A: 3, I: 3, types: ["Entdecker"], notes: "Sport / Ausflug, sprachlich eingebettet." },
  { title: "Kulturabend (Theater/Konzert)", category: "Integration", slot: "Abend", R: 1, A: 2, I: 2, types: ["Reflexiver Gestalter","Behutsamer Lerner"], notes: "Vor- & Nachbereitung möglich." },
];

function toCSV(plan) {
  const header = ["Datum","Tag","Vormittag","Nachmittag","Abend","R_VM","A_VM","I_VM","R_NM","A_NM","I_NM","R_AB","A_AB","I_AB"].join(",");
  const lines = plan.map(row=>{
    const getVals=(m)=> m? [m.R,m.A,m.I]:[0,0,0];
    const vmVals = getVals(row.Vormittag);
    const nmVals = getVals(row.Nachmittag);
    const abVals = getVals(row.Abend);
    return [row.date,row.dow,row.Vormittag?.title||"",row.Nachmittag?.title||"",row.Abend?.title||"",...vmVals,...nmVals,...abVals].join(",");
  });
  return [header,...lines].join("\n");
}
function download(filename, content, mime="text/plain"){
  const blob = new Blob([content], {type:mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
function useLocalStorage(key, initial){
  const [val, setVal] = useState(()=>{
    try{ const raw = localStorage.getItem(key); return raw? JSON.parse(raw) : initial; }catch{ return initial; }
  });
  useEffect(()=>{ try{ localStorage.setItem(key, JSON.stringify(val)); }catch{} }, [key,val]);
  return [val, setVal];
}

export default function App(){
  const [lang, setLang] = useLocalStorage("phiflow.lang", "DE");
  const t = I18N[lang] || I18N.DE;

  const [user, setUser] = useLocalStorage("phiflow.user", "");
  const [allModules, setAllModules] = useLocalStorage(`phiflow.modules.${user||"default"}`, DEFAULT_MODULES);

  const [startDate, setStartDate] = useLocalStorage(`phiflow.start.${user||"default"}`, new Date().toISOString().slice(0,10));
  const [plan, setPlan] = useLocalStorage(`phiflow.plan.${user||"default"}`, []);

  useEffect(()=>{
    if (!plan || plan.length === 0) {
      const start = new Date(startDate);
      const days = [];
      for (let w = 0; w < 2; w++) {
        for (let i = 0; i < 7; i++) {
          const d = new Date(start);
          d.setDate(d.getDate() + (w*7 + i));
          const dn = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"][d.getDay()];
          const dow = dn === "Sonntag" ? "Sonntag" : dn;
          days.push({ date: d.toISOString().slice(0,10), dow, Vormittag: null, Nachmittag: null, Abend: null });
        }
      }
      setPlan(days);
    }
  }, []);

  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("Alle");
  const [slotFilter, setSlotFilter] = useState("Alle");
  const [flowFilter, setFlowFilter] = useState("Alle");
  const [focusType, setFocusType] = useState("Behutsamer Lerner");

  function setCell(dayIdx, field, moduleTitle){
    setPlan(old=>{
      const copy = [...old];
      const mod = allModules.find(m=>m.title===moduleTitle) || null;
      copy[dayIdx] = { ...copy[dayIdx], [field]: mod };
      return copy;
    });
  }

  const filteredModules = useMemo(()=>{
    const q = search.trim().toLowerCase();
    return allModules.filter(m=>{
      if (cat!=="Alle" && m.category!==cat) return false;
      if (slotFilter!=="Alle" && m.slot!==slotFilter) return false;
      if (flowFilter!=="Alle" && !(m.types?.includes(flowFilter) || m.types?.includes("Alle"))) return false;
      if (q && !(m.title.toLowerCase().includes(q) || (m.notes||"").toLowerCase().includes(q))) return false;
      return true;
    });
  },[search,cat,slotFilter,flowFilter, allModules]);

  let R=0,A=0,I=0, cnt=0;
  (plan||[]).forEach(row=>{
    [row?.Vormittag,row?.Nachmittag,row?.Abend].forEach(m=>{ if(m){ R+=Number(m.R)||0; A+=Number(m.A)||0; I+=Number(m.I)||0; cnt++; }});
  });
  const avg = (v)=> cnt? Math.min(5, Math.max(1, (v/cnt)*1.5 )): 1;
  const radarData = [
    { axis: "Reflexion", value: avg(R) },
    { axis: "Aktion", value: avg(A) },
    { axis: "Integration", value: avg(I) },
  ];
  const targetRadar = [
    { axis: "Reflexion", value: 5 },
    { axis: "Aktion", value: 3 },
    { axis: "Integration", value: 3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <h1 className="text-2xl font-semibold">{t.appTitle}</h1>
            <p className="text-sm text-slate-600 mt-1">{t.appDesc}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-sm col-span-2">{t.startDate}
                <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"/>
              </label>
              <label className="text-sm">{t.category}
                <select value={cat} onChange={e=>setCat(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                  {CATEGORIES.map(c=>(<option key={c}>{c}</option>))}
                </select>
              </label>
              <label className="text-sm">{t.slot}
                <select value={slotFilter} onChange={e=>setSlotFilter(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                  {SLOTS.map(s=>(<option key={s}>{s}</option>))}
                </select>
              </label>
              <label className="text-sm col-span-2">{t.flowType}
                <select value={flowFilter} onChange={e=>setFlowFilter(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                  {FLOW_TYPES.map(f=>(<option key={f}>{f}</option>))}
                </select>
              </label>
              <label className="text-sm col-span-2">{t.search}
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Titel oder Hinweis… / Titre ou note…" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"/>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{t.buildingBlocks}</h2>
              <span className="text-xs text-slate-500">{filteredModules.length} {t.elements}</span>
            </div>
            <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
              {filteredModules.map((m,idx)=>(
                <div key={idx} className="border border-slate-200 rounded-xl p-3 hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{m.title}</div>
                      <div className="text-xs text-slate-500">{m.category} • {m.slot} • R{m.R}/A{m.A}/I{m.I}</div>
                    </div>
                    <span className="text-xs bg-slate-100 rounded-full px-2 py-1">{(m.types||[]).join(", ")}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{m.notes}</p>
                </div>
              ))}
              {filteredModules.length===0 && (<div className="text-sm text-slate-500">Ø</div>)}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">{t.plannerTitle}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-2">{t.date}</th>
                    <th className="p-2">{t.day}</th>
                    <th className="p-2">{t.morning}</th>
                    <th className="p-2">{t.afternoon}</th>
                    <th className="p-2">{t.evening}</th>
                    <th className="p-2">R/A/I</th>
                  </tr>
                </thead>
                <tbody>
                  {(plan||[]).map((row, idx)=>{
                    const vm = row.Vormittag, nm = row.Nachmittag, ab = row.Abend;
                    const r = (vm?.R||0)+(nm?.R||0)+(ab?.R||0);
                    const a = (vm?.A||0)+(nm?.A||0)+(ab?.A||0);
                    const i = (vm?.I||0)+(nm?.I||0)+(ab?.I||0);
                    const moduleSelect = (value, onChange, allowedSlot) => (
                      <select value={value?.title||""} onChange={(e)=> onChange(e.target.value)} className="w-full border border-slate-300 rounded-xl px-2 py-2">
                        <option value="">{t.select}</option>
                        {allModules.filter(m=>m.slot===allowedSlot).map((m,ix)=> (
                          <option key={ix} value={m.title}>{m.title}</option>
                        ))}
                      </select>
                    );
                    return (
                      <tr key={row.date} className="border-t">
                        <td className="p-2 whitespace-nowrap">{row.date}</td>
                        <td className="p-2">{row.dow}</td>
                        <td className="p-2">{moduleSelect(vm, (val)=> setCell(idx, "Vormittag", val), "Vormittag")}</td>
                        <td className="p-2">{moduleSelect(nm, (val)=> setCell(idx, "Nachmittag", val), "Nachmittag")}</td>
                        <td className="p-2">{moduleSelect(ab, (val)=> setCell(idx, "Abend", val), "Abend")}</td>
                        <td className="p-2 text-slate-700">R{r} / A{a} / I{i}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <h3 className="text-lg font-semibold mb-2">{t.totals}</h3>
              <div className="flex gap-4 text-sm">
                <div className="px-3 py-2 bg-slate-100 rounded-xl">{t.rTotals}: <b>{R}</b></div>
                <div className="px-3 py-2 bg-slate-100 rounded-xl">{t.aTotals}: <b>{A}</b></div>
                <div className="px-3 py-2 bg-slate-100 rounded-xl">{t.iTotals}: <b>{I}</b></div>
              </div>
              <p className="text-xs text-slate-500 mt-2">R/A/I sind Gewichte 1–3 pro Event. Ziel ist Balance passend zum Flow-Stil – nicht Maximierung in allen Dimensionen.</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.radar}</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                    { subject: "Reflexion", value: radarData[0].value, target: 5 },
                    { subject: "Aktion", value: radarData[1].value, target: 3 },
                    { subject: "Integration", value: radarData[2].value, target: 3 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis domain={[1,5]} />
                    <Tooltip formatter={(v, name)=> [typeof v === 'number'? v.toFixed(2): v, name]} />
                    <Radar name="Plan (Ø)" dataKey="value" stroke="#2563eb" fill="#60a5fa" fillOpacity={0.5} />
                    <Radar name="Ziel" dataKey="target" stroke="#0f766e" fill="#99f6e4" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-slate-500 mt-2">{t.radarHint}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
