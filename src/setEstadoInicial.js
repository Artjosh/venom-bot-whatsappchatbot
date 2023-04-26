const { getAfiliados, updateAfiliadoEstado } = require('./supabase');

async function main() {
  try {
    const afiliados = await getAfiliados(); // Chama a função getAfiliados
    const afiliadosIds = afiliados.map((afiliado) => afiliado.id); // Extrai os IDs de cada afiliado
    console.log(afiliadosIds); // Exibe todos os IDs de afiliados no console

    // Loop para atualizar cada afiliado com um novo estado
    for (const id of afiliadosIds) {
      await updateAfiliadoEstado(id, 'inicial');
    }
  } catch (error) {
    console.error(error);
  }
}

main();
