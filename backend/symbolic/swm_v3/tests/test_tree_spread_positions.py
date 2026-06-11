# -*- coding: utf-8 -*-
"""Posiciones Sefirot para spread tree_of_life (wiring Modo Híbrido)."""

from django.test import SimpleTestCase

from symbolic.swm_v3.tarot_es import spread_positions_for, TREE_OF_LIFE_POSITIONS_ES


class TreeSpreadPositionsTest(SimpleTestCase):
    def test_tree_of_life_returns_ten_sefirot_ids(self):
        positions = spread_positions_for('tree_of_life')
        self.assertEqual(len(positions), 10)
        ids = [p['id'] for p in positions]
        self.assertEqual(ids, [p['id'] for p in TREE_OF_LIFE_POSITIONS_ES])
        self.assertIn('keter', ids)
        self.assertIn('tiferet', ids)
        self.assertIn('malchut', ids)

    def test_simple_spread_uses_generic_positions(self):
        positions = spread_positions_for('simple')
        self.assertEqual(positions[0]['id'], 'significator')