const express = require('express');
const venom = require('venom-bot');

const port = process.env.PORT || 3001;

const app = express();

app.use(express.json());

/* let client;

venom.create().then((cl) => {
  console.log('Venom-bot iniciado');
  client = cl;
  client.onMessage(async (mensagem) => {
    // aqui você pode definir as ações que o Venom-bot deve realizar quando receber uma mensagem

    if (mensagem.type === 'chat') {
      // Se a mensagem recebida for um texto
      console.log(`Mensagem recebida: ${mensagem.body}`);
      client.sendText(mensagem.from, 'Obrigado por enviar a mensagem!');
    } else {
      console.log('Mensagem recebida é de um tipo desconhecido');
    }
  });
}); */

app.get('/test', (req, res) => {
      return res.json('hello world');
});

app.post('/sendmsg', (req, res) => {
/*   const numero = req.body.numero;
  const mensagem = req.body.mensagem;

  client.sendText(numero, mensagem)
    .then(() => {
      console.log(`Mensagem enviada para ${numero}: ${mensagem}`);
      res.status(200).send('Mensagem enviada com sucesso');
    })
    .catch((error) => {
      console.error(`Erro ao enviar mensagem para ${numero}: ${error}`);
      res.status(500).send('Erro ao enviar mensagem');
    }); */
    return res.json('test hello world')
});

app.listen(3001, () => {
  console.log('Servidor iniciado na porta 3000');
});
