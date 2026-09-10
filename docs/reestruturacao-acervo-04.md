# Etapa 4 — Acervo conectado ao Passaporte

O Acervo lê as escolhas privadas salvas pelo casal na etapa 3 e ordena os fornecedores que passam pelos filtros:

1. Quantidade de serviços procurados marcados como prioridade;
2. Quantidade total de serviços procurados correspondentes;
3. Cidade atendida declarada (ou sede, quando não há território cadastrado);
4. Favoritos;
5. Nome em ordem alfabética, com ID como desempate estável.

A correspondência exige categoria e serviço. São ignoradas diferenças de maiúsculas, acentos e pontuação; não se presume que palavras diferentes sejam sinônimos. Serviços antigos e personalizados continuam visíveis e filtráveis. Serviços contratados não recebem pontuação. Nenhum fornecedor é escondido por falta de correspondência, e os filtros manuais continuam aplicados antes da ordenação.

Os cards mostram até dois motivos da posição, quando existem. Localização sem correspondência exata com uma cidade cadastrada não recebe prioridade territorial. A sede é identificada como sede, não como garantia de deslocamento. Não há influência comercial, chamada de IA, reserva ou envio de mensagens nesta etapa.

Visitantes e fornecedores veem o Acervo agrupado por categorias em ordem alfabética. Trocar de conta ou sair limpa as preferências; respostas pendentes de uma sessão anterior são descartadas.

## Publicação

Não requer SQL novo nem variáveis de ambiente. Requer a migração da PR #30 para carregar as escolhas do casal. Se essa tabela não puder ser lida, o Acervo continua funcionando e informa que está usando localização e favoritos.

Após a Vercel aprovar esta PR, fazer merge. No Passaporte, marcar serviços procurados/prioritários, salvar e abrir o Acervo. Conferir que um serviço contratado não aparece como motivo de prioridade; testar filtros e retorno do perfil. Testar também visitante, fornecedor e troca entre contas de casais.

## Validação automatizada

`tsc --noEmit`, `node tests/acervo-search.mjs`, `node tests/passport-services.mjs` e `node tests/acervo-personalization.mjs`.

O teste de personalização cobre categoria e serviço, prioridades, serviços contratados, território declarado, sede legada, dados ausentes, nomes normalizados, serviços personalizados, desempates e compatibilidade da categoria musical.
