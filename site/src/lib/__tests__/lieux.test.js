import { describe, expect, it } from 'vitest';
import {
  scoreDuJour,
  getConstatEtat,
  filtrePlages,
  getPlages,
} from '../lieux.js';

describe('scoreDuJour', () => {
  it('prend le MINIMUM des trois axes, jamais la moyenne', () => {
    const lieu = {
      notes: {
        calme: { eau: 5, sable: 2, tranquillite: 4 },
      },
    };
    const s = scoreDuJour(lieu, 'calme');
    expect(s.min).toBe(2);
    expect(s.raisonAxe).toBe('sable');
    // moyenne serait ~3,67 — on refuse explicitement
    expect(s.min).not.toBe(Math.round((5 + 2 + 4) / 3));
  });

  it('en cas d’égalité au minimum, l’eau prime puis sable puis tranquillité', () => {
    const egaliteEauSable = {
      notes: { calme: { eau: 2, sable: 2, tranquillite: 5 } },
    };
    expect(scoreDuJour(egaliteEauSable, 'calme').raisonAxe).toBe('eau');

    const egaliteSableTranq = {
      notes: { calme: { eau: 5, sable: 1, tranquillite: 1 } },
    };
    expect(scoreDuJour(egaliteSableTranq, 'calme').raisonAxe).toBe('sable');

    const egaliteTriple = {
      notes: { calme: { eau: 3, sable: 3, tranquillite: 3 } },
    };
    expect(scoreDuJour(egaliteTriple, 'calme').raisonAxe).toBe('eau');
  });

  it('état absent → null (donnée absente, pas une note à 0)', () => {
    const lieu = {
      notes: {
        calme: { eau: 5, sable: 5, tranquillite: 5 },
        // pas de mistral_fort
      },
    };
    expect(scoreDuJour(lieu, 'mistral_fort')).toBeNull();
    expect(scoreDuJour(lieu, 'inexistant')).toBeNull();
    expect(scoreDuJour({ notes: {} }, 'calme')).toBeNull();
  });
});

describe('filtrePlages / veto', () => {
  it('exclut un lieu qui porte un veto — le lieu disparaît', () => {
    const lieux = [
      { id: 'ok', type: 'plage', notes: {} },
      {
        id: 'ferme',
        type: 'plage',
        veto: { source: 'arrêté test', date: '2026-08-01', motif: 'test' },
        notes: {},
      },
      { id: 'village', type: 'village', notes: {} },
    ];
    const plages = filtrePlages(lieux);
    expect(plages.map((p) => p.id)).toEqual(['ok']);
  });

  it('getPlages ne renvoie que des plages sans veto (lieux.yml réel)', () => {
    const plages = getPlages();
    expect(plages.length).toBeGreaterThan(0);
    for (const p of plages) {
      expect(p.type).toBe('plage');
      expect(p.veto).toBeUndefined();
    }
  });
});

describe('getConstatEtat', () => {
  it('état sans constat écrit → null (ex. calme)', () => {
    expect(getConstatEtat('calme')).toBeNull();
  });

  it('état avec constat → texte non vide (ex. mistral_fort)', () => {
    const c = getConstatEtat('mistral_fort');
    expect(typeof c).toBe('string');
    expect(c.length).toBeGreaterThan(10);
    expect(c).toMatch(/Mistral/i);
  });

  it('état inconnu → null', () => {
    expect(getConstatEtat('etat_qui_n_existe_pas')).toBeNull();
  });
});
