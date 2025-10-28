import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import React, { useState } from 'react';
import { Button } from 'primereact/button';

const POKE_API_BASE = 'https://pokeapi.co/api/v2';

export default function Listados() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pokemons, setPokemons] = useState([]);
  const [abilities, setAbilities] = useState([]);

  const fetchBoth = async () => {
    setLoading(true);
    setError(null);
    setPokemons([]);
    setAbilities([]);

    try {
      const urls = [
        `${POKE_API_BASE}/pokemon?limit=50`,
        `${POKE_API_BASE}/ability?limit=50`
      ];

      const responses = await Promise.all(urls.map(url => fetch(url)));

      for (const r of responses) {
        if (!r.ok) throw new Error(`Error en fetch: ${r.status} ${r.statusText}`);
      }

      const [pokemonJson, abilityJson] = await Promise.all(responses.map(r => r.json()));

      setPokemons(pokemonJson.results || []);
      setAbilities(abilityJson.results || []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="p-m-4">
    <h2>PokeListados</h2>

    <div className="p-mb-3">
      <Button 
        label={loading ? 'Cargando...' : 'Cargar datos'} 
        icon="pi pi-cloud-download" 
        onClick={fetchBoth} 
        disabled={loading} 
      />
      <Button 
        label="Recargar" 
        icon="pi pi-refresh" 
        className="p-ml-2" 
        onClick={fetchBoth} 
        disabled={loading} 
      />
    </div>

    {loading && <p>Cargando...</p>}
    {error && <p style={{ color: 'red' }}>Error: {error}</p>}

    <div className="p-grid p-mt-4">
      <div className="p-col-12 p-md-6">
        <h3>Pokémon</h3>
        <DataTable value={pokemons} responsiveLayout="scroll">
          <Column field="name" header="Nombre" />
        </DataTable>
      </div>

      <div className="p-col-12 p-md-6">
        <h3>Habilidades</h3>
        <DataTable value={abilities} responsiveLayout="scroll">
          <Column field="name" header="Nombre" />
        </DataTable>
      </div>
    </div>
  </div>
);

}
