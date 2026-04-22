# Private Data Vault

A local-first encrypted data vault combining AES-256-GCM cryptography 
with differential privacy. All data stays on your machine with no server, 
no cloud, no third parties.

<img width="1463" height="660" alt="image" src="https://github.com/user-attachments/assets/575d1fd1-d661-4964-8c61-5339603888da" />


## What it does

Store sensitive data encrypted at rest using AES-256-GCM. Query vault 
statistics with differential privacy guarantees so aggregate information 
can be shared without revealing individual records.

## Architecture
crypto.py      - AES-256-GCM encryption and decryption

vault.py       - local encrypted storage in JSON

query.py       - differentially private queries using Laplace mechanism

server.py      - FastAPI backend connecting vault to frontend

frontend/      - React dashboard for store, retrieve, search, privacy

## Security Design

All data is encrypted individually before being written to disk using 
AES-256-GCM, authenticated encryption that provides both confidentiality and integrity. A fresh random nonce is generated for every encryption operation to prevent nonce reuse attacks.

The encryption key lives in vault.key on your local machine. Losing 
this file means losing access to your data permanently, there is no 
recovery mechanism by design.

## Differential Privacy Layer

The privacy tab allows querying vault statistics without revealing 
individual records. Results are privatized using the Laplace mechanism:

noise = Laplace(0, sensitivity / epsilon)

Small epsilon = stronger privacy, noisier results.
Large epsilon = weaker privacy, more accurate results.

## Setup

```bash
./start.sh
```

Or manually:

```bash
# Terminal 1
source venv/bin/activate
uvicorn server:app --reload

# Terminal 2
cd frontend && npm run dev
```

Then open http://localhost:5173

## Important

Never commit vault.key or vault_data.json to version control. 
These are excluded in .gitignore by default. Back up vault.key 
somewhere safe, it cannot be recovered if lost.

## Future Work

- Master password authentication before decryption
- Desktop app packaging with Tauri for one-click launch
- Export encrypted backup to external drive
- Time-based access expiry for sensitive records
- Secure record sharing using asymmetric encryption
