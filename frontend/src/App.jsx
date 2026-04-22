import { useState, useEffect } from "react"
import axios from "axios"

const API = "http://localhost:8000"

const categories = ["general", "passwords", "notes", "personal", "financial"]

function App() {
  const [records, setRecords] = useState([])
  const [activeTab, setActiveTab] = useState("store")
  const [storeData, setStoreData] = useState("")
  const [storeCategory, setStoreCategory] = useState("general")
  const [storeMsg, setStoreMsg] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [searchResults, setSearchResults] = useState(null)
  const [epsilon, setEpsilon] = useState(1.0)
  const [privateStats, setPrivateStats] = useState(null)
  const [vaultStats, setVaultStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRecords()
    fetchVaultStats()
  }, [])

  async function fetchRecords() {
    const res = await axios.get(`${API}/records`)
    setRecords(res.data.records)
  }

  async function fetchVaultStats() {
    const res = await axios.get(`${API}/stats`)
    setVaultStats(res.data)
  }

  async function handleStore() {
    if (!storeData.trim()) return
    setLoading(true)
    try {
      const res = await axios.post(`${API}/store`, {
        data: storeData,
        category: storeCategory
      })
      setStoreMsg(`Record stored (ID: ${res.data.id})`)
      setStoreData("")
      fetchRecords()
      fetchVaultStats()
    } catch {
      setStoreMsg("Error storing record")
    }
    setLoading(false)
  }

  async function handleSearch() {
    if (!searchKeyword.trim()) return
    setLoading(true)
    const res = await axios.post(`${API}/search`, {
      keyword: searchKeyword,
      epsilon
    })
    setSearchResults(res.data)
    setLoading(false)
  }

  async function handlePrivateStats() {
    setLoading(true)
    const res = await axios.post(`${API}/private-stats`, { epsilon })
    setPrivateStats(res.data)
    setLoading(false)
  }

  const tabs = ["store", "records", "search", "privacy"]

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e0e0e0",
      fontFamily: "monospace",
      padding: "40px 20px"
    }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: "#fff", margin: 0 }}>
            Private Data Vault
          </h1>
          <p style={{ fontSize: 12, color: "#555", margin: "6px 0 0" }}>
            AES-256-GCM encryption + differential privacy
          </p>
          {vaultStats && (
            <p style={{ fontSize: 12, color: "#444", margin: "4px 0 0" }}>
              {vaultStats.total_records} records stored
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 32 }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 16px",
              background: activeTab === tab ? "#1a1a1a" : "transparent",
              color: activeTab === tab ? "#fff" : "#555",
              border: "1px solid",
              borderColor: activeTab === tab ? "#333" : "transparent",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: "monospace"
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Store Tab */}
        {activeTab === "store" && (
          <div>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              Data is encrypted with AES-256-GCM before being written to disk.
            </p>
            <textarea
              value={storeData}
              onChange={e => setStoreData(e.target.value)}
              placeholder="Enter data to encrypt and store..."
              style={{
                width: "100%",
                height: 120,
                background: "#111",
                border: "1px solid #222",
                borderRadius: 4,
                color: "#e0e0e0",
                padding: 12,
                fontSize: 13,
                fontFamily: "monospace",
                resize: "vertical",
                boxSizing: "border-box"
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <select
                value={storeCategory}
                onChange={e => setStoreCategory(e.target.value)}
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  color: "#e0e0e0",
                  padding: "8px 12px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontFamily: "monospace"
                }}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button onClick={handleStore} disabled={loading} style={{
                padding: "8px 20px",
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "monospace"
              }}>
                {loading ? "storing..." : "encrypt + store"}
              </button>
            </div>
            {storeMsg && (
              <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>{storeMsg}</p>
            )}
          </div>
        )}

        {/* Records Tab */}
        {activeTab === "records" && (
          <div>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              Decrypted records — visible only on your local machine.
            </p>
            {records.length === 0 ? (
              <p style={{ color: "#444", fontSize: 13 }}>No records yet.</p>
            ) : (
              records.map(r => (
                <div key={r.id} style={{
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  borderRadius: 4,
                  padding: 16,
                  marginBottom: 8
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#444" }}>ID {r.id}</span>
                    <span style={{ fontSize: 11, color: "#444" }}>{r.category}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#ccc" }}>{r.data}</p>
                  <p style={{ margin: "6px 0 0", fontSize: 10, color: "#333" }}>{r.timestamp}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <div>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              Search decrypted records. Result count is differentially private.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                placeholder="Search keyword..."
                style={{
                  flex: 1,
                  background: "#111",
                  border: "1px solid #222",
                  color: "#e0e0e0",
                  padding: "8px 12px",
                  borderRadius: 4,
                  fontSize: 13,
                  fontFamily: "monospace"
                }}
              />
              <button onClick={handleSearch} style={{
                padding: "8px 20px",
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "monospace"
              }}>
                search
              </button>
            </div>
            {searchResults && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 12, color: "#555" }}>
                  true matches: {searchResults.true_count} |
                  private count: {searchResults.private_count} |
                  epsilon: {epsilon}
                </p>
                {searchResults.matches.map(r => (
                  <div key={r.id} style={{
                    background: "#111",
                    border: "1px solid #1e1e1e",
                    borderRadius: 4,
                    padding: 12,
                    marginBottom: 6
                  }}>
                    <span style={{ fontSize: 11, color: "#444" }}>ID {r.id} [{r.category}]  </span>
                    <span style={{ fontSize: 13, color: "#ccc" }}>{r.data}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === "privacy" && (
          <div>
            <p style={{ fontSize: 12, color: "#555", marginBottom: 16 }}>
              Query vault statistics with differential privacy guarantees.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: "#555" }}>epsilon</span>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={epsilon}
                onChange={e => setEpsilon(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 12, color: "#888", minWidth: 30 }}>{epsilon}</span>
              <button onClick={handlePrivateStats} style={{
                padding: "8px 16px",
                background: "#1a1a1a",
                border: "1px solid #333",
                color: "#fff",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
                fontFamily: "monospace"
              }}>
                query
              </button>
            </div>
            <p style={{ fontSize: 11, color: "#333", marginBottom: 16 }}>
              small epsilon = more privacy, less accuracy
            </p>
            {privateStats && (
              <div>
                <div style={{
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  borderRadius: 4,
                  padding: 16,
                  marginBottom: 8
                }}>
                  <p style={{ margin: "0 0 8px", fontSize: 11, color: "#444" }}>total records</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#ccc" }}>
                    true: {privateStats.total.true_count} |
                    private: {privateStats.total.private_count} |
                    noise: {privateStats.total.noise_added}
                  </p>
                </div>
                {Object.entries(privateStats.distribution).map(([cat, stats]) => (
                  <div key={cat} style={{
                    background: "#111",
                    border: "1px solid #1e1e1e",
                    borderRadius: 4,
                    padding: 12,
                    marginBottom: 6
                  }}>
                    <span style={{ fontSize: 11, color: "#444" }}>{cat}  </span>
                    <span style={{ fontSize: 13, color: "#ccc" }}>
                      true: {stats.true_count} | private: {stats.private_count}
                    </span>
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

export default App