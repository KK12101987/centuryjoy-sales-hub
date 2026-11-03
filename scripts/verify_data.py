import json
import sys

def verify():
    print("Running data integrity verification...", flush=True)
    
    with open('src/data/initialData.json', 'r', encoding='utf-8') as f:
        records = json.load(f)
        
    with open('src/data/hierarchy.json', 'r', encoding='utf-8') as f:
        hierarchy = json.load(f)
        
    print(f"Total records in initialData.json: {len(records)}")
    assert len(records) == 2688, f"Expected 2688 records, got {len(records)}"
    
    total_amount = sum(r['finalTotalAmount'] for r in records)
    print(f"Total Amount: INR {total_amount:,.2f}")
    assert abs(total_amount - 404977923.49) < 1.0, f"Total amount mismatch: {total_amount}"
    
    matched_hierarchy = sum(1 for r in records if r['manager'] != 'Unassigned / Other')
    print(f"Hierarchy matched tickets: {matched_hierarchy}/{len(records)} ({matched_hierarchy/len(records)*100:.2f}%)")
    assert matched_hierarchy == 2688, f"Expected exactly 2688 matches, got {matched_hierarchy}"
    
    managers = list(hierarchy['tree'].keys())
    print(f"Managers ({len(managers)}): {managers}")
    assert len(managers) == 4, f"Expected 4 managers, got {len(managers)}"
    
    all_captains = set()
    for m, caps in hierarchy['tree'].items():
        all_captains.update(caps.keys())
    print(f"Captains ({len(all_captains)}): {sorted(list(all_captains))}")
    assert len(all_captains) == 11, f"Expected 11 captains, got {len(all_captains)}"
    
    print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    verify()
