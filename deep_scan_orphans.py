#!/usr/bin/env python3
"""
Find ALL orphaned console.log fragments in a JavaScript file
"""

import re

def find_all_orphaned_in_file(filepath):
    """Find all lines that are orphaned object properties (not in valid objects)"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        lines = content.split('\n')
    
    orphans = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Skip translation objects, comments, and common valid patterns
        if any(skip in line for skip in ['en:', 'ru:', 'const ', 'let ', 'var ', 'return ', 'case ', '//', 'style={{', 'style: {']):
            i += 1
            continue
        
        # Look for orphaned property: starts with spaces, has "property: value,"
        # and previous line doesn't end with { or opening a proper object
        if re.match(r'^\s{2,}[a-zA-Z_][a-zA-Z0-9_]*:\s+.+,\s*$', line):
            if i > 0:
                prev = lines[i-1].strip()
                # If previous line ends with ) and current line is orphaned property
                if prev.endswith(')') and not prev.endswith('({'):
                    # This is likely an orphaned fragment
                    # Find the closing })
                    j = i
                    while j < len(lines) and not lines[j].strip() == '})':
                        j += 1
                    
                    if j < len(lines) and lines[j].strip() == '})':
                        orphans.append({
                            'start': i + 1,  # 1-indexed
                            'end': j + 1,
                            'lines': lines[i:j+1]
                        })
                        i = j + 1
                        continue
        
        i += 1
    
    return orphans

if __name__ == '__main__':
    filepath = 'frontend/src/app/profile/components/InvestingTab/index.js'
    
    print(f"🔍 Deep scan of {filepath}...")
    print("="*60)
    
    orphans = find_all_orphaned_in_file(filepath)
    
    if orphans:
        print(f"\n❌ Found {len(orphans)} orphaned console.log fragments:\n")
        for idx, orphan in enumerate(orphans, 1):
            print(f"{idx}. Lines {orphan['start']}-{orphan['end']}:")
            for line in orphan['lines']:
                print(f"   {line}")
            print()
    else:
        print("\n✅ No orphaned fragments found!")
    
    print("="*60)
