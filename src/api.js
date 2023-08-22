  const { getAfiliados, getEventos, updateAfiliadoEstado, getAfiliadoEstado, getAfiliadoEventos, updateAfiliadoEvento, updateAfiliadoPendente, updateEventosPending } = require('./supabase');
  const express = require('express');
  const venom = require('venom-bot');
  const app = express();


  // middleware para permitir requisições de outros domínios
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });

  app.use(express.json());
  let client;
  var msg;
  var estadoConversa;
  var eventosId = '';

  venom.create({
  session: 'YOUR_SESSION_NAME',
  headless: true,
  autoClose: 0,}).then((cl) => {
    console.log('Venom-bot iniciado');
    client = cl;
    client.onMessage(async (mensagem) => {
      if (mensagem.type === 'chat') {
        console.log(`Mensagem recebida: ${mensagem.body}`);
        const numeroRemetente = mensagem.from.replace('@c.us', '');
        console.log(numeroRemetente)
        // Obtem a lista de afiliados
        const afiliados = await getAfiliados();
        
        // Verifica se o número que está enviando a mensagem está contido na lista de afiliados
        const remetenteEstaNaLista = afiliados.some((afiliado) => {
          if (afiliado.numero.toString() === numeroRemetente.toString()) {
            return true;
          }
        });
        
        if (remetenteEstaNaLista) {
          const afiliado = afiliados.find((afiliado) => afiliado.numero.toString() === numeroRemetente.toString());
          estadoConversa = await getAfiliadoEstado(afiliado.id)// Se o remetente estiver na lista de afiliados, responde com uma mensagem diferente
          let pendentes = 0;
          if (estadoConversa === "inicial" || mensagem.body === "0") {
            if (afiliado.pendente) {
              const pendentesArr = afiliado.pendente.split(',');
              pendentes = pendentesArr.length;
            }
            console.log(pendentes);
            const eventoAgendadosStr = afiliado.evento || '';
            const eventosAgendados = eventoAgendadosStr.split(',');
            const numeroDeEventos = eventosAgendados && eventosAgendados.length && eventoAgendadosStr !== null && eventoAgendadosStr !== '' ? eventosAgendados.length : 0;            
            console.log(numeroDeEventos)
              let MensagemEvento = "Eventos pendentes:";
              const eventosPendentes = afiliado.pendente ? afiliado.pendente.split(",") : [];
              const eventosFiltrados = eventosPendentes.filter(Boolean);
              eventosFiltrados.map(eventoStr => {
                console.log("eventoStr:", eventoStr);
                const [idStr, dataHoraStr] = eventoStr.split("=");
                const [diaStr, mesStr, anoHoraStr] = dataHoraStr.split("/");
                const [anoStr, horaStr] = anoHoraStr.split(";");
                const data = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));
                MensagemEvento += `\n🍕Evento 🚨*ID=${idStr}*🚨: ${data.toLocaleDateString()} - ${horaStr}`;
                eventosId += `${idStr},`
              });
              msg = MensagemEvento;

            client.sendText(mensagem.from, `👋 Obrigado por enviar a mensagem, *${afiliado.id}*!\nVoce tem:\n\n${pendentes} Eventos pendentes para aceitar.\n${numeroDeEventos} Eventos agendados.\n\n*Oque deseja?*\n1️⃣ VERIFICAR EVENTOS PENDENTES \n2️⃣ VERIFICAR EVENTOS AGENDADOS `);
            updateAfiliadoEstado(afiliado.id, 'esperandoRespostaOqueDesejaFazer')
            return MensagemEvento;
          } else if (estadoConversa === "esperandoRespostaOqueDesejaFazer") {
            if (mensagem.body === "1") {
              client.sendText(mensagem.from, `Para aceitar ou recusar um evento:\nDigite *ACEITAR*\nOu  *RECUSAR*\n${msg}`);
            } else if (mensagem.body === "2") {
              let MensagemEvento = "Eventos agendados:";
              const eventosAgendados = afiliado.evento ? afiliado.evento.split(",") : [];
              const eventosAgendadosFiltrados = eventosAgendados.filter(Boolean);
              eventosAgendadosFiltrados.map(eA => {
                console.log(eA);
                const [idStr, dataHoraStr] = eA.split("=");
                const [diaStr, mesStr, anoHoraStr] = dataHoraStr.split("/");
                const [anoStr, horaStr] = anoHoraStr.split(";");
                const data = new Date(parseInt(anoStr), parseInt(mesStr) - 1, parseInt(diaStr));
                MensagemEvento += `\n🍕Evento 🚨*ID=${idStr}*🚨: ${data.toLocaleDateString()} - ${horaStr}`;
              });
              msg = MensagemEvento;
                  client.sendText(mensagem.from, `Você escolheu verificar eventos agendados.\n${msg}`);
            } else if (mensagem.body === "ACEITAR" || mensagem.body === "aceitar" || mensagem.body === "Aceitar"  ) {
                  client.sendText(mensagem.from, `*DIGITE* o *ID* do evento`);
                  updateAfiliadoEstado(afiliado.id, 'aceitar')
            } else if(mensagem.body === "RECUSAR" || mensagem.body === "recusar" || mensagem.body === "Recusar"  ) {
                  client.sendText(mensagem.from, `*DIGITE* o *ID* do evento`);
                  updateAfiliadoEstado(afiliado.id, 'recusar')
            }
              else {
              client.sendText(mensagem.from, `⚠️*Desculpe, não entendi.Escolha as opções 1️⃣ ou 2️⃣. Digite 0️⃣ para voltar.*⚠️`);
              updateAfiliadoEstado(afiliado.id, 'inicial')
            }
          }
          else if (estadoConversa === "aceitar") {
            const ids = eventosId.split(",");
            if (ids.includes(mensagem.body)) {
              // Verifica se o ID digitado está presente nos eventos pendentes
              const eventosPendentes = afiliado.pendente.split(",");
              const eventosFiltrados = eventosPendentes.filter(Boolean);
              const eventoStr = eventosFiltrados.find((evento) => evento.startsWith(mensagem.body));
              if (eventoStr) {
                // Chama o método para atualizar o evento
                updateAfiliadoEvento(afiliado.id, eventoStr);
                client.sendText(mensagem.from, `Evento atualizado com sucesso.`);
                updateAfiliadoEstado(afiliado.id, 'inicial');
              }
            } else {
              client.sendText(mensagem.from, `⚠️*Desculpe, não entendi.Digite o ID do evento. Digite 0️⃣ para voltar.*⚠️`);
            }
          }
          else if (estadoConversa === "recusar"){
            const ids = eventosId.split(",");
            if (ids.includes(mensagem.body)) {
              // Verifica se o ID digitado está presente nos eventos pendentes
              const eventosPendentes = afiliado.pendente.split(",");
              const eventosFiltrados = eventosPendentes.filter(Boolean);
              const eventoStr = eventosFiltrados.find((evento) => evento.startsWith(mensagem.body));
              if (eventoStr) {
                // Chama o método para atualizar o evento
                updateAfiliadoPendente(afiliado.id, eventoStr);
                const [idStr] = eventoStr.split("=");
                updateEventosPending(idStr, afiliado.id)
                client.sendText(mensagem.from, `Evento recusado com sucesso.`);
                updateAfiliadoEstado(afiliado.id, 'inicial');
              }
            } else {
              client.sendText(mensagem.from, `⚠️*Desculpe, não entendi.Digite o ID do evento. Digite 0️⃣ para voltar.*⚠️`);
            }
          }
        } else {
          client.sendText(mensagem.from, 'Area apenas para afiliados.');
        }
      } else {
        console.log('Mensagem recebida é de um tipo desconhecido');
      }
    });  
  });

  app.post('/afiliadoaddmsg', (req, res) => {
    const numero = req.body.numero;
    const mensagem = req.body.mensagem;

    client.sendText(numero, mensagem)
      .then(() => {
        console.log(`Mensagem enviada para ${numero}: ${mensagem}`);
        res.status(200).send('Mensagem enviada com sucesso');
      })
      .catch((error) => {
        console.error(`Erro ao enviar mensagem para ${numero}: ${error}`);
        res.status(500).send('Erro ao enviar mensagem');
      });
  });

  app.post('/afiliadoaddeventomsg', (req, res) => {
    const numero = req.body.numero;
    const mensagem = req.body.mensagem;

    client.sendText(numero, mensagem)
      .then(() => {
        console.log(`Mensagem enviada para ${numero}: ${mensagem}`);
        res.status(200).send('Mensagem enviada com sucesso');
      })
      .catch((error) => {
        console.error(`Erro ao enviar mensagem para ${numero}: ${error}`);
        res.status(500).send('Erro ao enviar mensagem');
      });
  });

  app.listen(3001, () => {
    console.log('Servidor iniciado na porta 3001');
  });
