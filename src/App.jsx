import { useState, useEffect, useCallback } from "react";

// ─── localStorage helpers ─────────────────────────────────────────────────────
const store = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)) ?? null; } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const POSITIONS = ["Gardien", "Défenseur", "Milieu", "Attaquant"];
const COLORS = ["#16a34a","#dc2626","#2563eb","#d97706","#9333ea","#db2777","#0891b2","#65a30d","#ea580c","#4f46e5"];

// ─── Avatars ──────────────────────────────────────────────────────────────────
function PlayerAvatar({ name, num, size = 48, color = "#16a34a" }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${color}dd,${color}88)`,
      border: `2px solid ${color}`, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "'Bebas Neue',cursive",
      fontSize: size * 0.35, color: "#fff", flexShrink: 0,
      position: "relative", boxShadow: `0 0 12px ${color}55`
    }}>
      {initials}
      <span style={{
        position: "absolute", bottom: -4, right: -4,
        background: "#111", color: "#fff", borderRadius: "50%",
        width: size * 0.42, height: size * 0.42,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.22, border: `1px solid ${color}`, fontFamily: "monospace"
      }}>{num}</span>
    </div>
  );
}

function TeamLogo({ name, color, size = 56 }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 12,
      background: `linear-gradient(135deg,${color},#000)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Bebas Neue',cursive", fontSize: size * 0.38,
      color: "#fff", flexShrink: 0,
      border: `2px solid ${color}55`, boxShadow: `0 4px 20px ${color}44`
    }}>{initials}</div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [teams, setTeams] = useState(() => store.get("tt_teams") || []);
  const [stats, setStats] = useState(() => store.get("tt_stats") || {});
  const [matches, setMatches] = useState(() => store.get("tt_matches") || []);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { store.set("tt_teams", teams); }, [teams]);
  useEffect(() => { store.set("tt_stats", stats); }, [stats]);
  useEffect(() => { store.set("tt_matches", matches); }, [matches]);
  useEffect(() => { store.set("tt_matches", matches); }, [matches]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const updateStat = (playerId, field) => {
    setStats(prev => ({
      ...prev,
      [playerId]: {
        goals: 0, assists: 0, games: 0,
        ...(prev[playerId] || {}),
        [field]: ((prev[playerId]?.[field]) || 0) + 1
      }
    }));
    showToast("Statistique mise à jour ✓");
  };

  const allPlayers = teams.flatMap(t =>
    t.players.map(p => ({ ...p, teamName: t.name, teamColor: t.color, teamId: t.id }))
  );
  const scorers = [...allPlayers]
    .map(p => ({ ...p, s: stats[p.id] || { goals: 0, assists: 0, games: 0 } }))
    .sort((a, b) => b.s.goals - a.s.goals).filter(p => p.s.goals > 0);
  const assisters = [...allPlayers]
    .map(p => ({ ...p, s: stats[p.id] || { goals: 0, assists: 0, games: 0 } }))
    .sort((a, b) => b.s.assists - a.s.assists).filter(p => p.s.assists > 0);

  const pages = { home: HomePage, teams: TeamsPage, matches: MatchesPage, stats: StatsPage, ranking: RankingPage, admin: AdminPage };
  const CurrentPage = pages[page] || HomePage;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Rajdhani',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#16a34a;border-radius:3px}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .5s ease forwards}
        .page-fade{animation:fadeIn .35s ease forwards}
        .btn-primary{background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;border:none;padding:12px 28px;border-radius:8px;font-family:'Bebas Neue',cursive;font-size:18px;letter-spacing:1px;cursor:pointer;transition:all .2s;box-shadow:0 4px 16px #16a34a44}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px #16a34a66}
        .btn-danger{background:#dc2626;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;transition:all .2s}
        .btn-danger:hover{background:#b91c1c}
        .card{background:linear-gradient(135deg,#111,#0d1a0d);border:1px solid #16a34a22;border-radius:16px;padding:20px}
        input,select,textarea{background:#0d1a0d;border:1px solid #16a34a33;color:#fff;padding:10px 14px;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:15px;width:100%;outline:none;transition:border .2s}
        input:focus,select:focus{border-color:#16a34a}
        select option{background:#111}
        label{color:#9ca3af;font-size:13px;display:block;margin-bottom:4px}
        @media(max-width:640px){.desktop-nav{display:none!important}.burger{display:block!important}}
        @media(min-width:641px){.mobile-menu{display:none!important}}
      `}</style>

      <Nav page={page} setPage={setPage} isAdmin={isAdmin} />

      <div className="page-fade" key={page}>
        <CurrentPage
          teams={teams} setTeams={setTeams}
          stats={stats} setStats={setStats}
          updateStat={updateStat}
          allPlayers={allPlayers}
          scorers={scorers} assisters={assisters}
          setPage={setPage}
          isAdmin={isAdmin} setIsAdmin={setIsAdmin}
          showToast={showToast}
        />
      </div>

      <Footer />

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "success" ? "#16a34a" : "#dc2626",
          color: "#fff", padding: "12px 28px", borderRadius: 50,
          fontFamily: "'Bebas Neue',cursive", fontSize: 18, letterSpacing: 1,
          animation: "slideDown .3s ease", zIndex: 9999,
          boxShadow: "0 8px 32px rgba(0,0,0,.5)", whiteSpace: "nowrap"
        }}>{toast.msg}</div>
      )}
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, isAdmin }) {
  const [open, setOpen] = useState(false);
  const links = [
    { id: "home", label: "Accueil" },
    { id: "teams", label: "Équipes" },
    { id: "stats", label: "Stats" },
    { id: "matches", label: "Matchs" },
    { id: "ranking", label: "Classement" },
    { id: "admin", label: isAdmin ? "⚙ Admin" : "Admin" },
  ];
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(0,0,0,.95)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #16a34a33",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", height: 60
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("home")}>
        <span style={{ fontSize: 28 }}>⚽</span>
        <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: 2, color: "#16a34a" }}>Tournoi Tabaski</span>
      </div>
      <div style={{ display: "flex", gap: 4 }} className="desktop-nav">
        {links.map(l => (
          <button key={l.id} onClick={() => setPage(l.id)} style={{
            background: page === l.id ? "#16a34a" : "transparent",
            color: page === l.id ? "#fff" : "#9ca3af",
            border: "none", padding: "8px 16px", borderRadius: 8,
            cursor: "pointer", fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 600, fontSize: 15, transition: "all .2s"
          }}>{l.label}</button>
        ))}
      </div>
      <button onClick={() => setOpen(!open)} style={{
        background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", display: "none"
      }} className="burger">☰</button>
      {open && (
        <div className="mobile-menu" style={{
          position: "absolute", top: 60, left: 0, right: 0,
          background: "#111", borderBottom: "1px solid #16a34a33",
          display: "flex", flexDirection: "column"
        }}>
          {links.map(l => (
            <button key={l.id} onClick={() => { setPage(l.id); setOpen(false); }} style={{
              background: page === l.id ? "#16a34a22" : "transparent",
              color: page === l.id ? "#16a34a" : "#fff",
              border: "none", borderBottom: "1px solid #16a34a11",
              padding: "16px 20px", textAlign: "left", cursor: "pointer",
              fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 16
            }}>{l.label}</button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage, teams }) {
  return (
    <div>
      <div style={{ position: "relative", minHeight: "92vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#0a1a0a 0%,#0d2a0d 40%,#0a1a0a 100%)" }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.15 }} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
          <rect width="800" height="500" fill="#16a34a" />
          {[0,1,2,3,4,5,6,7].map(i => <rect key={i} x={50+i*87.5} y={30} width={87.5} height={440} fill={i%2===0?"#16a34a":"#128a3a"} opacity={0.5} />)}
          <rect x="50" y="30" width="700" height="440" fill="none" stroke="#fff" strokeWidth="3"/>
          <line x1="400" y1="30" x2="400" y2="470" stroke="#fff" strokeWidth="2"/>
          <circle cx="400" cy="250" r="70" fill="none" stroke="#fff" strokeWidth="2"/>
          <circle cx="400" cy="250" r="5" fill="#fff"/>
          <rect x="50" y="150" width="150" height="200" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="600" y="150" width="150" height="200" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="50" y="190" width="70" height="120" fill="none" stroke="#fff" strokeWidth="2"/>
          <rect x="680" y="190" width="70" height="120" fill="none" stroke="#fff" strokeWidth="2"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,.3),rgba(0,0,0,.7))" }} />

        <div style={{ position: "relative", textAlign: "center", padding: "40px 20px", maxWidth: 700 }}>
          <div className="fade-in" style={{ animationDelay: ".1s" }}>
            <div style={{
              display: "inline-block", background: "#16a34a22", border: "1px solid #16a34a55",
              borderRadius: 50, padding: "6px 20px", marginBottom: 24,
              fontFamily: "'Bebas Neue',cursive", fontSize: 16, letterSpacing: 3, color: "#16a34a"
            }}>⚽ FOOTBALL TOURNAMENT 2025</div>
          </div>
          <h1 className="fade-in" style={{
            fontFamily: "'Bebas Neue',cursive", fontSize: "clamp(52px,14vw,96px)",
            lineHeight: .95, letterSpacing: 4, textShadow: "0 0 40px #16a34a66", animationDelay: ".2s"
          }}>
            <span style={{ color: "#16a34a" }}>Tournoi</span><br />
            <span style={{ color: "#fff" }}>Tabaski</span>
          </h1>

          <div className="fade-in" style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 36, marginBottom: 40, flexWrap: "wrap", animationDelay: ".3s" }}>
            {[
              { icon: "📍", label: "LIEU", val: "Terrain Angleterre" },
              { icon: "🕓", label: "HEURE", val: "16h00" },
              { icon: "📅", label: "DÉBUT", val: "2ème jour Tabaski" },
              { icon: "🏆", label: "ÉQUIPES", val: `${teams.length} équipe${teams.length!==1?"s":""}` },
            ].map(item => (
              <div key={item.label} style={{
                background: "rgba(0,0,0,.6)", border: "1px solid #16a34a33",
                borderRadius: 12, padding: "16px 20px", textAlign: "center", minWidth: 130,
                backdropFilter: "blur(8px)"
              }}>
                <div style={{ fontSize: 22 }}>{item.icon}</div>
                <div style={{ color: "#16a34a", fontSize: 11, fontWeight: 700, letterSpacing: 2, marginTop: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 2 }}>{item.val}</div>
              </div>
            ))}
          </div>

          <div className="fade-in" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", animationDelay: ".4s" }}>
            <button className="btn-primary" onClick={() => setPage("teams")} style={{ fontSize: 20 }}>🏆 Voir les Équipes</button>
            <button className="btn-primary" onClick={() => setPage("stats")} style={{ background: "transparent", border: "2px solid #16a34a", boxShadow: "none", fontSize: 20 }}>📊 Voir les Stats</button>
          </div>
        </div>
        {[...Array(5)].map((_,i) => (
          <div key={i} style={{
            position: "absolute", left:`${15+i*18}%`, top:`${20+(i%3)*25}%`,
            fontSize: 20+i*4, opacity: .06,
            animation: `pulse ${2+i*.5}s ease-in-out infinite`, animationDelay:`${i*.3}s`, pointerEvents:"none"
          }}>⚽</div>
        ))}
      </div>
      <div style={{ background: "#16a34a", padding: "14px 20px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 }}>
          {["🌙 Tournoi Tabaski","📍 Terrain Angleterre","⏰ 16h00","🏆 Le meilleur remporte la gloire"].map(t=>(
            <span key={t} style={{ fontFamily:"'Bebas Neue',cursive", fontSize:16, letterSpacing:1, color:"#fff" }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TEAMS PAGE ───────────────────────────────────────────────────────────────
function TeamsPage({ teams, setTeams, stats, showToast }) {
  const [view, setView] = useState("list"); // list | team | addTeam | addPlayer
  const [selectedId, setSelectedId] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingPlayerId, setEditingPlayerId] = useState(null);

  // Forms
  const emptyTeam = { name: "", color: "#16a34a" };
  const emptyPlayer = { name: "", num: "", pos: "Attaquant" };
  const [teamForm, setTeamForm] = useState(emptyTeam);
  const [playerForm, setPlayerForm] = useState(emptyPlayer);
  const [bulkText, setBulkText] = useState(""); // for bulk player import

  const team = teams.find(t => t.id === selectedId);

  // ── helpers ──
  const saveTeam = () => {
    if (!teamForm.name.trim()) return;
    if (editingTeamId) {
      setTeams(prev => prev.map(t => t.id === editingTeamId ? { ...t, name: teamForm.name.trim(), color: teamForm.color } : t));
      showToast("Équipe modifiée ✓");
      setEditingTeamId(null);
    } else {
      setTeams(prev => [...prev, { id: `t${Date.now()}`, name: teamForm.name.trim(), color: teamForm.color, players: [] }]);
      showToast("Équipe créée ✓");
    }
    setTeamForm(emptyTeam);
    setView("list");
  };

  const deleteTeam = (id) => {
    if (!window.confirm("Supprimer cette équipe ?")) return;
    setTeams(prev => prev.filter(t => t.id !== id));
    setView("list"); setSelectedId(null);
    showToast("Équipe supprimée", "error");
  };

  const startEditTeam = (t) => {
    setEditingTeamId(t.id);
    setTeamForm({ name: t.name, color: t.color });
    setView("addTeam");
  };

  const savePlayer = () => {
    if (!playerForm.name.trim() || !playerForm.num) return;
    const p = { id: `p${Date.now()}`, name: playerForm.name.trim(), num: parseInt(playerForm.num), pos: playerForm.pos };
    if (editingPlayerId) {
      setTeams(prev => prev.map(t => t.id === selectedId
        ? { ...t, players: t.players.map(pl => pl.id === editingPlayerId ? { ...pl, ...p, id: pl.id } : pl) }
        : t));
      showToast("Joueur modifié ✓");
      setEditingPlayerId(null);
    } else {
      setTeams(prev => prev.map(t => t.id === selectedId ? { ...t, players: [...t.players, p] } : t));
      showToast("Joueur ajouté ✓");
    }
    setPlayerForm(emptyPlayer);
    setView("team");
  };

  const startEditPlayer = (pl) => {
    setEditingPlayerId(pl.id);
    setPlayerForm({ name: pl.name, num: pl.num, pos: pl.pos });
    setView("addPlayer");
  };

  const deletePlayer = (pid) => {
    if (!window.confirm("Supprimer ce joueur ?")) return;
    setTeams(prev => prev.map(t => t.id === selectedId ? { ...t, players: t.players.filter(p => p.id !== pid) } : t));
    showToast("Joueur supprimé", "error");
  };

  // Bulk import: each line = "Nom Prénom, numéro, poste"
  const importBulk = () => {
    const lines = bulkText.trim().split("\n").filter(l => l.trim());
    const newPlayers = [];
    lines.forEach(line => {
      const parts = line.split(",").map(s => s.trim());
      const name = parts[0];
      const num = parseInt(parts[1]) || (newPlayers.length + 1);
      const pos = POSITIONS.find(p => parts[2] && parts[2].toLowerCase().includes(p.toLowerCase())) || "Attaquant";
      if (name) newPlayers.push({ id: `p${Date.now()}${Math.random()}`, name, num, pos });
    });
    setTeams(prev => prev.map(t => t.id === selectedId ? { ...t, players: [...t.players, ...newPlayers] } : t));
    setBulkText("");
    showToast(`${newPlayers.length} joueur(s) importé(s) ✓`);
    setView("team");
  };

  // ── RENDER: Team list ──
  if (view === "list") return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
      <PageHeader title="LES" accent="ÉQUIPES" />

      {teams.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: "#9ca3af", marginBottom: 8 }}>AUCUNE ÉQUIPE</h3>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>Ajoutez votre première équipe pour commencer le tournoi.</p>
          <button className="btn-primary" onClick={() => { setEditingTeamId(null); setTeamForm(emptyTeam); setView("addTeam"); }}>+ Créer une Équipe</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, marginBottom: 24 }}>
        {teams.map(t => (
          <div key={t.id} className="card" style={{ cursor: "pointer", transition: "border-color .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = t.color}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#16a34a22"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}
              onClick={() => { setSelectedId(t.id); setView("team"); }}>
              <TeamLogo name={t.name} color={t.color} />
              <div>
                <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, letterSpacing: 1 }}>{t.name}</div>
                <div style={{ color: "#9ca3af", fontSize: 13 }}>{t.players.length} joueur{t.players.length!==1?"s":""}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
              {POSITIONS.map(pos => { const c = t.players.filter(p=>p.pos===pos).length; return c>0?(
                <span key={pos} style={{ background:"#16a34a22",border:"1px solid #16a34a33",borderRadius:50,padding:"2px 10px",fontSize:12,color:"#86efac" }}>{pos}: {c}</span>
              ):null;})}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setSelectedId(t.id); setView("team"); }} style={{
                flex:1, background:"#16a34a22",border:"1px solid #16a34a44",color:"#16a34a",
                borderRadius:8,padding:"8px",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,fontSize:14
              }}>👁 Voir</button>
              <button onClick={() => startEditTeam(t)} style={{
                flex:1, background:"#1d4ed822",border:"1px solid #1d4ed844",color:"#60a5fa",
                borderRadius:8,padding:"8px",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:600,fontSize:14
              }}>✏️ Modifier</button>
              <button onClick={() => deleteTeam(t.id)} style={{
                background:"#dc262622",border:"1px solid #dc262644",color:"#dc2626",
                borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:14
              }}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {teams.length > 0 && (
        <button className="btn-primary" onClick={() => { setEditingTeamId(null); setTeamForm(emptyTeam); setView("addTeam"); }}>
          + Ajouter une Équipe
        </button>
      )}
    </div>
  );

  // ── RENDER: Add/Edit Team form ──
  if (view === "addTeam") return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: "0 16px" }}>
      <BackBtn onClick={() => { setView("list"); setEditingTeamId(null); setTeamForm(emptyTeam); }} />
      <div className="card">
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, marginBottom:24, color:"#16a34a", letterSpacing:2 }}>
          {editingTeamId ? "✏️ MODIFIER L'ÉQUIPE" : "🏆 NOUVELLE ÉQUIPE"}
        </h2>

        <Field label="Nom de l'équipe *">
          <input value={teamForm.name} onChange={e=>setTeamForm(p=>({...p,name:e.target.value}))} placeholder="Ex: Les Lions, FC Quartier..." />
        </Field>

        <div style={{ marginBottom: 20 }}>
          <label>Couleur de l'équipe</label>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:8 }}>
            {COLORS.map(c => (
              <button key={c} onClick={()=>setTeamForm(p=>({...p,color:c}))} style={{
                width:36, height:36, borderRadius:8, background:c, border:`3px solid ${teamForm.color===c?"#fff":"transparent"}`,
                cursor:"pointer", boxShadow: teamForm.color===c?`0 0 10px ${c}`:"none", transition:"all .15s"
              }}/>
            ))}
          </div>
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:12 }}>
            <TeamLogo name={teamForm.name||"???"} color={teamForm.color} size={52} />
            <div>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:18 }}>{teamForm.name||"Aperçu de l'équipe"}</div>
              <div style={{ color:"#9ca3af", fontSize:13 }}>Logo généré automatiquement</div>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-primary" onClick={saveTeam} style={{ flex:1 }}>
            {editingTeamId ? "Enregistrer" : "Créer l'Équipe"}
          </button>
          <button onClick={()=>{setView("list");setEditingTeamId(null);setTeamForm(emptyTeam);}} style={{
            flex:1, background:"#222", color:"#fff", border:"none", borderRadius:8, cursor:"pointer",
            fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16
          }}>Annuler</button>
        </div>
      </div>
    </div>
  );

  // ── RENDER: Team detail ──
  if (view === "team" && team) return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
      <BackBtn onClick={() => setView("list")} />

      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28, flexWrap:"wrap" }}>
        <TeamLogo name={team.name} color={team.color} size={72} />
        <div>
          <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:38, letterSpacing:2 }}>{team.name}</h2>
          <div style={{ color:"#9ca3af" }}>{team.players.length} joueur{team.players.length!==1?"s":""} · min. 22 recommandés</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={()=>startEditTeam(team)} style={{
            background:"#1d4ed822",border:"1px solid #1d4ed844",color:"#60a5fa",
            borderRadius:8,padding:"10px 18px",cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:600
          }}>✏️ Modifier</button>
          <button onClick={()=>deleteTeam(team.id)} className="btn-danger">🗑 Supprimer</button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13 }}>
          <span style={{ color:"#9ca3af" }}>Effectif</span>
          <span style={{ color: team.players.length>=22?"#16a34a":"#fbbf24" }}>{team.players.length}/22 joueurs</span>
        </div>
        <div style={{ background:"#1a1a1a", borderRadius:50, height:8 }}>
          <div style={{
            background: team.players.length>=22?"#16a34a":"linear-gradient(90deg,#fbbf24,#f59e0b)",
            height:8, borderRadius:50, width:`${Math.min(100,(team.players.length/22)*100)}%`, transition:"width .5s"
          }}/>
        </div>
      </div>

      {/* Players grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12, marginBottom:24 }}>
        {[...team.players].sort((a,b)=>a.num-b.num).map(p => {
          const s = stats[p.id]||{goals:0,assists:0,games:0};
          return (
            <div key={p.id} className="card" style={{ display:"flex", alignItems:"center", gap:12 }}>
              <PlayerAvatar name={p.name} num={p.num} color={team.color} />
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
                <div style={{ color:"#9ca3af", fontSize:13 }}>{p.pos}</div>
                <div style={{ display:"flex", gap:10, marginTop:5 }}>
                  <span style={{ color:"#fbbf24", fontSize:12 }}>⚽ {s.goals}</span>
                  <span style={{ color:"#60a5fa", fontSize:12 }}>🎯 {s.assists}</span>
                  <span style={{ color:"#9ca3af", fontSize:12 }}>🎮 {s.games}</span>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                <button onClick={()=>startEditPlayer(p)} style={{
                  background:"#1d4ed822",border:"1px solid #1d4ed844",color:"#60a5fa",
                  borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:13
                }}>✏️</button>
                <button onClick={()=>deletePlayer(p.id)} style={{
                  background:"#dc262622",border:"1px solid #dc262644",color:"#dc2626",
                  borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:13
                }}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <button className="btn-primary" onClick={()=>{setEditingPlayerId(null);setPlayerForm(emptyPlayer);setView("addPlayer")}}>
          + Ajouter un Joueur
        </button>
        <button onClick={()=>setView("bulkImport")} style={{
          background:"transparent", border:"2px solid #16a34a", color:"#16a34a",
          padding:"12px 28px", borderRadius:8, cursor:"pointer",
          fontFamily:"'Bebas Neue',cursive", fontSize:18, letterSpacing:1
        }}>📋 Import Liste</button>
      </div>
    </div>
  );

  // ── RENDER: Add/Edit Player ──
  if (view === "addPlayer") return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: "0 16px" }}>
      <BackBtn onClick={()=>{setView("team");setEditingPlayerId(null);setPlayerForm(emptyPlayer);}} />
      <div className="card">
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, marginBottom:8, color:"#16a34a", letterSpacing:2 }}>
          {editingPlayerId ? "✏️ MODIFIER LE JOUEUR" : "👤 NOUVEAU JOUEUR"}
        </h2>
        {team && <div style={{ color:"#9ca3af", fontSize:13, marginBottom:24 }}>Équipe: {team.name}</div>}

        {/* Preview */}
        {playerForm.name && (
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, padding:14, background:"#16a34a11", borderRadius:12, border:"1px solid #16a34a22" }}>
            <PlayerAvatar name={playerForm.name} num={playerForm.num||"?"} color={team?.color||"#16a34a"} size={56} />
            <div>
              <div style={{ fontWeight:700, fontSize:16 }}>{playerForm.name}</div>
              <div style={{ color:"#9ca3af", fontSize:13 }}>#{playerForm.num||"?"} · {playerForm.pos}</div>
            </div>
          </div>
        )}

        <Field label="Nom complet *">
          <input value={playerForm.name} onChange={e=>setPlayerForm(p=>({...p,name:e.target.value}))} placeholder="Prénom Nom" />
        </Field>
        <Field label="Numéro de maillot *">
          <input type="number" min="1" max="99" value={playerForm.num} onChange={e=>setPlayerForm(p=>({...p,num:e.target.value}))} placeholder="Ex: 10" />
        </Field>
        <Field label="Poste">
          <select value={playerForm.pos} onChange={e=>setPlayerForm(p=>({...p,pos:e.target.value}))}>
            {POSITIONS.map(pos=><option key={pos}>{pos}</option>)}
          </select>
        </Field>

        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          <button className="btn-primary" onClick={savePlayer} style={{ flex:1 }}>
            {editingPlayerId ? "Enregistrer" : "Ajouter le Joueur"}
          </button>
          <button onClick={()=>{setView("team");setEditingPlayerId(null);setPlayerForm(emptyPlayer);}} style={{
            flex:1, background:"#222", color:"#fff", border:"none", borderRadius:8, cursor:"pointer",
            fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16
          }}>Annuler</button>
        </div>
      </div>
    </div>
  );

  // ── RENDER: Bulk Import ──
  if (view === "bulkImport") return (
    <div style={{ maxWidth:580, margin:"40px auto", padding:"0 16px" }}>
      <BackBtn onClick={()=>setView("team")} />
      <div className="card">
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, marginBottom:8, color:"#16a34a", letterSpacing:2 }}>📋 IMPORT LISTE</h2>
        <p style={{ color:"#9ca3af", fontSize:14, marginBottom:20, lineHeight:1.6 }}>
          Collez la liste de vos joueurs, <strong style={{color:"#fff"}}>1 joueur par ligne</strong> :<br/>
          <code style={{ background:"#0d1a0d", padding:"2px 8px", borderRadius:4, fontSize:13 }}>Nom Prénom, numéro, poste</code><br/>
          <span style={{ fontSize:12 }}>Ex: Mamadou Diallo, 9, Attaquant</span><br/>
          <span style={{ fontSize:12 }}>Le poste est optionnel (Attaquant par défaut).</span>
        </p>
        <div style={{ marginBottom:16 }}>
          <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)}
            rows={12} placeholder={"Mamadou Diallo, 1, Gardien\nOumar Sow, 5, Défenseur\nIbrahima Ba, 9, Attaquant\n..."}
            style={{ resize:"vertical", lineHeight:1.8 }} />
        </div>
        <div style={{ color:"#9ca3af", fontSize:13, marginBottom:16 }}>
          {bulkText.trim().split("\n").filter(l=>l.trim()).length} joueur(s) détecté(s)
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn-primary" onClick={importBulk} style={{ flex:1 }}>Importer</button>
          <button onClick={()=>setView("team")} style={{ flex:1, background:"#222", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontFamily:"'Rajdhani',sans-serif", fontWeight:600, fontSize:16 }}>Annuler</button>
        </div>
      </div>
    </div>
  );

  return null;
}

// ─── STATS PAGE ───────────────────────────────────────────────────────────────
function StatsPage({ teams, stats, updateStat, setStats, isAdmin, setIsAdmin, showToast }) {
  const [selTeam, setSelTeam] = useState(null);
  const [pw, setPw] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const ADMIN_PASSWORD = "tabaski2025";
  const team = teams.find(t=>t.id===selTeam) || teams[0];

  useEffect(()=>{ if(teams.length>0 && !selTeam) setSelTeam(teams[0].id); },[teams]);

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setIsAdmin(true); setShowLogin(false); setPw(""); showToast("Mode édition activé ✓"); }
    else showToast("Mot de passe incorrect", "error");
  };

  const decrementStat = (playerId, field) => {
    setStats(prev => {
      const cur = prev[playerId]||{goals:0,assists:0,games:0};
      if ((cur[field]||0) <= 0) return prev;
      return { ...prev, [playerId]: { ...cur, [field]: cur[field] - 1 } };
    });
    showToast("Statistique corrigée");
  };

  if (teams.length === 0) return (
    <EmptyState icon="📊" title="AUCUNE STATISTIQUE" msg="Ajoutez des équipes et des joueurs pour voir les statistiques." />
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:8 }}>
        <PageHeader title="" accent="STATISTIQUES" />
        {/* Admin toggle button */}
        {!isAdmin ? (
          <button onClick={()=>setShowLogin(!showLogin)} style={{
            background:"#16a34a22", border:"1px solid #16a34a55", color:"#16a34a",
            padding:"10px 20px", borderRadius:8, cursor:"pointer",
            fontFamily:"'Bebas Neue',cursive", fontSize:17, letterSpacing:1
          }}>🔐 Modifier les stats</button>
        ) : (
          <button onClick={()=>{ setIsAdmin(false); showToast("Mode édition désactivé"); }} style={{
            background:"#dc262622", border:"1px solid #dc262655", color:"#dc2626",
            padding:"10px 20px", borderRadius:8, cursor:"pointer",
            fontFamily:"'Bebas Neue',cursive", fontSize:17, letterSpacing:1
          }}>🔓 Quitter édition</button>
        )}
      </div>

      {/* Inline login panel */}
      {showLogin && !isAdmin && (
        <div style={{
          background:"#0d1a0d", border:"1px solid #16a34a44", borderRadius:12,
          padding:20, marginBottom:24, maxWidth:360,
          animation:"fadeIn .3s ease"
        }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:18, color:"#16a34a", marginBottom:12, letterSpacing:1 }}>
            🔐 CONNEXION ADMIN
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&login()}
              placeholder="Mot de passe..." style={{ flex:1 }} />
            <button className="btn-primary" onClick={login} style={{ padding:"10px 20px", fontSize:16, whiteSpace:"nowrap" }}>OK</button>
          </div>
        </div>
      )}

      {/* Admin banner */}
      {isAdmin && (
        <div style={{
          background:"#16a34a22", border:"1px solid #16a34a44", borderRadius:10,
          padding:"10px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:8,
          fontFamily:"'Bebas Neue',cursive", fontSize:16, color:"#16a34a", letterSpacing:1
        }}>
          ✅ MODE ÉDITION ACTIF — Cliquez sur les boutons pour modifier les statistiques
        </div>
      )}

      {/* Team tabs */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:28 }}>
        {teams.map(t=>(
          <button key={t.id} onClick={()=>setSelTeam(t.id)} style={{
            background: (selTeam||teams[0]?.id)===t.id ? t.color : "#111",
            border:`1px solid ${t.color}55`, color:"#fff",
            padding:"10px 20px", borderRadius:8, cursor:"pointer",
            fontFamily:"'Bebas Neue',cursive", fontSize:17, letterSpacing:1, transition:"all .2s"
          }}>{t.name}</button>
        ))}
      </div>

      {team && (
        <div style={{ display:"grid", gap:12 }}>
          {[...team.players].sort((a,b)=>a.num-b.num).map(p => {
            const s = stats[p.id]||{goals:0,assists:0,games:0};
            return (
              <div key={p.id} className="card" style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                <PlayerAvatar name={p.name} num={p.num} color={team.color} size={52} />
                <div style={{ flex:1, minWidth:140 }}>
                  <div style={{ fontWeight:700, fontSize:16 }}>{p.name}</div>
                  <div style={{ color:"#9ca3af", fontSize:13 }}>{p.pos}</div>
                </div>
                <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
                  {[
                    {icon:"⚽", label:"Buts",   val:s.goals,   field:"goals",   color:"#fbbf24"},
                    {icon:"🎯", label:"Passes",  val:s.assists, field:"assists", color:"#60a5fa"},
                    {icon:"🎮", label:"Matchs",  val:s.games,   field:"games",   color:"#a78bfa"},
                  ].map(({icon,label,val,field,color})=>(
                    <div key={field} style={{ textAlign:"center", minWidth:60 }}>
                      <div style={{ color, fontSize:28, fontFamily:"'Bebas Neue',cursive", lineHeight:1 }}>{val}</div>
                      <div style={{ color:"#9ca3af", fontSize:11, marginBottom:6 }}>{label}</div>
                      {isAdmin && (
                        <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
                          <button onClick={()=>decrementStat(p.id,field)} style={{
                            background:"#dc262622", border:"1px solid #dc262655",
                            color:"#dc2626", borderRadius:6, padding:"4px 8px", cursor:"pointer",
                            fontSize:14, fontWeight:700, lineHeight:1
                          }}>−</button>
                          <button onClick={()=>updateStat(p.id,field)} style={{
                            background:`${color}22`, border:`1px solid ${color}55`,
                            color, borderRadius:6, padding:"4px 10px", cursor:"pointer",
                            fontSize:14, fontFamily:"'Bebas Neue',cursive", fontWeight:700
                          }}>+{icon}</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── MATCHES PAGE ────────────────────────────────────────────────────────────
function MatchesPage({ teams, matches, setMatches, isAdmin, setIsAdmin, showToast }) {
  const [showForm, setShowForm] = useState(false);
  const [pw, setPw] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const ADMIN_PASSWORD = "tabaski2025";

  const emptyForm = { homeId: teams[0]?.id || "", awayId: teams[1]?.id || "", homeScore: "", awayScore: "", date: new Date().toLocaleDateString("fr-FR"), note: "" };
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setIsAdmin(true); setShowLogin(false); setPw(""); showToast("Mode édition activé ✓"); }
    else showToast("Mot de passe incorrect", "error");
  };

  const getTeam = (id) => teams.find(t => t.id === id);

  const getResult = (m) => {
    if (m.homeScore > m.awayScore) return { winner: m.homeId, label: "Victoire" };
    if (m.awayScore > m.homeScore) return { winner: m.awayId, label: "Victoire" };
    return { winner: null, label: "Nul" };
  };

  const saveMatch = () => {
    if (!form.homeId || !form.awayId || form.homeId === form.awayId) return showToast("Sélectionnez 2 équipes différentes", "error");
    if (form.homeScore === "" || form.awayScore === "") return showToast("Entrez les scores", "error");
    const m = {
      id: editId || `m${Date.now()}`,
      homeId: form.homeId, awayId: form.awayId,
      homeScore: parseInt(form.homeScore), awayScore: parseInt(form.awayScore),
      date: form.date || new Date().toLocaleDateString("fr-FR"),
      note: form.note,
    };
    if (editId) {
      setMatches(prev => prev.map(x => x.id === editId ? m : x));
      showToast("Match modifié ✓");
      setEditId(null);
    } else {
      setMatches(prev => [m, ...prev]);
      showToast("Résultat enregistré ✓");
    }
    setForm(emptyForm);
    setShowForm(false);
  };

  const deleteMatch = (id) => {
    if (!window.confirm("Supprimer ce match ?")) return;
    setMatches(prev => prev.filter(m => m.id !== id));
    showToast("Match supprimé", "error");
  };

  const startEdit = (m) => {
    setForm({ homeId: m.homeId, awayId: m.awayId, homeScore: m.homeScore, awayScore: m.awayScore, date: m.date, note: m.note || "" });
    setEditId(m.id);
    setShowForm(true);
  };

  // Team standings from matches
  const standings = teams.map(t => {
    let pts = 0, w = 0, d = 0, l = 0, gf = 0, ga = 0;
    matches.forEach(m => {
      if (m.homeId === t.id) { gf += m.homeScore; ga += m.awayScore; if (m.homeScore > m.awayScore) { pts += 3; w++; } else if (m.homeScore === m.awayScore) { pts += 1; d++; } else l++; }
      if (m.awayId === t.id) { gf += m.awayScore; ga += m.homeScore; if (m.awayScore > m.homeScore) { pts += 3; w++; } else if (m.homeScore === m.awayScore) { pts += 1; d++; } else l++; }
    });
    const played = w + d + l;
    return { ...t, pts, w, d, l, gf, ga, diff: gf - ga, played };
  }).sort((a, b) => b.pts - a.pts || b.diff - a.diff || b.gf - a.gf);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
        <PageHeader title="⚽" accent="MATCHS" />
        {!isAdmin ? (
          <button onClick={() => setShowLogin(!showLogin)} style={{
            background: "#16a34a22", border: "1px solid #16a34a55", color: "#16a34a",
            padding: "10px 20px", borderRadius: 8, cursor: "pointer",
            fontFamily: "'Bebas Neue',cursive", fontSize: 17, letterSpacing: 1
          }}>🔐 Ajouter résultat</button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(!showForm); }} style={{
              background: showForm ? "#16a34a" : "#16a34a22", border: "1px solid #16a34a55", color: "#fff",
              padding: "10px 20px", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Bebas Neue',cursive", fontSize: 17, letterSpacing: 1
            }}>+ Nouveau Résultat</button>
            <button onClick={() => { setIsAdmin(false); setShowForm(false); showToast("Mode édition désactivé"); }} style={{
              background: "#dc262622", border: "1px solid #dc262655", color: "#dc2626",
              padding: "10px 20px", borderRadius: 8, cursor: "pointer",
              fontFamily: "'Bebas Neue',cursive", fontSize: 17, letterSpacing: 1
            }}>🔓 Quitter</button>
          </div>
        )}
      </div>

      {/* Mini login */}
      {showLogin && !isAdmin && (
        <div style={{ background: "#0d1a0d", border: "1px solid #16a34a44", borderRadius: 12, padding: 20, marginBottom: 24, maxWidth: 360, animation: "fadeIn .3s ease" }}>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, color: "#16a34a", marginBottom: 12, letterSpacing: 1 }}>🔐 CONNEXION ADMIN</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Mot de passe..." style={{ flex: 1 }} />
            <button className="btn-primary" onClick={login} style={{ padding: "10px 20px", fontSize: 16 }}>OK</button>
          </div>
        </div>
      )}

      {/* Add/Edit match form */}
      {showForm && isAdmin && (
        <div className="card" style={{ marginBottom: 28, animation: "fadeIn .3s ease" }}>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 24, color: "#16a34a", letterSpacing: 2, marginBottom: 20 }}>
            {editId ? "✏️ MODIFIER LE MATCH" : "⚽ NOUVEAU RÉSULTAT"}
          </h3>

          {/* Score input - big and visual */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {/* Home team */}
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Équipe 1</label>
              <select value={form.homeId} onChange={e => setForm(p => ({ ...p, homeId: e.target.value }))}>
                <option value="">-- Choisir --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Scores */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
              <input type="number" min="0" max="99" value={form.homeScore}
                onChange={e => setForm(p => ({ ...p, homeScore: e.target.value }))}
                style={{ width: 72, textAlign: "center", fontSize: 32, fontFamily: "'Bebas Neue',cursive", padding: "8px 4px" }}
                placeholder="0" />
              <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: "#9ca3af" }}>—</span>
              <input type="number" min="0" max="99" value={form.awayScore}
                onChange={e => setForm(p => ({ ...p, awayScore: e.target.value }))}
                style={{ width: 72, textAlign: "center", fontSize: 32, fontFamily: "'Bebas Neue',cursive", padding: "8px 4px" }}
                placeholder="0" />
            </div>

            {/* Away team */}
            <div style={{ flex: 1, minWidth: 120 }}>
              <label>Équipe 2</label>
              <select value={form.awayId} onChange={e => setForm(p => ({ ...p, awayId: e.target.value }))}>
                <option value="">-- Choisir --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div>
              <label>Date</label>
              <input value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} placeholder="Ex: 07/06/2025" />
            </div>
            <div>
              <label>Note (optionnel)</label>
              <input value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="Ex: Demi-finale" />
            </div>
          </div>

          {/* Live preview */}
          {form.homeId && form.awayId && form.homeId !== form.awayId && form.homeScore !== "" && form.awayScore !== "" && (
            <div style={{
              background: "#16a34a11", border: "1px solid #16a34a33", borderRadius: 10,
              padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 16, flexWrap: "wrap"
            }}>
              <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18 }}>{getTeam(form.homeId)?.name}</span>
              <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 32, color: "#16a34a" }}>{form.homeScore} — {form.awayScore}</span>
              <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18 }}>{getTeam(form.awayId)?.name}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={saveMatch} style={{ flex: 1, fontSize: 18 }}>
              {editId ? "Enregistrer" : "✅ Valider le Résultat"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} style={{
              flex: 1, background: "#222", color: "#fff", border: "none", borderRadius: 8,
              cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 16
            }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Standings table */}
      {matches.length > 0 && teams.length > 0 && (
        <div className="card" style={{ marginBottom: 24, overflowX: "auto" }}>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 22, color: "#fbbf24", letterSpacing: 2, marginBottom: 16 }}>🏆 TABLEAU</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #16a34a33" }}>
                {["#", "Équipe", "J", "V", "N", "D", "BP", "BC", "Diff", "Pts"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", color: "#9ca3af", textAlign: h === "Équipe" ? "left" : "center", fontFamily: "'Bebas Neue',cursive", fontSize: 15, letterSpacing: 1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standings.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #16a34a11", background: i === 0 ? "#16a34a11" : "transparent" }}>
                  <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Bebas Neue',cursive", fontSize: 16, color: i === 0 ? "#fbbf24" : "#9ca3af" }}>{i + 1}</td>
                  <td style={{ padding: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <TeamLogo name={t.name} color={t.color} size={28} />
                      <span style={{ fontWeight: 700 }}>{t.name}</span>
                    </div>
                  </td>
                  {[t.played, t.w, t.d, t.l, t.gf, t.ga, t.diff > 0 ? `+${t.diff}` : t.diff].map((v, j) => (
                    <td key={j} style={{ padding: "10px", textAlign: "center", color: j === 6 ? (t.diff > 0 ? "#16a34a" : t.diff < 0 ? "#dc2626" : "#9ca3af") : "#fff" }}>{v}</td>
                  ))}
                  <td style={{ padding: "10px", textAlign: "center", fontFamily: "'Bebas Neue',cursive", fontSize: 20, color: "#16a34a" }}>{t.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Match list */}
      {matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🏟️</div>
          <h3 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 28, color: "#9ca3af", marginBottom: 8 }}>AUCUN MATCH</h3>
          <p style={{ color: "#6b7280" }}>Ajoutez le résultat du premier match.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {matches.map(m => {
            const home = getTeam(m.homeId);
            const away = getTeam(m.awayId);
            if (!home || !away) return null;
            const res = getResult(m);
            return (
              <div key={m.id} className="card" style={{ overflow: "hidden" }}>
                {/* Date + note bar */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 4 }}>
                  <span style={{ color: "#9ca3af", fontSize: 13 }}>📅 {m.date}</span>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {m.note && <span style={{ background: "#16a34a22", border: "1px solid #16a34a33", borderRadius: 50, padding: "2px 10px", fontSize: 12, color: "#86efac" }}>{m.note}</span>}
                    <span style={{
                      background: res.winner ? "#16a34a22" : "#f59e0b22",
                      border: `1px solid ${res.winner ? "#16a34a44" : "#f59e0b44"}`,
                      borderRadius: 50, padding: "2px 10px", fontSize: 12,
                      color: res.winner ? "#86efac" : "#fbbf24"
                    }}>{res.label}</span>
                  </div>
                </div>

                {/* Score display */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  {/* Home */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <TeamLogo name={home.name} color={home.color} size={44} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, letterSpacing: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{home.name}</div>
                      {res.winner === home.id && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>VAINQUEUR</div>}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 42, letterSpacing: 4, lineHeight: 1, color: "#fff" }}>
                      <span style={{ color: res.winner === home.id ? "#16a34a" : "#fff" }}>{m.homeScore}</span>
                      <span style={{ color: "#9ca3af", margin: "0 4px" }}>—</span>
                      <span style={{ color: res.winner === away.id ? "#16a34a" : "#fff" }}>{m.awayScore}</span>
                    </div>
                  </div>

                  {/* Away */}
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end", minWidth: 0 }}>
                    <div style={{ textAlign: "right", minWidth: 0 }}>
                      <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 18, letterSpacing: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{away.name}</div>
                      {res.winner === away.id && <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>VAINQUEUR</div>}
                    </div>
                    <TeamLogo name={away.name} color={away.color} size={44} />
                  </div>
                </div>

                {/* Admin actions */}
                {isAdmin && (
                  <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 14, borderTop: "1px solid #16a34a11" }}>
                    <button onClick={() => startEdit(m)} style={{
                      flex: 1, background: "#1d4ed822", border: "1px solid #1d4ed844", color: "#60a5fa",
                      borderRadius: 8, padding: "8px", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 14
                    }}>✏️ Modifier</button>
                    <button onClick={() => deleteMatch(m.id)} style={{
                      background: "#dc262622", border: "1px solid #dc262644", color: "#dc2626",
                      borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 14
                    }}>🗑</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── RANKING PAGE ─────────────────────────────────────────────────────────────
function RankingPage({ scorers, assisters, teams }) {
  const getTeamColor = (teamId) => teams.find(t=>t.id===teamId)?.color||"#16a34a";

  if (teams.length === 0) return (
    <EmptyState icon="🏅" title="AUCUN CLASSEMENT" msg="Ajoutez des équipes, des joueurs et des statistiques pour voir le classement." />
  );

  const RankList = ({ title, icon, players, field, color }) => (
    <div className="card">
      <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:26, letterSpacing:2, marginBottom:20, color }}>{icon} {title}</h3>
      {players.length===0 && <div style={{ color:"#9ca3af", textAlign:"center", padding:20 }}>Aucun résultat pour le moment</div>}
      {players.slice(0,10).map((p,i)=>(
        <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:i<players.length-1?"1px solid #16a34a11":"none" }}>
          <div style={{
            width:32, height:32, borderRadius:"50%", flexShrink:0,
            background:i===0?"linear-gradient(135deg,#fbbf24,#f59e0b)":i===1?"linear-gradient(135deg,#9ca3af,#6b7280)":i===2?"linear-gradient(135deg,#92400e,#78350f)":"#111",
            border:"1px solid #ffffff22", display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"'Bebas Neue',cursive", fontSize:15, color:"#fff"
          }}>{i+1}</div>
          <PlayerAvatar name={p.name} num={p.num} size={44} color={getTeamColor(p.teamId)} />
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700 }}>{p.name}</div>
            <div style={{ color:"#9ca3af", fontSize:13 }}>{p.teamName} · {p.pos}</div>
          </div>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, color, minWidth:40, textAlign:"right" }}>{p.s[field]}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 16px" }}>
      <PageHeader title="" accent="CLASSEMENT" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:20 }}>
        <RankList title="Meilleurs Buteurs" icon="⚽" players={scorers} field="goals" color="#fbbf24" />
        <RankList title="Meilleurs Passeurs" icon="🎯" players={assisters} field="assists" color="#60a5fa" />
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ isAdmin, setIsAdmin, showToast, setPage, teams, stats, setStats }) {
  const [pw, setPw] = useState("");
  const ADMIN_PASSWORD = "tabaski2025";

  const login = () => {
    if (pw === ADMIN_PASSWORD) { setIsAdmin(true); showToast("Bienvenue Admin! ✓"); }
    else showToast("Mot de passe incorrect", "error");
  };

  if (!isAdmin) return (
    <div style={{ maxWidth:400, margin:"80px auto", padding:"0 16px" }}>
      <div className="card">
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🔐</div>
          <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:32, letterSpacing:2 }}>PANNEAU <span style={{ color:"#16a34a" }}>ADMIN</span></h2>
          <p style={{ color:"#9ca3af", fontSize:14 }}>Connexion requise</p>
        </div>
        <Field label="Mot de passe">
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Entrez le mot de passe" />
        </Field>
        <button className="btn-primary" onClick={login} style={{ width:"100%", fontSize:20, marginTop:8 }}>Se Connecter</button>
        <p style={{ color:"#9ca3af", fontSize:12, textAlign:"center", marginTop:12 }}>Mot de passe: tabaski2025</p>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 16px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, flexWrap:"wrap", gap:12 }}>
        <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:42, letterSpacing:3 }}><span style={{ color:"#16a34a" }}>PANNEAU</span> ADMIN</h2>
        <button onClick={()=>{setIsAdmin(false);showToast("Déconnecté");}} style={{
          background:"#dc262622",border:"1px solid #dc262655",color:"#dc2626",
          padding:"8px 20px",borderRadius:8,cursor:"pointer",fontFamily:"'Rajdhani',sans-serif",fontWeight:600
        }}>Déconnexion</button>
      </div>
      <div style={{ width:60, height:4, background:"#16a34a", borderRadius:2, marginBottom:28 }}/>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:32 }}>
        {[
          {icon:"🏆",label:"Gérer les Équipes",action:()=>setPage("teams"),color:"#16a34a"},
          {icon:"📊",label:"Modifier les Stats",action:()=>setPage("stats"),color:"#60a5fa"},
          {icon:"🏅",label:"Voir Classement",action:()=>setPage("ranking"),color:"#fbbf24"},
        ].map(item=>(
          <button key={item.label} onClick={item.action} style={{
            background:`${item.color}11`,border:`1px solid ${item.color}44`,
            color:item.color,padding:"24px 20px",borderRadius:12,cursor:"pointer",
            fontFamily:"'Bebas Neue',cursive",fontSize:20,letterSpacing:1,
            transition:"all .2s",textAlign:"center"
          }}
            onMouseEnter={e=>e.currentTarget.style.background=`${item.color}22`}
            onMouseLeave={e=>e.currentTarget.style.background=`${item.color}11`}
          >
            <div style={{ fontSize:36, marginBottom:8 }}>{item.icon}</div>{item.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, marginBottom:12, color:"#9ca3af" }}>ℹ️ ÉTAT DU TOURNOI</h3>
        <div style={{ color:"#9ca3af", fontSize:14, lineHeight:2 }}>
          <p>• Équipes: <span style={{ color:"#fff" }}>{teams.length}</span></p>
          <p>• Total joueurs: <span style={{ color:"#fff" }}>{teams.reduce((a,t)=>a+t.players.length,0)}</span></p>
          <p>• Stockage: <span style={{ color:"#16a34a" }}>Navigateur (localStorage)</span></p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:22, marginBottom:16, color:"#dc2626" }}>⚡ RÉINITIALISER</h3>
        <p style={{ color:"#9ca3af", marginBottom:16, fontSize:14 }}>Attention : supprime toutes les statistiques.</p>
        <button className="btn-danger" onClick={()=>{
          if(window.confirm("Réinitialiser toutes les stats?")){ setStats({}); showToast("Stats réinitialisées","error"); }
        }}>🗑 Réinitialiser les statistiques</button>
      </div>
    </div>
  );
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
function PageHeader({ title, accent }) {
  return (
    <>
      <h2 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:42, letterSpacing:3, marginBottom:8 }}>
        {title && <span>{title} </span>}<span style={{ color:"#16a34a" }}>{accent}</span>
      </h2>
      <div style={{ width:60, height:4, background:"#16a34a", borderRadius:2, marginBottom:28 }}/>
    </>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{
      background:"none", border:"1px solid #16a34a55", color:"#16a34a",
      padding:"8px 20px", borderRadius:8, cursor:"pointer", marginBottom:24,
      fontFamily:"'Rajdhani',sans-serif", fontWeight:600, display:"flex", alignItems:"center", gap:6
    }}>← Retour</button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon, title, msg }) {
  return (
    <div style={{ textAlign:"center", padding:"80px 20px" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>{icon}</div>
      <h3 style={{ fontFamily:"'Bebas Neue',cursive", fontSize:28, color:"#9ca3af", marginBottom:8 }}>{title}</h3>
      <p style={{ color:"#6b7280" }}>{msg}</p>
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop:"1px solid #16a34a22", marginTop:60, padding:"32px 20px", textAlign:"center" }}>
      <div style={{ fontSize:28, marginBottom:8 }}>⚽</div>
      <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:20, letterSpacing:3, color:"#16a34a", marginBottom:4 }}>TOURNOI TABASKI</div>
      <div style={{ color:"#9ca3af", fontSize:13 }}>Terrain Angleterre · 16h00 · 2ème jour Tabaski</div>
      <div style={{ color:"#6b7280", fontSize:12, marginTop:16, borderTop:"1px solid #16a34a11", paddingTop:16 }}>
        Créé par <span style={{ color:"#16a34a", fontWeight:700 }}>Daziz Design</span>
      </div>
    </footer>
  );
}
