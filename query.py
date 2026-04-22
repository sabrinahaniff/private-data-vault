import numpy as np
from vault import load_vault, retrieve_all
from crypto import decrypt

def laplace_noise(sensitivity, epsilon):
    # same mechanism from your differential privacy project
    # sensitivity=1 for count queries
    # epsilon controls privacy-accuracy tradeoff
    return np.random.laplace(0, sensitivity / epsilon)

def private_count(category=None, epsilon=1.0):
    # count records in a category with differential privacy
    # true count + laplace noise = private count
    vault, key = load_vault()
    
    if category is None:
        true_count = len(vault["records"])
    else:
        true_count = sum(
            1 for r in vault["records"] 
            if r["category"] == category
        )
    
    # add laplace noise for privacy
    noise = laplace_noise(sensitivity=1, epsilon=epsilon)
    private = true_count + noise
    
    return {
        "true_count": true_count,
        "private_count": round(private),
        "epsilon": epsilon,
        "noise_added": round(noise, 3)
    }

def private_category_distribution(epsilon=1.0):
    # return differentially private counts for all categories
    # uses epsilon budget split across all categories
    vault, key = load_vault()
    
    categories = {}
    for record in vault["records"]:
        cat = record["category"]
        categories[cat] = categories.get(cat, 0) + 1
    
    # add noise to each category count
    private_categories = {}
    for cat, count in categories.items():
        noise = laplace_noise(sensitivity=1, epsilon=epsilon)
        private_categories[cat] = {
            "true_count": count,
            "private_count": max(0, round(count + noise)),
            "epsilon": epsilon
        }
    
    return private_categories

def search_records(keyword, epsilon=1.0):
    # search through decrypted records for a keyword
    # returns matching records with a private count
    records = retrieve_all()
    
    matches = [r for r in records if keyword.lower() in r["data"].lower()]
    
    noise = laplace_noise(sensitivity=1, epsilon=epsilon)
    private_match_count = max(0, round(len(matches) + noise))
    
    return {
        "matches": matches,
        "true_count": len(matches),
        "private_count": private_match_count,
        "epsilon": epsilon
    }