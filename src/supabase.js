const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://roijvfnoognumwjbyymt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaWp2Zm5vb2dudW13amJ5eW10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MzU4MjI5MiwiZXhwIjoxOTg5MTU4MjkyfQ.I77twttru16VK-OJ7t2P0FEegXZrj6lT_RDuShWxDkI';
const supabase = createClient(supabaseUrl, supabaseKey);

async function getAfiliados() {
  const { data, error } = await supabase
    .from('afiliados')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}
async function getAfiliadoEstado(id) {
  const { data, error } = await supabase
    .from('afiliados')
    .select('estado')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  return data.estado;
}
async function getEventos() {
  const { data, error } = await supabase
    .from('eventos')
    .select('*');

  if (error) {
    throw error;
  }

  return data;
}
async function getEventosPending(id) {
  const { data, error } = await supabase
    .from('eventos')
    .select('pending')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const pendingObj = JSON.parse(data.pending);
  return pendingObj;
}
async function getEventosConfirmados(id) {
  const { data, error } = await supabase
    .from('eventos')
    .select('confirmados')
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const confirmadosObj = JSON.parse(data.confirmados);
  return confirmadosObj;
}
async function updateEventosPending(eventoId, afiliadoId) {
  const pendingObj = await getEventosPending(eventoId);

  for (const key in pendingObj) {
    const index = pendingObj[key].indexOf(afiliadoId);
    if (index !== -1) {
      const arrayName = key;
      pendingObj[key].splice(index, 1);
      const confirmadosObj = await getEventosConfirmados(eventoId);
      confirmadosObj[arrayName].push(afiliadoId);
      const { error } = await supabase
        .from('eventos')
        .update({
          pending: JSON.stringify(pendingObj),
          confirmados: JSON.stringify(confirmadosObj)
        })
        .eq('id', eventoId);

      if (error) {
        throw error;
      }
      break;
    }
  }
}
async function updateAfiliadoEstado(id, novoEstado) {
  const { error } = await supabase
    .from('afiliados')
    .update({ estado: `${novoEstado}` })
    .eq('id', id);

  if (error) {
    throw error;
  }
}
async function getAfiliadoPendente(id){
  const { data, error } = await supabase
    .from('afiliados')
    .select('pendente')
    .eq('id', id);

  if (error) {
    throw error;
  }

  return data[0].pendente;
}
async function updateAfiliadoPendente(id, pendenteARemover) {
  const pendentesAntigos = await getAfiliadoPendente(id);
  const pendentesAtualizados = pendentesAntigos.replace(`${pendenteARemover},`, '').replace(`,${pendenteARemover}`, '').replace(`${pendenteARemover}`, '');

  const { error } = await supabase
    .from('afiliados')
    .update({ pendente: pendentesAtualizados })
    .eq('id', id);

  if (error) {
    throw error;
  }
}
async function getAfiliadoEventos(id){
      const { data, error } = await supabase
      .from('afiliados')
      .select('evento')
      .eq('id', id)

    if (error) {
      throw error;
    }
    console.log(data[0].evento)
    return data[0].evento;
}
async function updateAfiliadoEvento(id, novoEvento) {
  const eventosAntigos = await getAfiliadoEventos(id);
  const eventosAtualizados = eventosAntigos ? `${eventosAntigos},${novoEvento}` : `${novoEvento}`;
  updateAfiliadoPendente(id, novoEvento);
  const [idStr] = novoEvento.split("=");
  updateEventosPending(idStr, id)
  const { error } = await supabase
    .from('afiliados')
    .update({ evento: eventosAtualizados })
    .eq('id', id);

  if (error) {
    throw error;
  }
}


module.exports = { getAfiliados, getEventos, updateAfiliadoEstado, getAfiliadoEstado, getAfiliadoEventos, updateAfiliadoEvento, updateAfiliadoPendente, updateEventosPending };
