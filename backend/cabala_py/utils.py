# cabala_py/utils.py
from .data import NUMEROS_MAESTROS

def reducir_teosofica(n):
    """Reduce un número a su valor teosófico (1-9) iterativamente."""
    if not isinstance(n, int):
        try:
            n = int(n)
        except ValueError:
            return 0 # Manejar entradas no válidas
            
    if n == 0:
        return 0
        
    while n > 9:
        n = sum(int(d) for d in str(n))
    return n


def reduccion_cabalistica(valor, max_limite=22, mantener_maestros=False):
    """
    Aplica la reducción cabalística/teosófica con límite máximo.
    Retorna el valor primario y, opcionalmente, el valor reducido a un dígito (teosófico).
    """
    
    val_final = valor
    
    # Reducción con límite (si es mayor que el límite, suma sus dígitos)
    while val_final > max_limite:
        val_final = sum(int(d) for d in str(val_final))

    # Manejo de números maestros
    if mantener_maestros and val_final in NUMEROS_MAESTROS:
        # Los maestros se mantienen en su forma 11, 22, 33
        reducido_a_digito = reducir_teosofica(val_final)
        return val_final, reducido_a_digito
    
    # Si el resultado es un número de dos dígitos, se da también el dígito simple (ej: 16 -> 7)
    if val_final > 9:
        reducido_a_digito = reducir_teosofica(val_final)
        return val_final, reducido_a_digito
        
    # Si es 1-9 (o si no se mantiene maestro y se redujo a 1-9)
    return val_final, val_final