#!/usr/bin/env python3
"""
Test Legacy Pattern Auditor
Detecta tests holísticos que puedan tener patrones de respuesta legacy (AUDIT_XX, PHQ_XX, etc.)

Usage:
    cd backend
    python ../audit_legacy_test_patterns.py
"""
import re
import sys
from pathlib import Path


def audit_test_views():
    """Audita backend/api/test_views.py para patrones legacy."""
    test_views_path = Path(__file__).parent / 'backend' / 'api' / 'test_views.py'
    
    if not test_views_path.exists():
        print(f"❌ No se encuentra {test_views_path}")
        return []
    
    content = test_views_path.read_text(encoding='utf-8')
    
    # Patrones legacy conocidos
    legacy_patterns = [
        (r"AUDIT_\d+", "AUDIT (alcohol screening)"),
        (r"PHQ_\d+", "PHQ-9 (depression)"),
        (r"GAD_\d+", "GAD-7 (anxiety)"),
        (r"EAT_\d+", "EAT-26 (eating disorders)"),
        (r"BAI_\d+", "BAI (anxiety inventory)"),
        (r"BDI_\d+", "BDI-II (depression inventory)"),
        (r"STAI_\d+", "STAI (state-trait anxiety)"),
        (r"SCL_\d+", "SCL-90 (symptom checklist)"),
    ]
    
    issues = []
    
    for pattern, name in legacy_patterns:
        matches = re.finditer(pattern, content)
        for match in matches:
            line_num = content[:match.start()].count('\n') + 1
            context_start = max(0, match.start() - 100)
            context_end = min(len(content), match.end() + 100)
            context = content[context_start:context_end]
            
            # Extraer el nombre del test del contexto
            test_code_match = re.search(r"test_module\.code\s*==\s*['\"]([^'\"]+)['\"]", 
                                       content[max(0, match.start()-500):match.end()])
            test_code = test_code_match.group(1) if test_code_match else "Unknown"
            
            issues.append({
                'file': 'backend/api/test_views.py',
                'line': line_num,
                'pattern': pattern,
                'match': match.group(),
                'test_code': test_code,
                'description': name,
                'context': context.strip()
            })
    
    return issues


def audit_diagnostics():
    """Audita backend/api/diagnostics.py para funciones legacy."""
    diagnostics_path = Path(__file__).parent / 'backend' / 'api' / 'diagnostics.py'
    
    if not diagnostics_path.exists():
        print(f"❌ No se encuentra {diagnostics_path}")
        return []
    
    content = diagnostics_path.read_text(encoding='utf-8')
    
    # Buscar funciones con nombres legacy pero implementación holística
    legacy_function_names = [
        'compute_sha_harmony',  # Ya corregido, pero documentamos
        'compute_eat26_spirit',
        'compute_audit',
        'compute_phq',
        'compute_gad'
    ]
    
    issues = []
    
    for func_name in legacy_function_names:
        pattern = rf'def\s+{func_name}\s*\('
        match = re.search(pattern, content)
        if match:
            line_num = content[:match.start()].count('\n') + 1
            
            # Extraer docstring
            docstring_match = re.search(r'"""(.*?)"""', content[match.end():match.end()+500], re.DOTALL)
            docstring = docstring_match.group(1).strip() if docstring_match else "No docstring"
            
            issues.append({
                'file': 'backend/api/diagnostics.py',
                'line': line_num,
                'function': func_name,
                'docstring': docstring[:200] + '...' if len(docstring) > 200 else docstring
            })
    
    return issues


def check_frontend_test_pages():
    """Verifica que las páginas frontend usen q1, q2, ... qN."""
    frontend_path = Path(__file__).parent / 'tonyblanco-app' / 'app' / '(dashboard)' / 'dashboard' / 'patient' / 'tests'
    
    if not frontend_path.exists():
        print(f"⚠️  No se encuentra {frontend_path}")
        return []
    
    issues = []
    
    # Buscar todos los page.tsx
    for page_file in frontend_path.rglob('page.tsx'):
        if 'result' in str(page_file):
            continue  # Skip result pages
            
        content = page_file.read_text(encoding='utf-8')
        
        # Buscar patrones legacy en TypeScript
        legacy_patterns = [
            r"AUDIT_\d+",
            r"PHQ_\d+",
            r"GAD_\d+",
            r"EAT_\d+"
        ]
        
        for pattern in legacy_patterns:
            if re.search(pattern, content):
                issues.append({
                    'file': str(page_file.relative_to(Path(__file__).parent)),
                    'pattern': pattern,
                    'type': 'frontend_legacy_key'
                })
    
    return issues


def main():
    print("🔍 Auditando patrones legacy en tests holísticos...")
    print("=" * 80)
    
    # Backend test_views
    print("\n📋 1. Auditando backend/api/test_views.py...")
    test_views_issues = audit_test_views()
    
    if test_views_issues:
        print(f"⚠️  Encontrados {len(test_views_issues)} patrones legacy:")
        for issue in test_views_issues:
            print(f"\n  📍 Línea {issue['line']} - Test: {issue['test_code']}")
            print(f"     Patrón: {issue['match']} ({issue['description']})")
            print(f"     Contexto: ...{issue['context'][:100]}...")
    else:
        print("✅ No se encontraron patrones legacy en test_views.py")
    
    # Backend diagnostics
    print("\n📋 2. Auditando backend/api/diagnostics.py...")
    diagnostics_issues = audit_diagnostics()
    
    if diagnostics_issues:
        print(f"ℹ️  Encontradas {len(diagnostics_issues)} funciones con nombres legacy:")
        for issue in diagnostics_issues:
            print(f"\n  📍 Línea {issue['line']} - Función: {issue['function']}")
            print(f"     Docstring: {issue['docstring']}")
    else:
        print("✅ No se encontraron funciones legacy en diagnostics.py")
    
    # Frontend
    print("\n📋 3. Auditando frontend (patient test pages)...")
    frontend_issues = check_frontend_test_pages()
    
    if frontend_issues:
        print(f"⚠️  Encontrados {len(frontend_issues)} patrones legacy en frontend:")
        for issue in frontend_issues:
            print(f"\n  📍 {issue['file']}")
            print(f"     Patrón: {issue['pattern']}")
    else:
        print("✅ No se encontraron patrones legacy en frontend")
    
    # Resumen
    print("\n" + "=" * 80)
    total_issues = len(test_views_issues) + len(frontend_issues)
    
    if total_issues == 0:
        print("✅ AUDITORÍA COMPLETA: No se encontraron problemas legacy")
        return 0
    else:
        print(f"⚠️  AUDITORÍA COMPLETA: {total_issues} potenciales problemas detectados")
        print("\n📖 Ver docs/TEST_LEGACY_MIGRATION.md para guía de corrección")
        return 1


if __name__ == '__main__':
    sys.exit(main())
