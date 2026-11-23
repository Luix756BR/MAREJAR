<p align="center">
  <img src="img/Logo-branca.png" alt="Logo MAREJAR" width="220" />
</p>

# MAREJAR — Desenvolvimento de um Sistema Web para Planejamento Turístico e Valorização de Experiências Locais

Trabalho de Conclusão de Curso (TCC) apresentado ao Curso Técnico Integrado em Desenvolvimento de Sistemas da **Escola Técnica Estadual Jurandir Bezerra Lins** (2026), sob orientação do **Prof. Dr. Danilo Barbosa**.

O **MAREJAR** é uma plataforma digital voltada ao planejamento turístico no **Litoral Norte de Pernambuco**, abrangendo **Igarassu, Goiana, Paulista, Olinda, Itapissuma e Ilha de Itamaracá**. A proposta centraliza informações turísticas, apoia a criação de roteiros personalizados por inteligência artificial e conecta viajantes a guias de turismo cadastrados no **Cadastur** e estabelecimentos locais.

## Funcionalidades Principais
- **Criação personalizada de roteiros:** sugestões organizadas por destino (município ou praia), duração da viagem, orçamento (econômico, moderado ou alto padrão) e interesses (praias, ecoturismo, história, gastronomia e lazer).
- **Consultoria dinâmica por IA (Marejar IA):** assistente em formato de chat para tirar dúvidas e receber recomendações sobre o turismo pernambucano.
- **Catálogo do litoral e serviços locais:** exploração por categorias (como Litoral Norte, Litoral Sul, hospedagens, restaurantes e guias turísticos) com foco em profissionais credenciados no Cadastur[cite: 1].
- **Cadastro, autenticação e perfil:** gerenciamento de usuários com hash de senhas via `bcrypt`, autenticação via `JWT` e persistência em `backend/data/db.json`[cite: 1].
- **Localização e acessibilidade:** integração com mapas/links de localização e recursos voltados à responsividade e acessibilidade[cite: 1].

## Tecnologias e Arquitetura
- **Front-end:** HTML5, CSS3 e JavaScript (Vanilla JS), realizando requisições HTTP assíncronas (`fetch`) para a API[cite: 1].
- **Back-end:** Node.js com Express (executando na porta `3001`), `JWT` (`jsonwebtoken`), `bcrypt`, `dotenv`, `CORS` e `nodemon`[cite: 1].
- **Banco de dados / Persistência:** arquivo JSON estruturado em `backend/data/db.json` (com coleção `users` e campos específicos como `registration` e `attributes` quando aplicável)[cite: 1].

## Integrantes do Projeto
- Dante Vinícius Ferreira Lopes
- Gabrielly Chateaubriand Rosa
- João Enrick Silva Ferreira
- Juana Gabriela Gomes dos Santos
- Lázaro Filipe da Silva Borges
- Lívia Regina de Oliveira Pereira
- Luiz Guilherme da Silva Pereira
- Miguel Alves Dias de Moura
