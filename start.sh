#!/bin/bash
echo "Starting Private Data Vault..."
source venv/bin/activate
uvicorn server:app &
sleep 2
cd frontend && npm run dev &
sleep 2
open http://localhost:5173
echo "Vault running. Press Ctrl+C to stop."
wait