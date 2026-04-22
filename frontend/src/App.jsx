import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"
const categories = ["general", "passwords", "notes", "personal", "financial"]

const s = {
  app: {
    minHeight: "100vh",
    background: "#080808",
    color: "#d0d0d0",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "0",
  },
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "#0f0f0f",
    borderRight: "1px solid #1a1a1a",
    padding: "32px 0",
    position: "fixed",
    top: 0,
    left: 0,
  },
  main: {
    marginLeft: 220,
    padding: "40px 48px",
    maxWidth: 760,
  },
  logo: {
    padding: "0 24px 32px",
    borderBottom: "1px solid #1a1a1a",
    marginBottom: 8,
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#fff",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  logoSub: {
    fontSize: 11,
    color: "#333",
    margin: "4px 0 0",
    fontFamily: "monospace",
  },
  navItem: (active) => ({
    display: "block",
    width: "100%",
    padding: "10px 24px",
    background: active ? "#161616" : "transparent",
    border: "none",
    borderLeft: active ? "2px solid #fff" : "2px solid transparent",
    color: active ? "#fff" : "#555",
    fontSize: 13,
    textAlign: "left",
    cursor: "pointer",
    letterSpacing: "-0.01em",
  }),
  pageTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
    margin: "0 0 4px",
    letterSpacing: "-0.03em",
  },
  pageSub: {
    fontSize: 12,
    color: "#3a3a3a",
    margin: "0 0 32px",
    fontFamily: "monospace",
  },
  input: {
    width: "100%",
    background: "#0f0f0f",
    border: "1px solid #1e1e1e",
    borderRadius: 6,
    color: "#d0d0d0",
    padding: "10px 14px",
    fontSize: 13,
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    width: "100%",
    height: 100,
    background: "#0f0f0f",
    border: "1px solid #1e1e1e",
    borderRadius: 6,
    color: "#d0d0d0",
    padding: "10px 14px",
    fontSize: 13,
    fontFamily: "inherit",
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
  },
  select: {
    background: "#0f0f0f",
    border: "1px solid #1e1e1e",
    borderRadius: 6,
    color: "#d0d0d0",
    padding: "10px 14px",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
  },
  btn: {
    padding: "10px 20px",
    background: "#fff",
    border: "none",
    borderRadius: 6,
    color: "#000",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnGhost: {
    padding: "6px 12px",
    background: "transparent",
    border: "1px solid #1e1e1e",
    borderRadius: 4,
    color: "#555",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnDanger: {
    padding: "6px 12px",
    background: "transparent",
    border: "1px solid #2a1a1a",
    borderRadius: 4,
    color: "#553333",
    fontSize: 11,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  card: {
    background: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: 8,
    padding: "16px 20px",
    marginBottom: 8,
  },
  label: {
    fontSize: 11,
    color: "#333",
    marginBottom: 6,
    display: "block",
    fontFamily: "monospace",
  },
  field: {
    marginBottom: 16,
  },
  stat: {
    background: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: 8,
    padding: "20px 24px",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: "#333",
    margin: "0 0 6px",
    fontFamily: "monospace",
  },
  statValue: {
    fontSize: 13,
    color: "#888",
    margin: 0,
  },
  success: {
    fontSize: 12,
    color: "#2a4a2a",
    fontFamily: "monospace",
    marginTop: 8,
  }
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

  useEffect(() => {
    fetchRecords()
    fetchStats()
  }, [])

  async function fetchRecords() {
    try {
      const res = await axios.get(`${API}/records`)
      setRecords(res.data.records)
    } catch {}
  }

  async function fetchStats() {
    try {
      const res = await axios.get(`${API}/stats`)
      setVaultStats(res.data)
    } catch {}
  }

  async function handleStore() {
    if (!storeData.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/store`, { data: storeData, category: storeCategory })
      setStoreMsg(`stored — id ${res.data.id}`)
      setStoreData("")
      fetchRecords()
      fetchStats()
    } catch { setStoreMsg("error storing record") }
    setLoading(false)
  }

  async function handleDelete(id) {
    try {
      await axios.delete(`${API}/records/${id}`)
      fetchRecords()
      fetchStats()
    } catch {}
  }

  async function handleSearch() {
    if (!searchKeyword.trim()) return
    setLoading(true)
    const res = await axios.post(`${API}/search`, { keyword: searchKeyword, epsilon })
    setSearchResults(res.data)
    setLoading(false)
  }

  async function handlePrivateStats() {
    setLoading(true)
    const res = await axios.post(`${API}/private-stats`, { epsilon })
    setPrivateStats(res.data)
    setLoading(false)
  }

  return (
    <div style={s.app}>
      <div style={s.sidebar}>
        <div style={s.logo}>
          <p style={s.logoTitle}>Vault</p>
          <p style={s.logoSub}>AES-256-GCM + DP</p>
          {vaultStats && (
            <p style={{ ...s.logoSub, marginTop: 8 }}>{vaultStats.total_records} records</p>
          )}
        </div>
        {["store", "records", "search", "privacy"].map(t => (
          <button key={t} style={s.navItem(tab === t)} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div style={s.main}>

        {tab === "store" && (
          <>
            <p style={s.pageTitle}>Store</p>
            <p style={s.pageSub}>encrypted before writing to disk</p>
            <div style={s.field}>
              <label style={s.label}>data</label>
              <textarea style={s.textarea} value={storeData}
                onChange={e => setStoreData(e.target.value)}
                placeholder="enter data to encrypt..." />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={s.field}>
                <label style={s.label}>category</label>
                <select style={s.select} value={storeCategory}
                  onChange={e => setStoreCategory(e.target.value)}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button style={{ ...s.btn, marginTop: 8 }} onClick={handleStore} disabled={loading}>
                {loading ? "encrypting..." : "encrypt + store"}
              </button>
            </div>
            {storeMsg && <p style={s.success}>{storeMsg}</p>}
          </>
        )}

        {tab === "records" && (
          <>
            <p style={s.pageTitle}>Records</p>
            <p style={s.pageSub}>decrypted — local only</p>
            {records.length === 0 ? (
              <p style={{ color: "#2a2a2a", fontSize: 13 }}>no records yet</p>
            ) : records.map(r => (
              <div key={r.id} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: "#2a2a2a", fontFamily: "monospace" }}>#{r.id}</span>
                      <span style={{ fontSize: 11, color: "#2a2a2a", fontFamily: "monospace" }}>{r.category}</span>
                      <span style={{ fontSize: 11, color: "#2a2a2a", fontFamily: "monospace" }}>{r.timestamp.split("T")[0]}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: "#ccc", lineHeight: 1.5 }}>{r.data}</p>
                  </div>
                  <button style={s.btnDanger} onClick={() => handleDelete(r.id)}>delete</button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "search" && (
          <>
            <p style={s.pageTitle}>Search</p>
            <p style={s.pageSub}>result count is differentially private</p>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input style={{ ...s.input, flex: 1 }} value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="keyword..." />
              <button style={s.btn} onClick={handleSearch}>search</button>
            </div>
            {searchResults && (
              <>
                <p style={{ fontSize: 11, color: "#2a2a2a", fontFamily: "monospace", marginBottom: 12 }}>
                  true: {searchResults.true_count} | private: {searchResults.private_count} | epsilon: {epsilon}
                </p>
                {searchResults.matches.map(r => (
                  <div key={r.id} style={s.card}>
                    <span style={{ fontSize: 11, color: "#2a2a2a", fontFamily: "monospace" }}>#{r.id} [{r.category}]  </span>
                    <span style={{ fontSize: 13, color: "#ccc" }}>{r.data}</span>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {tab === "privacy" && (
          <>
            <p style={s.pageTitle}>Privacy</p>
            <p style={s.pageSub}>differentially private vault statistics</p>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>epsilon</span>
              <input type="range" min="0.1" max="10" step="0.1" value={epsilon}
                onChange={e => setEpsilon(parseFloat(e.target.value))}
                style={{ flex: 1 }} />
              <span style={{ fontSize: 12, color: "#555", minWidth: 28, fontFamily: "monospace" }}>{epsilon}</span>
              <button style={s.btn} onClick={handlePrivateStats}>query</button>
            </div>
            <p style={{ fontSize: 11, color: "#222", fontFamily: "monospace", marginBottom: 24 }}>
              lower epsilon = stronger privacy, higher noise
            </p>
            {privateStats && (
              <>
                <div style={s.stat}>
                  <p style={s.statLabel}>total records</p>
                  <p style={s.statValue}>
                    true: {privateStats.total.true_count} &nbsp;|&nbsp;
                    private: {privateStats.total.private_count} &nbsp;|&nbsp;
                    noise: {privateStats.total.noise_added}
                  </p>
                </div>
                {Object.entries(privateStats.distribution).map(([cat, stats]) => (
                  <div key={cat} style={s.stat}>
                    <p style={s.statLabel}>{cat}</p>
                    <p style={s.statValue}>
                      true: {stats.true_count} &nbsp;|&nbsp; private: {stats.private_count}
                    </p>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}