import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"
const categories = ["general", "passwords", "notes", "personal", "financial"]

const categoryColors = {
  passwords: "#1a2a1a",
  notes: "#1a1a2a",
  personal: "#2a1a1a",
  financial: "#2a2a1a",
  general: "#1e1e1e"
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
      setStoreMsg(`stored — id ${r.data.id}`)
      setStoreData(""); fetchRecords(); fetchStats()
    } catch { setStoreMsg("error") }
    setLoading(false)
  }
  async function handleDelete(id) {
    try { await axios.delete(`${API}/records/${id}`); fetchRecords(); fetchStats() } catch {}
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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#111113", color: "#e0e0e0", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <div style={{ width: 220, background: "#0d0d0f", borderRight: "1px solid #1f1f22", padding: "32px 0", position: "fixed", top: 0, left: 0, height: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1f1f22", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2d5a2d" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f0", letterSpacing: "-0.01em" }}>Private Vault</span>
          </div>
          <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>AES-256-GCM + DP</div>
          {vaultStats && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#141416", borderRadius: 6, border: "1px solid #1f1f22" }}>
              <div style={{ fontSize: 11, color: "#555" }}>records</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: "#e0e0e0", marginTop: 2 }}>{vaultStats.total_records}</div>
            </div>
          )}
        </div>
        <nav style={{ padding: "8px 12px" }}>
          {["store", "records", "search", "privacy"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              padding: "9px 12px", marginBottom: 2,
              background: tab === t ? "#1a1a1e" : "transparent",
              border: "none", borderRadius: 6,
              color: tab === t ? "#e0e0e0" : "#555",
              fontSize: 13, textAlign: "left", cursor: "pointer", fontFamily: "inherit"
            }}>
              <span style={{ fontSize: 15 }}>
                {t === "store" ? "+" : t === "records" ? "≡" : t === "search" ? "⌕" : "◎"}
              </span>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ marginLeft: 220, flex: 1, padding: "48px 56px", maxWidth: 780, textAlign: "left" }}>

        {tab === "store" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Store</h1>
            
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 32px", fontFamily: "monospace" }}>AES-256-GCM encrypted before writing to disk</p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 500 }}>Data</label>
              <textarea value={storeData} onChange={e => setStoreData(e.target.value)}
                placeholder="Enter data to encrypt and store..."
                style={{ width: "100%", height: 120, background: "#0d0d0f", border: "1px solid #222226", borderRadius: 8, color: "#e0e0e0", padding: "12px 16px", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 8, fontWeight: 500 }}>Category</label>
                <select value={storeCategory} onChange={e => setStoreCategory(e.target.value)}
                  style={{ background: "#0d0d0f", border: "1px solid #222226", borderRadius: 8, color: "#e0e0e0", padding: "10px 14px", fontSize: 13, fontFamily: "inherit", outline: "none" }}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={handleStore} disabled={loading}
                style={{ padding: "10px 20px", background: "#1a1a1e", border: "1px solid #2a2a30", borderRadius: 8, color: "#e0e0e0", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                {loading ? "Encrypting..." : "Encrypt + Store"}
              </button>
            </div>
            {storeMsg && <p style={{ fontSize: 12, color: "#3a6a3a", marginTop: 12, fontFamily: "monospace" }}>{storeMsg}</p>}
          </div>
        )}

        {tab === "records" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Records</h1>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 32px", fontFamily: "monospace" }}>Decrypted in memory, never written as plaintext</p>
            {records.length === 0
              ? <p style={{ color: "#333", fontSize: 14 }}>No records stored yet.</p>
              : records.map(r => (
                <div key={r.id} style={{ background: categoryColors[r.category] || "#1e1e1e", border: "1px solid #222226", borderRadius: 10, padding: "16px 20px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>#{r.id}</span>
                      <span style={{ fontSize: 11, color: "#555", background: "#111113", padding: "2px 8px", borderRadius: 4, border: "1px solid #1f1f22" }}>{r.category}</span>
                      <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>{r.timestamp.split("T")[0]}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: "#d0d0d0", lineHeight: 1.6 }}>{r.data}</p>
                  </div>
                  <button onClick={() => handleDelete(r.id)}
                    style={{ background: "transparent", border: "1px solid #2a1a1a", borderRadius: 6, color: "#4a2a2a", fontSize: 11, cursor: "pointer", fontFamily: "inherit", padding: "4px 10px", marginLeft: 16 }}>
                    Delete
                  </button>
                </div>
              ))
            }
          </div>
        )}

        {tab === "search" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Search</h1>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 32px", fontFamily: "monospace" }}>Result count is differentially private</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <input value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)}
                placeholder="Search keyword..."
                style={{ flex: 1, background: "#0d0d0f", border: "1px solid #222226", borderRadius: 8, color: "#e0e0e0", padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
              <button onClick={handleSearch}
                style={{ padding: "10px 20px", background: "#1a1a1e", border: "1px solid #2a2a30", borderRadius: 8, color: "#e0e0e0", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Search
              </button>
            </div>
            {searchResults && (
              <div>
                <div style={{ fontSize: 12, color: "#555", fontFamily: "monospace", marginBottom: 16, padding: "10px 14px", background: "#0d0d0f", borderRadius: 8, border: "1px solid #1f1f22" }}>
                  true: {searchResults.true_count} | private: {searchResults.private_count} | epsilon: {epsilon}
                </div>
                {searchResults.matches.map(r => (
                  <div key={r.id} style={{ background: "#1a1a1e", border: "1px solid #222226", borderRadius: 8, padding: "12px 16px", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#555", fontFamily: "monospace" }}>#{r.id} [{r.category}] &nbsp;</span>
                    <span style={{ fontSize: 14, color: "#d0d0d0" }}>{r.data}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "privacy" && (
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#f0f0f0", margin: "0 0 4px", letterSpacing: "-0.02em" }}>Privacy</h1>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 32px", fontFamily: "monospace" }}>Laplace mechanism — noise = sensitivity / epsilon</p>
            <div style={{ background: "#0d0d0f", border: "1px solid #222226", borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 12, fontWeight: 500 }}>Privacy Budget (epsilon)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>private</span>
                <input type="range" min="0.1" max="10" step="0.1" value={epsilon}
                  onChange={e => setEpsilon(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#555" }} />
                <span style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>accurate</span>
                <span style={{ fontSize: 14, color: "#e0e0e0", fontFamily: "monospace", fontWeight: 600, minWidth: 28 }}>{epsilon}</span>
              </div>
              <button onClick={handlePrivateStats}
                style={{ marginTop: 16, padding: "10px 20px", background: "#1a1a1e", border: "1px solid #2a2a30", borderRadius: 8, color: "#e0e0e0", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                Run Query
              </button>
            </div>
            {privateStats && (
              <div>
                <div style={{ background: "#0d0d0f", border: "1px solid #222226", borderRadius: 10, padding: "16px 20px", marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Total records</div>
                  <div style={{ fontSize: 13, color: "#888", fontFamily: "monospace" }}>
                    true: {privateStats.total.true_count} | private: {privateStats.total.private_count} | noise: {privateStats.total.noise_added}
                  </div>
                </div>
                {Object.entries(privateStats.distribution).map(([cat, stats]) => (
                  <div key={cat} style={{ background: "#0d0d0f", border: "1px solid #222226", borderRadius: 10, padding: "16px 20px", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{cat}</div>
                    <div style={{ fontSize: 13, color: "#888", fontFamily: "monospace" }}>
                      true: {stats.true_count} | private: {stats.private_count}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}