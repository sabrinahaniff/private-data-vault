import sys
from vault import initialize_vault, store_record, retrieve_record, retrieve_all, get_vault_stats
from query import private_count, private_category_distribution, search_records
import os

def print_header():
    print("\n" + "="*50)
    print("       Private Data Vault")
    print("  AES-256-GCM + Differential Privacy")
    print("="*50)

def print_menu():
    print("\nWhat would you like to do?")
    print("1. Store a new record")
    print("2. Retrieve a record by ID")
    print("3. List all records")
    print("4. Search records")
    print("5. Private stats (differentially private)")
    print("6. Vault info")
    print("0. Exit")

def setup():
    if not os.path.exists("vault.key"):
        print("\nNo vault found. Setting up a new vault...")
        initialize_vault()
    
def main():
    print_header()
    setup()
    
    while True:
        print_menu()
        choice = input("\nEnter choice: ").strip()
        
        if choice == "1":
            data = input("Enter data to store: ").strip()
            print("Categories: passwords, notes, personal, financial, general")
            category = input("Category (default=general): ").strip() or "general"
            store_record(data, category)
        
        elif choice == "2":
            record_id = int(input("Enter record ID: ").strip())
            try:
                record = retrieve_record(record_id)
                print(f"\nID: {record['id']}")
                print(f"Data: {record['data']}")
                print(f"Category: {record['category']}")
                print(f"Stored: {record['timestamp']}")
            except ValueError as e:
                print(f"Error: {e}")
        
        elif choice == "3":
            category = input("Filter by category? (leave blank for all): ").strip() or None
            records = retrieve_all(category)
            if not records:
                print("No records found.")
            for r in records:
                print(f"\nID {r['id']} [{r['category']}]: {r['data']}")
        
        elif choice == "4":
            keyword = input("Search keyword: ").strip()
            epsilon = float(input("Privacy budget epsilon (0.1-10.0, default=1.0): ").strip() or "1.0")
            results = search_records(keyword, epsilon)
            print(f"\nFound {results['true_count']} matches (private count: {results['private_count']})")
            for r in results["matches"]:
                print(f"  ID {r['id']} [{r['category']}]: {r['data']}")
        
        elif choice == "5":
            epsilon = float(input("Privacy budget epsilon (default=1.0): ").strip() or "1.0")
            print("\n--- Private Category Distribution ---")
            dist = private_category_distribution(epsilon)
            for cat, stats in dist.items():
                print(f"{cat}: true={stats['true_count']} private={stats['private_count']}")
            
            total = private_count(epsilon=epsilon)
            print(f"\nTotal records: true={total['true_count']} private={total['private_count']}")
        
        elif choice == "6":
            stats = get_vault_stats()
            print(f"\nTotal records: {stats['total_records']}")
            print(f"Categories: {stats['categories']}")
        
        elif choice == "0":
            print("\nExiting vault. Stay private!")
            break
        
        else:
            print("Invalid choice. Try again.")

if __name__ == "__main__":
    main()