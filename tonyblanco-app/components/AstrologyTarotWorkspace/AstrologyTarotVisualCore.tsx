'use client';

import type { AstrologyTarotSectionId } from './types';
import { useMemo, useState } from 'react';
import { TarotDeck } from '@/components/TarotCard';
import type { TarotCardData } from '@/components/TarotCard/TarotCard.types';
import { ARCANOS_MAYORES } from '@/components/BodySoulVisualization/plugins/tarot/tarot.logic';
import type { PatientContext } from '@/components/BodySoulVisualization/types';
import { SEFIROT_DEFINITIONS } from '../../../src/symbolic/data/sefirot/definitions';
import { SEFIROT_MEANINGS } from '../../../src/symbolic/data/sefirot/meanings';
import { SEFIROT_CORRESPONDENCES } from '../../../src/symbolic/data/sefirot/correspondences';

interface AstrologyTarotVisualCoreProps {
  activeSection: AstrologyTarotSectionId;
  patientId?: PatientContext['patientId'];
  patientName?: string;
  patientBirthDate?: PatientContext['patientBirthDate'];
  onSefirahHighlight?: (sefirahId: string | null) => void;
  onReadingComplete?: (reading: unknown) => void;
  onCardSelect?: (card: unknown) => void;
}

export default function AstrologyTarotVisualCore({
  activeSection,
  patientId,
  patientName,
  patientBirthDate,
  onSefirahHighlight,
  onReadingComplete,
  onCardSelect,
}: AstrologyTarotVisualCoreProps) {
  const deckCards = useMemo<TarotCardData[]>(
    () =>
      ARCANOS_MAYORES.map((card) => ({
        id: card.id,
        name: card.spanishName || card.name,
        number: card.number,
        arcana: 'major',
        element: card.element,
        keywords: card.keywords,
        imageUrl: `/tarot/${card.id}.png`,
        sefirahId: card.sefirah,
      })),
    []
  );

  const sectionConfig: Record<
    AstrologyTarotSectionId,
    { title: string; description: string }
  > = {
    'tarot-natal': {
      title: 'Carta Natal',
      description: 'Vista simbolica de origen. Observacional.',
    },
    'tarot-tree-spread': {
      title: 'Tirada del Arbol',
      description: 'Distribucion visual de cartas por posiciones.',
    },
    'tarot-free-spread': {
      title: 'Tirada Libre',
      description: 'Exploracion abierta sin estructura fija.',
    },
    'tarot-correspondences': {
      title: 'Correspondencias',
      description: 'Relaciones simbolicas entre cartas y atributos.',
    },
    'tarot-deck-view': {
      title: 'Visualizar Mazo',
      description: 'Vista completa del mazo tarot.',
    },
  };

  const activeConfig = sectionConfig[activeSection];
  const [selectedCard, setSelectedCard] = useState<TarotCardData | null>(null);

  const cabalaReference = useMemo(() => {
    if (!selectedCard?.sefirahId) {
      return null;
    }

    const definition = SEFIROT_DEFINITIONS.find(
      (item) => item.id === selectedCard.sefirahId
    );
    const meaning = SEFIROT_MEANINGS.find(
      (item) => item.id === selectedCard.sefirahId
    );
    const correspondence = SEFIROT_CORRESPONDENCES.find(
      (item) => item.id === selectedCard.sefirahId
    );

    if (!definition && !meaning && !correspondence) {
      return null;
    }

    return { definition, meaning, correspondence };
  }, [selectedCard?.sefirahId]);

  const fallbackText = 'Correspondencia simbolica no disponible';
  const hebrewGlyph = null;
  const letterName = null;
  const gematriaValue = null;
  const pathLabel = null;

  return (
    <section className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{activeConfig.title}</h3>
          <p className="text-xs text-gray-500">
            {activeConfig.description}
          </p>
        </div>
        <div className="text-right text-xs text-gray-500">
          Seccion activa: <span className="font-medium text-gray-700">{activeSection}</span>
        </div>
      </div>
      <div className="grid gap-4">
        {activeSection === 'tarot-deck-view' && (
          <TarotDeck
            cards={deckCards}
            layout="grid"
            interactive={true}
            onCardSelect={setSelectedCard}
          />
        )}
        {activeSection === 'tarot-tree-spread' && (
          <TarotDeck
            cards={deckCards.slice(0, 10)}
            layout="spread"
            spreadType="celtic-cross"
            interactive={true}
            onCardSelect={setSelectedCard}
          />
        )}
        {activeSection === 'tarot-free-spread' && (
          <TarotDeck
            cards={deckCards.slice(0, 7)}
            layout="fan"
            interactive={true}
            onCardSelect={setSelectedCard}
          />
        )}
        {activeSection === 'tarot-natal' && (
          <TarotDeck
            cards={deckCards.slice(0, 3)}
            layout="grid"
            interactive={true}
            onCardSelect={setSelectedCard}
          />
        )}
        {activeSection === 'tarot-correspondences' && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            Correspondencias simbolicas disponibles para consulta visual.
          </div>
        )}

        {selectedCard && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Correspondencia Cabalistica
            </div>
            <div className="mt-2 grid gap-2">
              <div>
                <span className="font-medium">Letra hebrea:</span>{' '}
                <span>{hebrewGlyph ?? fallbackText}</span>
              </div>
              <div>
                <span className="font-medium">Nombre:</span>{' '}
                <span>{letterName ?? fallbackText}</span>
              </div>
              <div>
                <span className="font-medium">Valor gematrico:</span>{' '}
                <span>{gematriaValue ?? fallbackText}</span>
              </div>
              <div>
                <span className="font-medium">Sendero:</span>{' '}
                <span>{pathLabel ?? fallbackText}</span>
              </div>
              {!cabalaReference && (
                <div className="text-xs text-gray-500">
                  Correspondencia simbolica no disponible para esta carta.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
