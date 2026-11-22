require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'Marejar API' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// ==========================================
// ROTA DE IA (MIA IA) - GROQBlindada contra modelos de áudio/termos
// ==========================================
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'O prompt é obrigatório.' });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return res.status(500).json({ error: 'Chave GROQ_API_KEY não configurada no arquivo .env.' });
  }

  const systemInstruction = `Você é a MIA IA, a assistente virtual oficial do projeto turístico Marejar. 
  Seu objetivo é ajudar turistas a criarem roteiros de viagens, indicando praias, pontos históricos, cultura e hospedagens exclusivamente no litoral norte de Pernambuco (abrangendo Olinda, Paulista, Igarassu, Itapissuma, Itamaracá e Goiana). 
  Sempre incentive a contratação de guias credenciados locais. Responda em português de forma amigável, organizada e estruturada com negritos ou tópicos quando necessário.`;

  try {
    // 1. Consulta os modelos ativos na conta da Groq
    const modelsRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${groqKey}` }
    });
    const modelsData = await modelsRes.json();

    // Filtra apenas modelos puros de texto/chat (removendo áudio, TTS, guard e orpheus)
    const textModels = (modelsData.data || [])
      .map(m => m.id)
      .filter(id => 
        !id.includes('whisper') && 
        !id.includes('guard') && 
        !id.includes('tts') && 
        !id.includes('orpheus') &&
        !id.includes('vision')
      );

    // Ordena dando prioridade para modelos Llama, Qwen, Gemma ou Allam que funcionam direto
    const prioritizedModels = [
      ...textModels.filter(id => id.includes('llama') || id.includes('qwen') || id.includes('gemma') || id.includes('allam')),
      ...textModels
    ];

    // Remove duplicados
    const uniqueModels = [...new Set(prioritizedModels)];

    if (uniqueModels.length === 0) {
      return res.status(500).json({ error: 'Nenhum modelo de texto disponível na conta Groq.' });
    }

    let lastError = 'Erro desconhecido';

    // 2. Testa os modelos em ordem até o primeiro responder com sucesso
    for (const chosenModel of uniqueModels) {
      console.log(`Tentando modelo da Groq: ${chosenModel}`);

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: chosenModel,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();

      if (response.ok) {
        const aiResponseText = data.choices?.[0]?.message?.content;
        if (aiResponseText) {
          console.log(`Sucesso com o modelo: ${chosenModel}`);
          return res.json({ response: aiResponseText });
        }
      } else {
        lastError = data.error?.message || `Falha no modelo ${chosenModel}`;
        console.warn(`Modelo ${chosenModel} pulado (${lastError})`);
      }
    }

    return res.status(500).json({ error: `Nenhum modelo respondeu. Último erro: ${lastError}` });

  } catch (error) {
    console.error('Erro interno na rota de chat:', error);
    return res.status(500).json({ error: 'Erro interno ao processar a inteligência artificial.' });
  }
});

app.listen(PORT, () => {
  console.log(`Marejar API rodando em http://localhost:${PORT}`);
});