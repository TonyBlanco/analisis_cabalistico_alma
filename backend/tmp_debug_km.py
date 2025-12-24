import os
import api.symbolic.kabbalah_mappings as km
print('yaml_none=', km.yaml is None)
print('MAPPINGS_DIR=', km.MAPPINGS_DIR)
print('MAPPINGS_ISDIR=', os.path.isdir(km.MAPPINGS_DIR))
print('_find:', km._find_mapping_file('72_names'))
path = km._find_mapping_file('72_names')
print('path_exists=', os.path.exists(path) if path else None)
print('_load_yaml_file:', km._load_yaml_file(path) if path else None)
print('load_72_names:', km.load_72_names())
