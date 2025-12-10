'use client';

import TreeOfLife from '@/src/components/tree/tree_of_life_visualizer';
import EstructuraEnergeticaDiagram from './EstructuraEnergeticaDiagram';
import LetrasDelAlma from './LetrasDelAlma';
import GuardianAngel from './GuardianAngel';

/**
 * Componente para renderizar un reporte cabalístico completo
 * Basado en el mapa generado por cabala_py.integracion_arbol.generar_mapa_cabalista_completo
 */

interface CabalisticReportProps {
  mapa: any; // El objeto completo del mapa cabalista
  clientName?: string;
  birthDate?: string;
}

export default function CabalisticReport({ mapa, clientName, birthDate }: CabalisticReportProps) {
  if (!mapa) return null;

  const { 
    numeros_principales, 
    inclusion_base, 
    analisis_cabalista,
    recomendaciones,
    temas_clave,
    estructura_energetica,
    vibraciones,
    cuentas_pendientes,
    dias_fuerza,
    turbulencias,
    secuencia_principal
  } = mapa;

  return (
    <div className="space-y-6">
      {/* Identidad */}
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">
          🌟 Mapa del Alma de {clientName || mapa.identidad?.nombre}
        </h2>
        <p className="text-gray-400">
          Nacido el {mapa.identidad?.fecha_nacimiento || (birthDate ? new Date(birthDate).toLocaleDateString('es-ES', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : '')}
        </p>
      </div>

      {/* Números Principales (Tarot) */}
      {numeros_principales && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🎴 Cartas del Alma (Tarot)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Esencia */}
            {numeros_principales.esencia && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-bold text-purple-400 mb-2">✨ Esencia del Alma</h4>
                <p className="text-2xl font-bold mb-1">{numeros_principales.esencia.valor}</p>
                {numeros_principales.esencia.arbol && (
                  <>
                    <p className="text-sm text-gray-400 mb-1">
                      {numeros_principales.esencia.arbol.nombre_es || numeros_principales.esencia.arbol.nombre_tarot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {numeros_principales.esencia.arbol.significado}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Expresión */}
            {numeros_principales.expresion && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-400 mb-2">🗣️ Expresión</h4>
                <p className="text-2xl font-bold mb-1">{numeros_principales.expresion.valor}</p>
                {numeros_principales.expresion.arbol && (
                  <>
                    <p className="text-sm text-gray-400 mb-1">
                      {numeros_principales.expresion.arbol.nombre_es || numeros_principales.expresion.arbol.nombre_tarot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {numeros_principales.expresion.arbol.significado}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Herencia */}
            {numeros_principales.herencia && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h4 className="font-bold text-green-400 mb-2">🧬 Herencia</h4>
                <p className="text-2xl font-bold mb-1">{numeros_principales.herencia.valor}</p>
                {numeros_principales.herencia.arbol && (
                  <>
                    <p className="text-sm text-gray-400 mb-1">
                      {numeros_principales.herencia.arbol.nombre_es || numeros_principales.herencia.arbol.nombre_tarot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {numeros_principales.herencia.arbol.significado}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Destino */}
            {numeros_principales.destino && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-bold text-yellow-400 mb-2">🎯 Destino</h4>
                <p className="text-2xl font-bold mb-1">{numeros_principales.destino.valor}</p>
                {numeros_principales.destino.arbol && (
                  <>
                    <p className="text-sm text-gray-400 mb-1">
                      {numeros_principales.destino.arbol.nombre_es || numeros_principales.destino.arbol.nombre_tarot}
                    </p>
                    <p className="text-xs text-gray-500">
                      {numeros_principales.destino.arbol.significado}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Camino de Vida */}
            {numeros_principales.camino_vida && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <h4 className="font-bold text-red-400 mb-2">⏳ Edad de Transformación</h4>
                <p className="text-2xl font-bold mb-1">{numeros_principales.camino_vida.valor}</p>
                <p className="text-xs text-gray-500">{numeros_principales.camino_vida.descripcion}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inclusión de Base (Casas 1-9) */}
      {inclusion_base && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🏠 Inclusión de Base (Casas 1-9)</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {Object.entries(inclusion_base.casas || {}).map(([num, freq]: [string, any]) => (
              <div 
                key={num}
                className={`p-3 rounded-lg text-center ${
                  freq === 0 ? 'bg-red-900/20 border border-red-500/30' :
                  freq >= 3 ? 'bg-green-900/20 border border-green-500/30' :
                  'bg-gray-800 border border-gray-700'
                }`}
              >
                <p className="text-lg font-bold">{num}</p>
                <p className="text-sm text-gray-400">× {freq}</p>
              </div>
            ))}
          </div>

          {inclusion_base.numeros_dominantes && inclusion_base.numeros_dominantes.length > 0 && (
            <p className="text-sm text-green-400 mb-2">
              ✨ Dominantes: {inclusion_base.numeros_dominantes.join(', ')}
            </p>
          )}

          {inclusion_base.numeros_ausentes && inclusion_base.numeros_ausentes.length > 0 && (
            <p className="text-sm text-red-400 mb-2">
              ⚠️ Ausentes (Karmas): {inclusion_base.numeros_ausentes.join(', ')}
            </p>
          )}

          {inclusion_base.maestrias && inclusion_base.maestrias.length > 0 && (
            <p className="text-sm text-purple-400">
              🔥 Maestrías (3+ veces): {inclusion_base.maestrias.join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Árbol de la Vida Interactivo */}
      {numeros_principales && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4 text-center">🌳 Árbol de la Vida - Tu Mapa del Alma</h3>
          <TreeOfLife
            initial={{
              esencia: String(numeros_principales.esencia?.numero || ''),
              expresion: String(numeros_principales.expresion?.numero || ''),
              herencia: String(numeros_principales.herencia?.numero || ''),
              destino: String(numeros_principales.destino?.numero || ''),
              caminoVida: String(numeros_principales.camino_vida?.valor || '')
            }}
          />
        </div>
      )}

      {/* Estructura Energética Visual */}
      {estructura_energetica && (
        <EstructuraEnergeticaDiagram
          imagen_alma={estructura_energetica.imagen_alma}
          razones_karmicas={estructura_energetica.razones_karmicas}
          familias={estructura_energetica.familias}
        />
      )}

      {/* Letras del Alma */}
      {clientName && (
        <LetrasDelAlma nombre={clientName} />
      )}

      {/* Ángel Guardián */}
      {birthDate && (
        <div className="mt-6">
          <GuardianAngel birthDate={birthDate} showDetails={true} />
        </div>
      )}

      {/* Análisis Cabalista */}
      {analisis_cabalista && analisis_cabalista.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🌳 Análisis del Árbol de la Vida</h3>
          <div className="space-y-3">
            {analisis_cabalista.map((item: any, idx: number) => (
              <div key={idx} className="bg-black/50 rounded-lg p-4">
                <h4 className="font-bold text-purple-400 mb-2">{item.aspecto}</h4>
                <p className="text-sm text-gray-300">{item.descripcion}</p>
                {item.consejo && (
                  <p className="text-xs text-blue-400 mt-2">💡 {item.consejo}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recomendaciones */}
      {recomendaciones && recomendaciones.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">💎 Recomendaciones Espirituales</h3>
          <ul className="space-y-2">
            {recomendaciones.map((rec: any, idx: number) => {
              // Si es un objeto, renderizar campos estructurados
              if (typeof rec === 'object' && rec !== null) {
                return (
                  <li key={idx} className="text-gray-300 bg-black/30 rounded-lg p-3">
                    {rec.categoria && <p className="font-bold text-blue-400 mb-1">{rec.categoria}</p>}
                    {rec.basado_en && <p className="text-xs text-gray-500 mb-1">Basado en: {rec.basado_en}</p>}
                    {rec.sugerencia && <p className="text-sm">{rec.sugerencia}</p>}
                    {rec.descripcion && <p className="text-sm">{rec.descripcion}</p>}
                  </li>
                );
              }
              // Si es string, renderizar como antes
              return (
                <li key={idx} className="text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>{rec}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Días de Fuerza */}
      {dias_fuerza && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">📅 Días de Fuerza Personal</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {typeof dias_fuerza === 'object' && Object.entries(dias_fuerza).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">{key.replace(/_/g, ' ')}</p>
                <p className="text-lg font-bold text-blue-400">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cuentas Pendientes (Árbol Kármico) */}
      {cuentas_pendientes && Object.keys(cuentas_pendientes).length > 0 && (
        <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">♾️ Árbol de Cuentas Kármicas</h3>
          <p className="text-sm text-gray-400 mb-4">
            Estos números representan lecciones del alma no resueltas. No son castigos, son espejos para sanar.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(cuentas_pendientes).map(([num, data]: [string, any]) => (
              <div key={num} className="bg-red-900/20 border border-red-500/30 rounded p-2 text-center">
                <p className="font-bold text-red-400">{num}</p>
                {data && typeof data === 'object' && data.descripcion && (
                  <p className="text-xs text-gray-400 mt-1">{data.descripcion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Turbulencias */}
      {turbulencias && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">⚡ Años de Turbulencias Espirituales</h3>
          {typeof turbulencias === 'object' ? (
            <div className="space-y-3">
              {Object.entries(turbulencias).map(([key, value]: [string, any]) => (
                <div key={key} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <p className="font-bold text-yellow-400 mb-1">{key.replace(/_/g, ' ')}</p>
                  {Array.isArray(value) ? (
                    <p className="text-gray-300">{value.join(', ')}</p>
                  ) : (
                    <p className="text-gray-300">{JSON.stringify(value)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-300">{String(turbulencias)}</p>
          )}
        </div>
      )}

      {/* Vibraciones */}
      {vibraciones && typeof vibraciones === 'object' && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🎵 Números de Vibración</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(vibraciones).map(([key, value]: [string, any]) => (
              <div key={key} className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">{key.replace(/_/g, ' ')}</p>
                <p className="text-lg font-bold text-indigo-400">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secuencia Principal */}
      {secuencia_principal && Array.isArray(secuencia_principal) && secuencia_principal.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🔢 Secuencia Principal</h3>
          <div className="flex flex-wrap gap-2">
            {secuencia_principal.map((item: any, idx: number) => (
              <div key={idx} className="bg-purple-900/20 border border-purple-500/30 rounded-lg px-4 py-2">
                <p className="text-sm text-gray-400">{item.etapa || `Etapa ${idx + 1}`}</p>
                <p className="text-xl font-bold text-purple-400">{item.valor || item}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Temas Clave */}
      {temas_clave && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">🗝️ Temas Clave del Alma</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {temas_clave.tema_origen && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                  <span>🌟</span>
                  <span>Tema de Origen</span>
                </h4>
                {(() => {
                  const origen = temas_clave.tema_origen.arbol || temas_clave.tema_origen;
                  if (origen.nombre_es || origen.nombre_tarot) {
                    return (
                      <>
                        <div className="mb-3">
                          <p className="text-lg font-semibold text-purple-300 mb-1">
                            {origen.nombre_es || origen.nombre_tarot}
                          </p>
                          {origen.tipo && (
                            <p className="text-xs text-purple-400/70 uppercase tracking-wide">
                              {origen.tipo}
                            </p>
                          )}
                        </div>
                        {origen.significado && (
                          <p className="text-sm text-gray-300 leading-relaxed mb-2">
                            {origen.significado}
                          </p>
                        )}
                        <div className="space-y-1 text-xs mb-2">
                          {origen.arcangel && (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400">👼</span>
                              <span className="text-gray-400">Arcángel:</span>
                              <span className="text-gray-200">{origen.arcangel}</span>
                            </div>
                          )}
                          {origen.planeta && (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400">🪐</span>
                              <span className="text-gray-400">Planeta:</span>
                              <span className="text-gray-200">{origen.planeta}</span>
                            </div>
                          )}
                          {origen.chakra && (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400">🧘</span>
                              <span className="text-gray-400">Chakra:</span>
                              <span className="text-gray-200">{origen.chakra}</span>
                            </div>
                          )}
                          {origen.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-purple-400">🎨</span>
                              <span className="text-gray-400">Color:</span>
                              <span className="text-gray-200">{origen.color}</span>
                            </div>
                          )}
                        </div>
                        {temas_clave.tema_origen.edad_transformacion && (
                          <div className="bg-purple-900/30 rounded px-2 py-1 text-xs text-purple-300">
                            Edad: {temas_clave.tema_origen.edad_transformacion} años
                          </div>
                        )}
                      </>
                    );
                  }
                  return (
                    <div className="text-sm text-gray-400">
                      {Object.entries(temas_clave.tema_origen).map(([k, v]) => (
                        <div key={k} className="mb-1">
                          <span className="font-semibold">{k}:</span> {String(v)}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {temas_clave.principio_transformacion && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="font-bold text-blue-400 mb-3 flex items-center gap-2">
                  <span>🔄</span>
                  <span>Principio Transformación</span>
                </h4>
                {(() => {
                  const transformacion = temas_clave.principio_transformacion.arbol || temas_clave.principio_transformacion;
                  if (transformacion.nombre_es || transformacion.nombre_tarot) {
                    return (
                      <>
                        <div className="mb-3">
                          <p className="text-lg font-semibold text-blue-300 mb-1">
                            {transformacion.nombre_es || transformacion.nombre_tarot}
                          </p>
                          {transformacion.tipo && (
                            <p className="text-xs text-blue-400/70 uppercase tracking-wide">
                              {transformacion.tipo}
                            </p>
                          )}
                        </div>
                        {transformacion.significado && (
                          <p className="text-sm text-gray-300 leading-relaxed mb-2">
                            {transformacion.significado}
                          </p>
                        )}
                        <div className="space-y-1 text-xs mb-2">
                          {transformacion.arcangel && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400">👼</span>
                              <span className="text-gray-400">Arcángel:</span>
                              <span className="text-gray-200">{transformacion.arcangel}</span>
                            </div>
                          )}
                          {transformacion.planeta && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400">🪐</span>
                              <span className="text-gray-400">Planeta:</span>
                              <span className="text-gray-200">{transformacion.planeta}</span>
                            </div>
                          )}
                          {transformacion.chakra && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400">🧘</span>
                              <span className="text-gray-400">Chakra:</span>
                              <span className="text-gray-200">{transformacion.chakra}</span>
                            </div>
                          )}
                          {transformacion.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400">🎨</span>
                              <span className="text-gray-400">Color:</span>
                              <span className="text-gray-200">{transformacion.color}</span>
                            </div>
                          )}
                        </div>
                        {temas_clave.principio_transformacion.edad_transformacion && (
                          <div className="bg-blue-900/30 rounded px-2 py-1 text-xs text-blue-300">
                            Edad: {temas_clave.principio_transformacion.edad_transformacion} años
                          </div>
                        )}
                      </>
                    );
                  }
                  return (
                    <div className="text-sm text-gray-400">
                      {Object.entries(temas_clave.principio_transformacion).map(([k, v]) => (
                        <div key={k} className="mb-1">
                          <span className="font-semibold">{k}:</span> {String(v)}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {temas_clave.tema_destino && (
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Tema de Destino</span>
                </h4>
                {(() => {
                  const destino = temas_clave.tema_destino.arbol || temas_clave.tema_destino;
                  if (destino.nombre_es || destino.nombre_tarot) {
                    return (
                      <>
                        <div className="mb-3">
                          <p className="text-lg font-semibold text-yellow-300 mb-1">
                            {destino.nombre_es || destino.nombre_tarot}
                          </p>
                          {destino.tipo && (
                            <p className="text-xs text-yellow-400/70 uppercase tracking-wide">
                              {destino.tipo}
                            </p>
                          )}
                        </div>
                        {destino.significado && (
                          <p className="text-sm text-gray-300 leading-relaxed mb-2">
                            {destino.significado}
                          </p>
                        )}
                        <div className="space-y-1 text-xs">
                          {destino.arcangel && (
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400">👼</span>
                              <span className="text-gray-400">Arcángel:</span>
                              <span className="text-gray-200">{destino.arcangel}</span>
                            </div>
                          )}
                          {destino.planeta && (
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400">🪐</span>
                              <span className="text-gray-400">Planeta:</span>
                              <span className="text-gray-200">{destino.planeta}</span>
                            </div>
                          )}
                          {destino.chakra && (
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400">🧘</span>
                              <span className="text-gray-400">Chakra:</span>
                              <span className="text-gray-200">{destino.chakra}</span>
                            </div>
                          )}
                          {destino.color && (
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400">🎨</span>
                              <span className="text-gray-400">Color:</span>
                              <span className="text-gray-200">{destino.color}</span>
                            </div>
                          )}
                        </div>
                      </>
                    );
                  }
                  return (
                    <div className="text-sm text-gray-400">
                      {Object.entries(temas_clave.tema_destino).map(([k, v]) => (
                        <div key={k} className="mb-1">
                          <span className="font-semibold">{k}:</span> {String(v)}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
