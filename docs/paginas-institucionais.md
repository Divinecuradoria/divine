# Páginas institucionais — minuta para revisão

## Entrega

- `/a-curadoria`: termos de uso, método, responsabilidades, publicação, independência comercial e planejamento futuro.
- `/privacidade`: dados utilizados, finalidade, visibilidade, infraestrutura, direitos e contato.
- `/duvidas`: respostas práticas em elementos `details` acessíveis por teclado.
- Rodapé inicial aponta para as páginas públicas. `/curadoria` continua sendo o painel privado.
- Componente comum com índice de seções, títulos hierárquicos, links de retorno e adaptação móvel.

## Pendências antes de publicar

Nome informado pelo responsável: M3Dev Sistemas e Marketing. Incluído nos termos e na política de privacidade como operador da plataforma e responsável pelo tratamento descrito. Mantido o e-mail divinecuradorianupcial@gmail.com para contato. CNPJ e endereço profissional não foram informados; não foram presumidos ou inventados. Esta PR permanece em rascunho. A identificação complementar e sua adequação jurídica continuam pendentes para revisão antes da publicação.

Submeter a minuta à revisão jurídica, especialmente quanto ao papel efetivamente exercido pela plataforma, responsabilidades de consumo, identificação do controlador e tratamento de interesses que possam revelar saúde. Nenhum texto garante exclusão de responsabilidade.

Conferir na operação os acessos administrativos, contratos e regiões dos prestadores, mecanismos de transferência internacional, retenção e rotina de atendimento aos titulares. A página não implementa essas medidas e não declara conformidade integral. Definir uma rotina real de exclusão, conservação e resposta a incidentes; não prometer prazos técnicos sem validação.

As preferências incluem terapia e outros serviços potencialmente sensíveis. Antes de ampliar a personalização desses interesses, validar base legal e controles; interesse legítimo não deve ser usado como base genérica para dados sensíveis. A minuta não substitui eventual consentimento específico ou revisão do formulário.

## Limites desta alteração

Não altera banco, autenticação, RLS, processamento de imagens ou consentimentos existentes. Não registra aceite dos termos nem adiciona banner de cookies. Um aceite versionado, caso definido juridicamente, precisa de implementação própria; o simples link no rodapé não constitui prova de aceite.

LUMI, VIP, automações, eventos e novos planos são apresentados como possibilidades sem prazo, disponibilidade ou contratação implícita. Novas finalidades de dados e envios em nome do casal precisam de informação e autorização próprias quando aplicáveis. Não há código de IA, cobranças ou envio de e-mails nesta PR.

## Correspondência com o produto

Textos preparados com base nos fluxos de leads, candidaturas e publicações, no Passaporte e nas preferências privadas, nas capas públicas e fotos privadas, e nas integrações Supabase, Resend e Vercel presentes no código. As configurações remotas não foram auditadas nesta alteração.

## Fontes de referência

- Código de Defesa do Consumidor: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- Lei Geral de Proteção de Dados: https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm
- Vercel Web Analytics, privacidade: https://vercel.com/docs/analytics/privacy-policy

## Validação

`node node_modules/typescript/bin/tsc --noEmit` passou. Revisar o Preview da Vercel em celular e desktop e navegar pelo índice e pelas perguntas antes do merge. Não é necessária execução de SQL.
