"""
Small script to convert .json5 files to .json by parsing JSON5 and writing JSON.
Usage: python scripts/convert_json5_to_json.py path/to/dir

Note: Requires 'json5' Python package (install with `pip install json5`).
"""
import json
import os
import sys

try:
    import json5
except Exception as e:
    print("json5 package not available. Install with: pip install json5")
    sys.exit(1)


def convert_file(src_path):
    dst_path = src_path[:-5] + "json"
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()
    try:
        data = json5.loads(content)
    except Exception as e:
        print(f"Failed to parse {src_path}: {e}")
        return False
    with open(dst_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Converted {src_path} -> {dst_path}")
    return True


def walk_and_convert(directory):
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.json5'):
                src = os.path.join(root, file)
                if convert_file(src):
                    count += 1
    print(f"Converted {count} files in {directory}")
    return count


if __name__ == '__main__':
    if len(sys.argv) > 1:
        dir_to_convert = sys.argv[1]
    else:
        dir_to_convert = '.'
    walk_and_convert(dir_to_convert)
