import os
import re
import json
import pandas as pd
import time

def normalize_name(name):
    if not isinstance(name, str):
        return ""
    # Strip honorifics
    s = re.sub(r'^(mr\.|mr|mrs\.|ms\.)\s+', '', name.strip(), flags=re.IGNORECASE)
    # Strip extra spaces and lowercase
    s = re.sub(r'\s+', ' ', s).strip().lower()
    return s

def run_processing():
    t0 = time.time()
    l2_file = "L2 data_Oct'26.xlsx"
    rm_file = "RM_Cap_MGR.xlsx"
    
    print(f"Reading {l2_file} and {rm_file}...", flush=True)
    df_l2 = pd.read_excel(l2_file, engine='openpyxl')
    df_rm = pd.read_excel(rm_file, engine='openpyxl')
    print(f"Excel read in {time.time()-t0:.2f}s. df_l2: {df_l2.shape}, df_rm: {df_rm.shape}", flush=True)
    
    # Clean RM mapping
    df_rm['member_norm'] = df_rm['Team Members'].apply(normalize_name)
    df_rm['team_member_clean'] = df_rm['Team Members'].str.strip()
    df_rm['captain_clean'] = df_rm['Captains'].str.strip()
    df_rm['manager_clean'] = df_rm['Manager'].str.strip()
    
    # Build hierarchy structure
    hierarchy_tree = {}
    for row in df_rm.to_dict('records'):
        mgr = row['manager_clean']
        cap = row['captain_clean']
        mem = row['team_member_clean']
        if mgr not in hierarchy_tree:
            hierarchy_tree[mgr] = {}
        if cap not in hierarchy_tree[mgr]:
            hierarchy_tree[mgr][cap] = []
        if mem not in hierarchy_tree[mgr][cap]:
            hierarchy_tree[mgr][cap].append(mem)
            
    # Normalized lookup map: member_norm -> { manager, captain, original_name }
    lookup_map = {}
    for row in df_rm.to_dict('records'):
        lookup_map[row['member_norm']] = {
            'manager': row['manager_clean'],
            'captain': row['captain_clean'],
            'member': row['team_member_clean']
        }
        
    # Add verified team members from organizational mapping
    extra_members = [
        {'member': 'Silpa Palchina', 'captain': 'Silpa Palchina', 'manager': 'Arijit Nath'},
        {'member': 'Ronika Banerjee', 'captain': 'Silpa Palchina', 'manager': 'Arijit Nath'}
    ]
    for em in extra_members:
        mgr = em['manager']
        cap = em['captain']
        mem = em['member']
        if mgr not in hierarchy_tree:
            hierarchy_tree[mgr] = {}
        if cap not in hierarchy_tree[mgr]:
            hierarchy_tree[mgr][cap] = []
        if mem not in hierarchy_tree[mgr][cap]:
            hierarchy_tree[mgr][cap].append(mem)
        lookup_map[normalize_name(mem)] = {
            'manager': mgr,
            'captain': cap,
            'member': mem
        }
        
    custom_aliases = {
        'swastika kolla': 'swasitka kolla',
        'shaik nagur shariff': 'shaikh nagur shariff',
        'ria majumder': 'ria majumdar',
        'aishwrya tripathy': 'aishwarya tripathy',
        'ch naga sindhuja': 'naga sindhuja',
        'abhishek chatterje': 'abhishek chatterjee'
    }
    
    # Process L2 data
    df_l2['rm_norm'] = df_l2['Relationship Manager'].apply(normalize_name)
    df_l2['rm_norm_mapped'] = df_l2['rm_norm'].replace(custom_aliases)
    
    records = []
    matched_count = 0
    unmatched_count = 0
    
    # Fast iteration via to_dict('records')
    raw_records = df_l2.to_dict('records')
    for row in raw_records:
        norm_rm = row['rm_norm_mapped']
        if norm_rm in lookup_map:
            matched_count += 1
            cap = lookup_map[norm_rm]['captain']
            mgr = lookup_map[norm_rm]['manager']
        else:
            unmatched_count += 1
            cap = "Unassigned / Other"
            mgr = "Unassigned / Other"
            
        # Dates and TAT
        l2_date = pd.to_datetime(row['L2 Approved Date']) if pd.notna(row['L2 Approved Date']) else None
        l1_dt = pd.to_datetime(row['l1 Approved Date Time']) if pd.notna(row['l1 Approved Date Time']) else None
        created_dt = pd.to_datetime(row['Created Date']) if pd.notna(row['Created Date']) else None
        
        tat_l1 = round((l2_date - l1_dt).total_seconds() / (24 * 3600), 2) if l2_date is not None and l1_dt is not None else None
        tat_created = round((l2_date - created_dt).total_seconds() / (24 * 3600), 2) if l2_date is not None and created_dt is not None else None
        
        rec = {
            'ticketNo': str(row['Ticket No']).strip(),
            'l2ApprovedDate': l2_date.strftime('%Y-%m-%d') if l2_date is not None else '',
            'createdDate': created_dt.strftime('%Y-%m-%d %H:%M:%S') if created_dt is not None else '',
            'l1ApprovedDateTime': l1_dt.strftime('%Y-%m-%d %H:%M:%S') if l1_dt is not None else '',
            'source': str(row['Source']).strip(),
            'architectName': str(row['Architect Name']).strip(),
            'userCode': str(row['User Code']).strip(),
            'relationshipManager': str(row['Relationship Manager']).strip(),
            'createdBy': str(row['Created By']).strip(),
            'finalTotalAmount': round(float(row['Final Total Amount']), 2),
            'isAuditable': str(row['Is Auditable']).strip(),
            'invType': str(row['Inv Type']).strip(),
            'l1ApprovedUser': str(row['l1 Approved User']).strip(),
            'l2Assign': str(row['L2 Assign']).strip(),
            'l2Status': str(row['L2 Status']).strip(),
            'team': str(row['Team']).strip(),
            'captain': cap,
            'manager': mgr,
            'tatL1ToL2Days': tat_l1,
            'tatCreatedToL2Days': tat_created
        }
        records.append(rec)
        
    os.makedirs('src/data', exist_ok=True)
    
    with open('src/data/initialData.json', 'w', encoding='utf-8') as f:
        json.dump(records, f, ensure_ascii=False)
        
    hierarchy_payload = {
        'tree': hierarchy_tree,
        'lookup': lookup_map,
        'aliases': custom_aliases
    }
    with open('src/data/hierarchy.json', 'w', encoding='utf-8') as f:
        json.dump(hierarchy_payload, f, ensure_ascii=False, indent=2)
        
    print(f"Data processing completed in {time.time()-t0:.2f}s!", flush=True)
    print(f"Total records processed: {len(records)}", flush=True)
    print(f"Hierarchy matched: {matched_count} ({matched_count/len(records)*100:.2f}%)", flush=True)
    print(f"Hierarchy unmatched: {unmatched_count}", flush=True)
    print(f"Total Amount Sum: INR {sum(r['finalTotalAmount'] for r in records):,.2f}", flush=True)
    print(f"Saved to src/data/initialData.json and src/data/hierarchy.json", flush=True)

if __name__ == '__main__':
    run_processing()
