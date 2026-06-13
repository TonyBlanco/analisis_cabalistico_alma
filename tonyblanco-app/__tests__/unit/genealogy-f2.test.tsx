import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mock fetch ───────────────────────────────────────────────────────────────

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock('@/lib/api', () => ({
  API_BASE_URL: 'http://test.local/api',
  getAuthToken: () => 'test-token',
}));

vi.mock('@/lib/active-patient', () => ({
  getActivePatientId: () => 42,
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function jsonOk(data: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function emptyOk() {
  return Promise.resolve(new Response(null, { status: 204 }));
}

function jsonErr(status: number) {
  return Promise.resolve(
    new Response(JSON.stringify({ detail: `Error ${status}` }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

const PERSON = {
  id: 'p-1',
  patient: 42,
  generation: -1,
  relation: 'madre',
  name: 'Ana',
  birth_year: 1960,
  death_year: null,
  notes: '',
  birth_order_number: 2,
  is_deceased: false,
  is_abortion: false,
  side: 'materno',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const EVENT = {
  id: 'e-1',
  patient: 42,
  title: 'Emigración',
  year: 1985,
  description: 'Familia emigró a Argentina.',
  linked_people: ['p-1'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// ─── genealogy-api: getGenealogyOverview ──────────────────────────────────────

describe('genealogy-api › getGenealogyOverview', () => {
  beforeEach(() => mockFetch.mockReset());

  it('solicita el endpoint correcto con token', async () => {
    const { getGenealogyOverview } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(jsonOk({ people: [PERSON], events: [] }));

    await getGenealogyOverview(42);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/bioemotional/genealogy/42/',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Token test-token' }),
      }),
    );
  });

  it('devuelve people y events', async () => {
    const { getGenealogyOverview } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(jsonOk({ people: [PERSON], events: [EVENT] }));

    const result = await getGenealogyOverview(42);
    expect(result.people).toHaveLength(1);
    expect(result.events[0].title).toBe('Emigración');
  });

  it('lanza error cuando el servidor devuelve 401', async () => {
    const { getGenealogyOverview } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(jsonErr(401));

    await expect(getGenealogyOverview(42)).rejects.toThrow();
  });
});

// ─── genealogy-api: createPerson / updatePerson / deletePerson ────────────────

describe('genealogy-api › CRUD personas', () => {
  beforeEach(() => mockFetch.mockReset());

  it('createPerson: POST al endpoint correcto', async () => {
    const { createPerson } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(jsonOk(PERSON));

    const payload = {
      generation: -1, relation: 'madre', name: 'Ana', birth_year: 1960,
      death_year: null, notes: '', birth_order_number: 2,
      is_deceased: false, is_abortion: false, side: 'materno' as const,
    };
    const result = await createPerson(42, payload);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/bioemotional/genealogy/42/person',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.name).toBe('Ana');
  });

  it('updatePerson: PATCH al endpoint con UUID', async () => {
    const { updatePerson } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(jsonOk({ ...PERSON, name: 'Ana M.' }));

    await updatePerson('p-1', { name: 'Ana M.' });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/bioemotional/genealogy/persons/p-1/',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('deletePerson: DELETE al endpoint con UUID', async () => {
    const { deletePerson } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(emptyOk());

    await deletePerson('p-1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/bioemotional/genealogy/persons/p-1/',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

// ─── genealogy-api: createEvent / updateEvent / deleteEvent ──────────────────

describe('genealogy-api › CRUD eventos', () => {
  beforeEach(() => mockFetch.mockReset());

  it('createEvent: POST al endpoint correcto', async () => {
    const { createEvent } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(jsonOk(EVENT));

    await createEvent(42, { title: 'Emigración', year: 1985, description: '', linked_people: [] });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/bioemotional/genealogy/42/event',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('updateEvent: PATCH al endpoint con UUID', async () => {
    const { updateEvent } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(jsonOk({ ...EVENT, title: 'Emigración (actualizado)' }));

    await updateEvent('e-1', { title: 'Emigración (actualizado)' });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/bioemotional/genealogy/events/e-1/',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('deleteEvent: DELETE al endpoint con UUID', async () => {
    const { deleteEvent } = await import('@/lib/api/genealogy-api');
    mockFetch.mockReturnValueOnce(emptyOk());

    await deleteEvent('e-1');

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test.local/api/bioemotional/genealogy/events/e-1/',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });
});

// ─── GenealogyPersonPanel ─────────────────────────────────────────────────────

describe('GenealogyPersonPanel', () => {
  beforeEach(() => mockFetch.mockReset());
  afterEach(() => vi.resetModules());

  async function setup(people = [PERSON]) {
    const { default: GenealogyPersonPanel } = await import(
      '@/components/TransgenerationalDeepWorkspace/GenealogyPersonPanel'
    );
    const onChanged = vi.fn();
    render(<GenealogyPersonPanel patientId={42} people={people} onChanged={onChanged} />);
    return { onChanged };
  }

  it('muestra lista de personas', async () => {
    await setup();
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
    expect(screen.getByText(/madre/)).toBeInTheDocument();
  });

  it('muestra número de orden Armoni cuando existe', async () => {
    await setup();
    expect(screen.getByText(/#2/)).toBeInTheDocument();
  });

  it('muestra estado "Sin personas" con lista vacía', async () => {
    await setup([]);
    expect(screen.getByText(/Sin personas registradas/)).toBeInTheDocument();
  });

  it('abre formulario de nueva persona al hacer clic en Añadir', async () => {
    const user = userEvent.setup();
    await setup([]);
    await user.click(screen.getByRole('button', { name: /Añadir/ }));
    expect(screen.getByPlaceholderText(/madre, padre/)).toBeInTheDocument();
  });

  it('guarda nueva persona y llama onChanged', async () => {
    const user = userEvent.setup();
    mockFetch.mockReturnValueOnce(jsonOk(PERSON));
    const { onChanged } = await setup([]);

    await user.click(screen.getByRole('button', { name: /Añadir/ }));
    await user.type(screen.getByPlaceholderText(/madre, padre/), 'madre');
    await user.click(screen.getByRole('button', { name: /Guardar/ }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it('muestra error si la relación está vacía al guardar', async () => {
    const user = userEvent.setup();
    await setup([]);

    await user.click(screen.getByRole('button', { name: /Añadir/ }));
    await user.click(screen.getByRole('button', { name: /Guardar/ }));

    expect(screen.getByText(/Relación es obligatorio/)).toBeInTheDocument();
  });

  it('abre formulario con datos precargados al editar', async () => {
    const user = userEvent.setup();
    await setup();

    await user.click(screen.getByRole('button', { name: /Editar/ }));
    const input = screen.getByDisplayValue('madre');
    expect(input).toBeInTheDocument();
  });

  it('elimina persona y llama onChanged', async () => {
    const user = userEvent.setup();
    mockFetch.mockReturnValueOnce(emptyOk());
    vi.stubGlobal('confirm', () => true);
    const { onChanged } = await setup();

    await user.click(screen.getByRole('button', { name: /Eliminar/ }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
    vi.unstubAllGlobals();
  });
});

// ─── GenealogyEventPanel ──────────────────────────────────────────────────────

describe('GenealogyEventPanel', () => {
  beforeEach(() => mockFetch.mockReset());
  afterEach(() => vi.resetModules());

  async function setup(events = [EVENT], people = [PERSON]) {
    const { default: GenealogyEventPanel } = await import(
      '@/components/TransgenerationalDeepWorkspace/GenealogyEventPanel'
    );
    const onChanged = vi.fn();
    render(<GenealogyEventPanel patientId={42} events={events} people={people} onChanged={onChanged} />);
    return { onChanged };
  }

  it('muestra lista de eventos ordenada por año', async () => {
    const events = [
      { ...EVENT, id: 'e-2', title: 'Nacimiento', year: 1960 },
      { ...EVENT, id: 'e-1', title: 'Emigración', year: 1985 },
    ];
    await setup(events);
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Nacimiento');
    expect(items[1]).toHaveTextContent('Emigración');
  });

  it('muestra estado vacío con lista vacía', async () => {
    await setup([]);
    expect(screen.getByText(/Sin eventos registrados/)).toBeInTheDocument();
  });

  it('muestra nombre de persona vinculada', async () => {
    await setup();
    expect(screen.getByText(/Ana/)).toBeInTheDocument();
  });

  it('abre formulario al hacer clic en Añadir evento', async () => {
    const user = userEvent.setup();
    await setup([]);
    await user.click(screen.getByRole('button', { name: /Añadir evento/ }));
    expect(screen.getByPlaceholderText(/Emigración familiar/)).toBeInTheDocument();
  });

  it('muestra error si el título está vacío al guardar', async () => {
    const user = userEvent.setup();
    await setup([]);

    await user.click(screen.getByRole('button', { name: /Añadir evento/ }));
    await user.click(screen.getByRole('button', { name: /Guardar/ }));

    expect(screen.getByText(/título del evento es obligatorio/)).toBeInTheDocument();
  });

  it('guarda nuevo evento y llama onChanged', async () => {
    const user = userEvent.setup();
    mockFetch.mockReturnValueOnce(jsonOk(EVENT));
    const { onChanged } = await setup([]);

    await user.click(screen.getByRole('button', { name: /Añadir evento/ }));
    await user.type(screen.getByPlaceholderText(/Emigración familiar/), 'Emigración');
    await user.click(screen.getByRole('button', { name: /Guardar/ }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
  });

  it('elimina evento y llama onChanged', async () => {
    const user = userEvent.setup();
    mockFetch.mockReturnValueOnce(emptyOk());
    vi.stubGlobal('confirm', () => true);
    const { onChanged } = await setup();

    await user.click(screen.getByRole('button', { name: /Eliminar/ }));

    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce());
    vi.unstubAllGlobals();
  });

  it('vincula personas mediante checkbox', async () => {
    const user = userEvent.setup();
    await setup([]);

    await user.click(screen.getByRole('button', { name: /Añadir evento/ }));
    const checkbox = screen.getByRole('checkbox', { name: /Ana/ });
    expect(checkbox).not.toBeChecked();
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
