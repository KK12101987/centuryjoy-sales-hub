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
    l2_oct_file = "L2 data_Oct'26.xlsx"
    l2_nov_file = "L2 Approved_Test.xlsx"
    rm_file = "RM_Cap_MGR.xlsx"
    
    print(f"Reading {rm_file}...", flush=True)
    df_rm = pd.read_excel(rm_file, engine='openpyxl')
    
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
        {'member': 'Ronika Banerjee', 'captain': 'Silpa Palchina', 'manager': 'Arijit Nath'},
        {'member': 'Sholanki Dhar', 'captain': 'Arshi Afreen Jamal', 'manager': 'Arijit Nath'},
        {'member': 'ISHANI DEY', 'captain': 'Arshi Afreen Jamal', 'manager': 'Arijit Nath'}
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
    
    os.makedirs('src/data', exist_ok=True)

    def process_workbook(file_path, output_filename, dataset_name):
        if not os.path.exists(file_path):
            print(f"Warning: File {file_path} does not exist, skipping.", flush=True)
            return
            
        print(f"Processing {dataset_name} from {file_path}...", flush=True)
        df_l2 = pd.read_excel(file_path, engine='openpyxl')
        df_l2['rm_norm'] = df_l2['Relationship Manager'].apply(normalize_name)
        df_l2['rm_norm_mapped'] = df_l2['rm_norm'].replace(custom_aliases)
        
        records = []
        matched_count = 0
        unmatched_count = 0
        
        raw_records = df_l2.to_dict('records')
        for row in raw_records:
            norm_rm = row['rm_norm_mapped']
            if norm_rm in lookup_map:
                matched_count += 1
                cap = lookup_map[norm_rm]['captain']
                mgr = lookup_map[norm_rm]['manager']
            else:
                matched_count += 1
                cap = "Arijit Nath"
                mgr = "Arijit Nath"
                
            # Determine Stream: Physical Team (No Captain) vs Digital Pod (Captain-Led)
            is_physical = (cap == mgr or 'physical' in cap.lower() or 'physical' in str(row.get('Team', '')).lower())
            if is_physical:
                stream = 'Physical Team'
                pod_captain = 'None (Direct Supervision)'
                team_display = f"{mgr} - Physical Team"
            else:
                stream = 'Digital Pod'
                pod_captain = cap
                team_display = f"Pod - {cap}"
                
            # Dates and TAT
            l2_date = pd.to_datetime(row['L2 Approved Date']) if pd.notna(row.get('L2 Approved Date')) else None
            l1_dt = pd.to_datetime(row['l1 Approved Date Time']) if pd.notna(row.get('l1 Approved Date Time')) else None
            created_dt = pd.to_datetime(row['Created Date']) if pd.notna(row.get('Created Date')) else None
            
            tat_l1 = round((l2_date - l1_dt).total_seconds() / (24 * 3600), 2) if l2_date is not None and l1_dt is not None else None
            tat_created = round((l2_date - created_dt).total_seconds() / (24 * 3600), 2) if l2_date is not None and created_dt is not None else None
            
            rec = {
                'ticketNo': str(row.get('Ticket No', '')).strip(),
                'l2ApprovedDate': l2_date.strftime('%Y-%m-%d') if l2_date is not None else '',
                'createdDate': created_dt.strftime('%Y-%m-%d %H:%M:%S') if created_dt is not None else '',
                'l1ApprovedDateTime': l1_dt.strftime('%Y-%m-%d %H:%M:%S') if l1_dt is not None else '',
                'source': str(row.get('Source', '')).strip(),
                'architectName': str(row.get('Architect Name', '')).strip(),
                'userCode': str(row.get('User Code', '')).strip(),
                'relationshipManager': str(row.get('Relationship Manager', '')).strip(),
                'createdBy': str(row.get('Created By', '')).strip(),
                'finalTotalAmount': round(float(row.get('Final Total Amount', 0)), 2),
                'isAuditable': str(row.get('Is Auditable', '')).strip(),
                'invType': str(row.get('Inv Type', '')).strip(),
                'l1ApprovedUser': str(row.get('l1 Approved User', '')).strip(),
                'l2Assign': str(row.get('L2 Assign', '')).strip(),
                'l2Status': str(row.get('L2 Status', '')).strip(),
                'team': str(row.get('Team', '')).strip(),
                'teamDisplay': team_display,
                'captain': pod_captain,
                'manager': mgr,
                'stream': stream,
                'isPhysical': is_physical,
                'tatL1ToL2Days': tat_l1,
                'tatCreatedToL2Days': tat_created
            }
            records.append(rec)
            
        with open(output_filename, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False)
            
        print(f"[{dataset_name}] Saved {len(records)} records to {output_filename}. Total Amount: INR {sum(r['finalTotalAmount'] for r in records):,.2f}", flush=True)

    # Process October 2026 dataset
    process_workbook(l2_oct_file, 'src/data/initialData.json', 'October 2026 Dataset')

    # Process November 2026 Test dataset
    process_workbook(l2_nov_file, 'src/data/novemberData.json', 'November 2026 Test Dataset')
        
    hierarchy_payload = {
        'tree': hierarchy_tree,
        'lookup': lookup_map,
        'aliases': custom_aliases
    }
    with open('src/data/hierarchy.json', 'w', encoding='utf-8') as f:
        json.dump(hierarchy_payload, f, ensure_ascii=False, indent=2)
        
    print(f"Data processing completed in {time.time()-t0:.2f}s!", flush=True)

if __name__ == '__main__':
    run_processing()
