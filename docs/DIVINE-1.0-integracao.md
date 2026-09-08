# DIVINE 1.0 — Integração comercial e editorial

## Decisões preservadas

- Referência DIVINE, Acervo DIVINE, Chancela DIVINE e Passaporte DIVINE.
- Centro-Oeste Mineiro, sem anunciar quantidade de cidades ou vagas.
- Ficha curta; qualidade 30%, confiança 25%, experiência 20%, identidade 15%, profissionalismo 10%.
- Notas de 1 a 5, privadas, com decisão editorial explícita. Sem aprovação automática por pontuação.
- Mérito e valor estratégico separados. Pagamento não concede, renova ou prioriza a chancela.
- Experiência e quantidade de casamentos são evidências, inclusive aceitando zero.

## Fatia implementada neste PR

| Operação | Superfície | Resultado |
|---|---|---|
| Identificação | /entrar?next=/aplicar | Google ou link por e-mail; retorno permitido somente a destinos internos fixos |
| Candidatura | /aplicar | Ficha sem CPF/CNPJ e senha; protocolo persistido; uma candidatura por conta neste ciclo |
| Acompanhamento | /aplicar | O titular consulta o estado, sem acesso às notas ou justificativas internas |
| Avaliação | /curadoria | Curador explicitamente autorizado registra cinco notas, justificativa e decisão; histórico preservado |
| Publicação | /curadoria | Ação separada, somente depois da aprovação |
| Reconhecimento público | /referencia?id=UUID | Apenas campos autorizados; referências e dados internos nunca consultados pela página |

A validade é de um ano desde a avaliação. Retirar e republicar não estende a validade. Nova avaliação retira a publicação; exige nova ação explícita. Publicação vencida não é visível pela política do banco.

## Ativação — necessária antes de incorporar à produção

1. Concluir a revisão do PR #1. Este PR foi preparado sobre `fix/passo-1-navegacao-acesso`; retarget para main após a integração daquele PR.
2. Conferir em ambiente de homologação o esquema, políticas, grants e gatilhos existentes do Supabase. O repositório não os contém. A migração é aditiva e não os substitui.
3. Aplicar `supabase/migrations/202609080001_curadoria.sql` primeiro em homologação. Confirmar ausência de colisões com objetos de nome `divine_*`.
4. Designar a conta responsável pela curadoria. Um administrador do banco insere seu UUID real de `auth.users` em `public.divine_reviewers(user_id)`. Nunca permitir inserção pela interface e nunca inferir permissão a partir de metadados editáveis pelo usuário.
5. Conferir URLs de retorno de autenticação em homologação e produção, incluindo `/auth/callback?next=/aplicar` e `/auth/callback?next=/curadoria`.
6. Validar com três sessões reais: candidato, curador e visitante. Candidato não lê outra candidatura nem notas; visitante só lê publicação vigente; publicação exige decisão explícita.
7. Revisar os avisos de uso de dados com o responsável pelo projeto e definir atendimento para correção/retirada de candidatura. A interface oferece contato; este PR não substitui a política de privacidade completa.
8. Só então incorporar código e migração ao ambiente de produção. Não aplicar a migração em produção automaticamente.

## Limite de integração com o Acervo existente

O diretório atual consulta `suppliers` e favoritos têm ligação com esse cadastro. Este PR não redireciona essa consulta para `divine_publications`: isso perderia os IDs e poderia quebrar favoritos. A nova página de Referência é compartilhável, mas as novas publicações ainda não alimentam o diretório automaticamente.

Próxima entrega, após inspecionar o esquema real: criar vínculo único entre candidatura e `suppliers`, publicar uma projeção pública somente de aprovações vigentes e preservar os IDs usados em favoritos. Rever também os acessos diretos à tabela antiga; um filtro no navegador não resolve permissões do banco. Definir migração dos registros antigos com decisão editorial, sem chancela automática. Essa integração é um requisito para o lançamento público do fluxo completo.

## Próximas entregas comerciais e técnicas

| Prioridade | Trabalho comercial | Trabalho técnico | Aceite |
|---|---|---|---|
| 1 | Avaliar primeiros candidatos | Ativar e validar esta fatia em homologação | Candidatura → avaliação → página pública, com isolamento de dados |
| 2 | Confirmar território atendido | Relacionar candidaturas a fornecedores; Acervo com chancela vigente e busca por atuação | IDs/favoritos preservados; cidade-base não limita cobertura |
| 3 | Radar inaugural nos seis segmentos prioritários | Base privada com fonte, data, evidência e próxima ação | Nomes reais deduplicados; desconhecido não recebe nota inventada |
| 4 | Seleção assistida para casais piloto | Perfil, critérios de compatibilidade e justificativas | Opções pertinentes; lacunas claramente sinalizadas |
| 5 | Convites de parceiros aos próprios clientes | Origem e eventos de conversão | Separar cadastro, clique, conversa confirmada e contratação informada |

## Radar — contrato de informação

Uma identidade por profissional, com múltiplas categorias e áreas de atuação. Registrar nome, cidade-base, categoria, serviços, territórios declarados, evidências com URL e data, presença digital, pendências e próxima ação. Mérito permanece sem nota quando não verificado. Valor estratégico ordena os convites, sem alterar a aprovação. Prioridade A/B/C e marcação independente de possível Joia Oculta.

Não armazenar nomes reais, referências de clientes, contatos privados, notas ou dossiês neste repositório público. A documentação é método; a operação deve ficar em base privada com acesso restrito.

## Métricas de piloto

- Candidaturas recebidas → avaliadas → aprovadas → publicadas (etapas distintas).
- Tempo e esforço por avaliação; fila pendente.
- Casais que recebem seleção pertinente e iniciam conversa útil.
- Casos sem cobertura, tempo até seleção e resposta dos profissionais.
- Custo de atendimento e aquisição antes de ampliar o volume gratuito.

## Verificação

`pnpm exec tsc --noEmit` e `pnpm build` verificam o aplicativo. `tests/curadoria-database.mjs` executa a migração em PostgreSQL descartável via PGlite, com papéis de autenticação simulados, e verifica isolamento, permissões, aprovação, publicação, retirada e validade. PGlite é uma dependência somente do ambiente de teste, não adicionada ao produto. Esses testes não substituem a validação do Supabase real, autenticação por e-mail/Google e navegador.
