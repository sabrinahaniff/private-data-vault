import json
import os
from datetime import datetime
from crypto import encrypt, decrypt, generate_key, save_key, load_key

VAULT_FILE = "vault_data.json"
KEY_FILE = "vault.key"

def initialize_vault():
    # create key if it doesn't exist
    if not os.path.exists(KEY_FILE):
        key = generate_key()
        save_key(key, KEY_FILE)
    
    # always create vault file if it doesn't exist
    if not os.path.exists(VAULT_FILE):
        with open(VAULT_FILE, 'w') as f:
            json.dump({"records": []}, f)
    
    print("Vault ready.")

def load_vault():
    # load existing vault
    if not os.path.exists(KEY_FILE):
        raise FileNotFoundError("No vault found. Run initialize_vault() first.")
    
    key = load_key(KEY_FILE)
    
    with open(VAULT_FILE, 'r') as f:
        vault = json.load(f)
    
    return vault, key

def store_record(data: str, category: str = "general"):
    # encrypt and store a new record
    vault, key = load_vault()
    
    encrypted = encrypt(data, key)
    
    record = {
        "id": len(vault["records"]) + 1,
        "encrypted_data": encrypted,
        "category": category,
        "timestamp": datetime.now().isoformat()
    }
    
    vault["records"].append(record)
    
    with open(VAULT_FILE, 'w') as f:
        json.dump(vault, f, indent=2)
    
    print(f"Record stored successfully (id={record['id']})")
    return record["id"]

def retrieve_record(record_id: int):
    # decrypt and return a specific record
    vault, key = load_vault()
    
    for record in vault["records"]:
        if record["id"] == record_id:
            decrypted = decrypt(record["encrypted_data"], key)
            return {
                "id": record["id"],
                "data": decrypted,
                "category": record["category"],
                "timestamp": record["timestamp"]
            }
    
    raise ValueError(f"Record {record_id} not found")

def retrieve_all(category: str = None):
    # decrypt and return all records optionally filtered by category
    vault, key = load_vault()
    
    records = []
    for record in vault["records"]:
        if category is None or record["category"] == category:
            decrypted = decrypt(record["encrypted_data"], key)
            records.append({
                "id": record["id"],
                "data": decrypted,
                "category": record["category"],
                "timestamp": record["timestamp"]
            })
    
    return records

def get_vault_stats():
    # return metadata about the vault without decrypting anything
    vault, _ = load_vault()
    records = vault["records"]
    
    categories = {}
    for record in records:
        cat = record["category"]
        categories[cat] = categories.get(cat, 0) + 1
    
    return {
        "total_records": len(records),
        "categories": categories
    }