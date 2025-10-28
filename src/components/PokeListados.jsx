import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';

const POKE_API_BASE = 'https://pokeapi.co/api/v2';

export default function PokeListados() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pokemons, setPokemons] = useState([]);
  const [abilities, setAbilities] = useState([]);

  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);

  //extraer ID de la URLnpm run dev
  const extractIdFromUrl = (url) => {
    const match = url.match(/\/(\d+)\/$/);
    return match ? parseInt(match[1], 10) : '-';
  };

  //cargar Pokémon y habilidades
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

      // Agregar ID extraído de la URL
      setPokemons((pokemonJson.results || []).map(p => ({
        id: extractIdFromUrl(p.url),
        name: p.name,
        url: p.url
      })));

      setAbilities((abilityJson.results || []).map(a => ({
        id: extractIdFromUrl(a.url),
        name: a.name,
        url: a.url
      })));

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (pokemon) => {
    setSelectedPokemon(pokemon);
    setDialogVisible(true);
    setDialogLoading(true);

    try {
      const res = await fetch(pokemon.url);
      if (!res.ok) throw new Error(`Error al cargar detalles (${res.status})`);
      const data = await res.json();
      setPokemonDetails({
        name: data.name,
        height: data.height,
        weight: data.weight,
        image: data.sprites.front_default
      });
    } catch (err) {
      console.error(err);
      setPokemonDetails({ error: 'No se pudieron cargar los detalles.' });
    } finally {
      setDialogLoading(false);
    }
  };

  // Cerrar dialog
  const closeDialog = () => {
    setDialogVisible(false);
    setPokemonDetails(null);
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
          <DataTable 
            value={pokemons} 
            responsiveLayout="scroll"
            selectionMode="single"
            onRowClick={(e) => handleRowClick(e.data)}
          >
            <Column field="id" header="ID" />
            <Column field="name" header="Nombre" />
          </DataTable>
        </div>

        <div className="p-col-12 p-md-6">
          <h3>Habilidades</h3>
          <DataTable value={abilities} responsiveLayout="scroll">
            <Column field="id" header="ID" />
            <Column field="name" header="Nombre" />
          </DataTable>
        </div>
      </div>

      <Dialog 
        header={selectedPokemon ? `Detalles de ${selectedPokemon.name}` : 'Detalles'}
        visible={dialogVisible} 
        style={{ width: '30vw' }} 
        onHide={closeDialog}
      >
        {dialogLoading ? (
          <div className="flex justify-center items-center p-4">
            <ProgressSpinner />
          </div>
        ) : pokemonDetails ? (
          pokemonDetails.error ? (
            <p>{pokemonDetails.error}</p>
          ) : (
            <div className="p-text-center">
              <img 
                src={pokemonDetails.image} 
                alt={pokemonDetails.name} 
                style={{ width: '120px' }} 
              />
              <h4>{pokemonDetails.name}</h4>
              <p><b>Altura:</b> {pokemonDetails.height}</p>
              <p><b>Peso:</b> {pokemonDetails.weight}</p>
            </div>
          )
        ) : (
          <p>No hay datos disponibles.</p>
        )}
      </Dialog>
    </div>
  );
}

