#!/usr/bin/env python3
"""
Find all potential orphaned console.log properties
"""

import re
import sys

def find_orphaned_properties(filepath):
    """Find lines that look like orphaned object properties"""
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    orphans = []
    in_object = False
    object_start = 0
    
    for i, line in enumerate(lines, 1):
        # Skip translation objects and common patterns
        if any(skip in line for skip in ['en:', 'ru:', 'const ', 'let ', 'var ', 'return ', 'case ', '//']):
            continue
        
        # Look for orphaned property pattern: "  propertyName: value,"
        # at the start of a line (not inside a valid object)
        if re.match(r'^\s{2,}[a-zA-Z_][a-zA-Z0-9_]*:\s+.+,\s*$', line):
            # Check if previous line looks like it could be missing console.log({
            if i > 1:
                prev_line = lines[i-2].strip()
                # If previous line doesn't end with { or ( or [, it's likely orphaned
                if prev_line and not prev_line.endswith(('{', '(', '[')):
                    orphans.append({
                        'line': i,
                        'content': line.rstrip(),
                        'prev': prev_line
                    })
    
    return orphans

if __name__ == '__main__':
    filepath = sys.argv[1] if len(sys.argv) > 1 else 'frontend/src/app/profile/components/InvestingTab/index.js'
    
    print(f"🔍 Scanning {filepath} for orphaned properties...")
    print("="*60)
    
    orphans = find_orphaned_properties(filepath)
    
    if orphans:
        print(f"\n❌ Found {len(orphans)} potential orphaned properties:\n")
        for orphan in orphans:
            print(f"Line {orphan['line']}: {orphan['content']}")
            print(f"  Previous: {orphan['prev']}")
            print()
    else:
        print("\n✅ No orphaned properties found!")
    
    print("="*60)
