from django.test import TestCase
from api.symbolic.kabbalah_mappings import load_sefer_yetzirah, load_72_names, load_sephirot, summary


class KabbalahMappingsTests(TestCase):
    def test_loaders_return_dicts_or_empty(self):
        sy = load_sefer_yetzirah()
        self.assertTrue(isinstance(sy, dict))

        names = load_72_names()
        self.assertTrue(isinstance(names, dict))

        seph = load_sephirot()
        self.assertTrue(isinstance(seph, dict))

    def test_summary_contains_expected_keys(self):
        s = summary()
        self.assertIn('sefer_yetzirah', s)
        self.assertIn('names_72_count', s)
        self.assertIn('sephirot', s)

    def test_curated_72_names_present_and_structured(self):
        names = load_72_names()
        # We expect at least the PoC curated 'name_1' entry to be present
        self.assertIn('name_1', names)
        entry = names.get('name_1')
        self.assertIsNotNone(entry)
        self.assertIn('name', entry)
        # letters should be a list or string
        self.assertTrue(isinstance(entry.get('letters'), (list, str)))

    def test_summary_includes_version_metadata(self):
        s = summary()
        # The curated mapping file includes a version field; summary should expose it
        self.assertIsNotNone(s.get('names_72_version'))

    def test_mapping_files_discoverable(self):
        # Ensure the filesystem discovery is working in test environment
        from api.symbolic import kabbalah_mappings as km
        path = km._find_mapping_file('72_names')
        self.assertIsNotNone(path, 'Expected to discover 72_names mapping file in docs/mappings')
        data = km._load_yaml_file(path)
        # fallback loader should at least extract a version or names block
        self.assertTrue(bool(data), 'Expected _load_yaml_file to return a non-empty mapping')

