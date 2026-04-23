import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"
const categories = ["general", "passwords", "notes", "personal", "financial"]

const categoryConfig = {
  passwords: { color: "#22c55e", bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.15)" },
  notes: { color: "#60a5fa", bg: "rgba(96,165,250,0.06)", border: "rgba(96,165,250,0.15)" },
  personal: { color: "#f472b6", bg: "rgba(244,114,182,0.06)", border: "rgba(244,114,182,0.15)" },
  financial: { color: "#fbbf24", bg: "rgba(251,191,36,0.06)", border: "rgba(251,191,36,0.15)" },
  general: { color: "#94a3b8", bg: "rgba(148,163,184,0.06)", border: "rgba(148,163,184,0.15)" }
}

const navItems = [
  { id: "store", label: "Store", icon: "+" },
  { id: "records", label: "Records", icon: "=" },
  { id: "search", label: "Search", icon: "~" },
  { id: "privacy", label: "Privacy", icon: "o" },
]

const accent = "#818cf8"

function RecordCard({ r, onDelete, onEdit }) {
  const cfg = categoryConfig[r.category] || categoryConfig.general
  const [visible, setVisible] = useState(r.category !== "passwords")
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState(r.data)
  const [editCategory, setEditCategory] = useState(r.category)

  function handleCopy() {
    navigator.clipboard.writeText(r.data)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSave() {
    onEdit(r.id, editData, editCategory)
    setEditing(false)
  }

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "16px 20px", marginBottom: 10 }}>
      {editing ? (
        <div>
          <textarea value={editData} onChange={e => setEditData(e.target.value)}
            style={{ width: "100%", height: 80, background: "#0e0e10", border: `1px solid ${accent}`, borderRadius: 8, color: "#e2e8f0", padding: "10px 12px", fontSize: 13, fontFamily: "inherit", resize: "none", outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={editCategory} onChange={e => setEditCategory(e.target.value)}
              style={{ background: "#0e0e10", border: "1px solid #1e1e24", borderRadius: 6, color: "#e2e8f0", padding: "6px 10px", fontSize: 12, fontFamily: "inherit", outline: "none" }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={handleSave} style={{ padding: "6px 14px", background: accent, border: "none", borderRadius: 6, color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ padding: "6px 14px", background: "transparent", border: "1px solid #2a2a30", borderRadius: 6, color: "#64748b", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
                <span style={{ fontSize: 11, color: cfg.color, fontWeight: 500, background: `${cfg.color}18`, padding: "2px 8px", borderRadius: 4 }}>{r.category}</span>
                <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>#{r.id}</span>
                <span style={{ fontSize: 11, color: "#334155", fontFamily: "monospace" }}>{r.timestamp.split("T")[0]}</span>
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#cbd5e1", lineHeight: 1.6, fontFamily: r.category === "passwords" ? "monospace" : "inherit", letterSpacing: r.category === "passwords" && !visible ? "0.15em" : "normal" }}>
                {visible ? r.data : "•".repeat(Math.min(r.data.length, 20))}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6, marginLeft: 16, flexShrink: 0 }}>
              <button onClick={() => setVisible(!visible)}
                style={{ padding: "4px 10px", background: "transparent", border: "1px solid #1e1e24", borderRadius: 6, color: "#475569", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                {visible ? "Hide" : "Show"}
              </button>
              <button onClick={handleCopy}
                style={{ padding: "4px 10px", background: copied ? "rgba(34,197,94,0.1)" : "transparent", border: copied ? "1px solid rgba(34,197,94,0.3)" : "1px solid #1e1e24", borderRadius: 6, color: copied ? "#22c55e" : "#475569", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                {copied ? "Copied" : "Copy"}
              </button>
              <button onClick={() => setEditing(true)}
                style={{ padding: "4px 10px", background: "transparent", border: "1px solid #1e1e24", borderRadius: 6, color: "#475569", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                Edit
              </button>
              <button onClick={() => onDelete(r.id)}
                style={{ padding: "4px 10px", background: "transparent", border: "1px solid #2d1a1a", borderRadius: 6, color: "#5a3030", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState("store")
  const [records, setRecords] = useState([])
  const [vaultStats, setVaultStats] = useState(null)
  const [storeData, setStoreData] = useState("")
  const [storeCategory, setStoreCategory] = useState("general")
  const [storeMsg, setStoreMsg] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [epsilon, setEpsilon] = useState(1.0)
  const [privateStats, setPrivateStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exportMsg, setExportMsg] = useState("")

  useEffect(() => { fetchRecords(); fetchStats() }, [])

  async function fetchRecords() {
    try { const r = await axios.get(`${API}/records`); setRecords(r.data.records) } catch {}
  }
  async function fetchStats() {
    try { const r = await axios.get(`${API}/stats`); setVaultStats(r.data) } catch {}
  }
  async function handleStore() {
    if (!storeData.trim()) return
    setLoading(true)
    try {
      const r = await axios.post(`${API}/store`, { data: storeData, category: storeCategory })
      setStoreMsg(`Stored successfully -- ID ${r.data.id}`)
      setStoreData(""); fetchRecords(); fetchStats()
    } catch { setStoreMsg("Error storing record") }
    setLoading(false)
  }
  async function handleDelete(id) {
    try { await axios.delete(`${API}/records/${id}`); fetchRecords(); fetchStats() } catch {}
  }
  async function handleEdit(id, newData, newCategory) {
    try {
      await axios.put(`${API}/records/${id}`, { data: newData, category: newCategory })
      fetchRecords()
    } catch {}
  }
  async function handleSearch() {
    if (!searchKeyword.trim()) return
    setLoading(true)
    const r = await axios.post(`${API}/search`, { keyword: searchKeyword, epsilon })
    setSearchResults(r.data); setLoading(false)
  }
  async function handlePrivateStats() {
    setLoading(true)
    const r = await axios.post(`${API}/private-stats`, { epsilon })
    setPrivateStats(r.data); setLoading(false)
  }
  async function handleExport() {
    try {
      const r = await axios.get(`${API}/export`)
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vault-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      setExportMsg("Export downloaded")
      setTimeout(() => setExportMsg(""), 3000)
    } catch { setExportMsg("Export failed") }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0e0e10", color: "#e2e8f0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <div style={{ width: 230, background: "#0a0a0c", borderRight: "1px solid #1e1e24", padding: "28px 0", position: "fixed", top: 0, left: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 20px 24px", borderBottom: "1px solid #1e1e24", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, #4f46e5, #818cf8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff", fontWeight: 700 }}>V</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>Private Vault</div>
              <div style={{ fontSize: 10, color: "#334155", fontFamily: "monospace" }}>AES-256-GCM + DP</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ padding: "10px 12px", background: "#111116", borderRadius: 8, border: "1px solid #1e1e24" }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>Records</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: accent }}>{vaultStats?.total_records ?? 0}</div>
            </div>
            <div style={{ padding: "10px 12px", background: "#111116", borderRadius: 8, border: "1px solid #1e1e24" }}>
              <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>Status</div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#22c55e", display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                Locked
              </div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "0 12px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "10px 12px", marginBottom: 2,
              background: tab === item.id ? "rgba(129,140,248,0.1)" : "transparent",
              border: "none",
              borderLeft: tab === item.id ? `2px solid ${accent}` : "2px solid transparent",
              borderRadius: tab === item.id ? "0 8px 8px 0" : 8,
              color: tab === item.id ? accent : "#475569",
              fontSize: 13, fontWeight: tab === item.id ? 500 : 400,
              textAlign: "left", cursor: "pointer", fontFamily: "inherit"
            }}>
              <span style={{ fontSize: 15, fontFamily: "monospace" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 20px", borderTop: "1px solid #1e1e24" }}>
          <div style={{ fontSize: 10, color: "#334155", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Categories</div>
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
              <span style={{ fontSize: 11, color: "#475569" }}>{key}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginLeft: 230, flex: 1, padding: "48px 56px", maxWidth: 800 }}>

        {tab === "store" && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px", letterSpacing: "-0.03em" }}>Store</h1>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 32px", fontFamily: "monospace" }}>Encrypted with AES-256-GCM before writing to disk</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 500 }}>Data</label>
              <textarea value={storeData} onChange={e => setStoreData(e.target.value)}
                placeholder="Enter data to encrypt and store..."
                style={{ width: "100%", height: 130, background: "#111116", border: "1px solid #1e1e24", borderRadius: 10, color: "#e2e8f0", padding: "14px 16px", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e => e.target.style.borderColor = "#1e1e24"} />
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 500 }}>Category</label>
                <select value={storeCategory} onChange={e => setStoreCategory(e.target.value)}
                  style={{ background: "#111116", border: "1px solid #1e1e24", borderRadius: 8, color: "#e2e8f0", padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={handleStore} disabled={loading}
                style={{ padding: "10px 22px", background: accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Encrypting..." : "Encrypt + Store"}
              </button>
            </div>
            {storeMsg && (
              <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, fontSize: 12, color: "#22c55e", fontFamily: "monospace" }}>
                {storeMsg}
              </div>
            )}
          </div>
        )}

        {tab === "records" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: 0, letterSpacing: "-0.03em" }}>Records</h1>
              <button onClick={handleExport}
                style={{ padding: "8px 16px", background: "transparent", border: "1px solid #1e1e24", borderRadius: 8, color: "#475569", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Export
              </button>
            </div>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 32px", fontFamily: "monospace" }}>Decrypted in memory -- never written as plaintext</p>
            {exportMsg && <div style={{ marginBottom: 16, padding: "10px 14px", background: "rgba(129,140,248,0.08)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: 8, fontSize: 12, color: accent, fontFamily: "monospace" }}>{exportMsg}</div>}
            {records.length === 0
              ? <p style={{ color: "#334155", fontSize: 14 }}>No records stored yet.</p>
              : records.map(r => <RecordCard key={r.id} r={r} onDelete={handleDelete} onEdit={handleEdit} />)
            }
          </div>
        )}

        {tab === "search" && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px", letterSpacing: "-0.03em" }}>Search</h1>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 32px", fontFamily: "monospace" }}>Result count is differentially private</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                placeholder="Search keyword..."
                style={{ flex: 1, background: "#111116", border: "1px solid #1e1e24", borderRadius: 8, color: "#e2e8f0", padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none" }}
                onFocus={e => e.target.style.borderColor = accent}
                onBlur={e => e.target.style.borderColor = "#1e1e24"} />
              <button onClick={handleSearch}
                style={{ padding: "10px 22px", background: accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Search
              </button>
            </div>
            {searchResults && (
              <div>
                <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace", marginBottom: 16, padding: "10px 14px", background: "#111116", borderRadius: 8, border: "1px solid #1e1e24" }}>
                  true: {searchResults.true_count} | private: {searchResults.private_count} | epsilon: {epsilon}
                </div>
                {searchResults.matches.map(r => {
                  const cfg = categoryConfig[r.category] || categoryConfig.general
                  return (
                    <div key={r.id} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: cfg.color, fontFamily: "monospace" }}>#{r.id} [{r.category}] </span>
                      <span style={{ fontSize: 14, color: "#cbd5e1" }}>{r.data}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {tab === "privacy" && (
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: "0 0 4px", letterSpacing: "-0.03em" }}>Privacy</h1>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 32px", fontFamily: "monospace" }}>Laplace mechanism -- noise = sensitivity / epsilon</p>
            <div style={{ background: "#111116", border: "1px solid #1e1e24", borderRadius: 12, padding: "24px", marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 16, fontWeight: 500 }}>Privacy Budget (epsilon)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#22c55e", fontFamily: "monospace", minWidth: 50 }}>private</span>
                <input type="range" min="0.1" max="10" step="0.1" value={epsilon}
                  onChange={e => setEpsilon(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: accent }} />
                <span style={{ fontSize: 11, color: "#ef4444", fontFamily: "monospace", minWidth: 50, textAlign: "right" }}>accurate</span>
                <span style={{ fontSize: 16, color: accent, fontFamily: "monospace", fontWeight: 700, minWidth: 32 }}>{epsilon}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155", fontFamily: "monospace", marginBottom: 20 }}>
                <span>stronger privacy, more noise</span>
                <span>weaker privacy, less noise</span>
              </div>
              <button onClick={handlePrivateStats}
                style={{ padding: "10px 22px", background: accent, border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Run Query
              </button>
            </div>
            {privateStats && (
              <div>
                <div style={{ background: "#111116", border: "1px solid #1e1e24", borderRadius: 10, padding: "16px 20px", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>
                    true: <span style={{ color: "#e2e8f0" }}>{privateStats.total.true_count}</span> | private: <span style={{ color: accent }}>{privateStats.total.private_count}</span> | noise: <span style={{ color: "#64748b" }}>{privateStats.total.noise_added}</span>
                  </div>
                </div>
                {Object.entries(privateStats.distribution).map(([cat, stats]) => {
                  const cfg = categoryConfig[cat] || categoryConfig.general
                  return (
                    <div key={cat} style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
                        <span style={{ fontSize: 11, color: cfg.color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{cat}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>
                        true: <span style={{ color: "#e2e8f0" }}>{stats.true_count}</span> | private: <span style={{ color: cfg.color }}>{stats.private_count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}