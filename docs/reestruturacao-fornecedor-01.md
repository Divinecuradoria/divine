# Entrega 1 — perfil dos fornecedores

## Instalação (antes de fazer merge)

1. Na branch desta PR, abra `supabase/migrations/202609100002_supplier_profile_structure.sql` no GitHub.
2. Clique em Raw e copie TODO o conteúdo, de `begin;` a `commit;`. Não copie o nome/caminho do arquivo.
3. No Supabase do DIVINE, abra SQL Editor → New query, cole o conteúdo e clique em Run.
4. O resultado esperado é `Success. No rows returned`. A migração foi testada também para execução repetida.
5. Após sucesso do SQL e dos checks da PR, faça merge e aguarde a Vercel concluir o deployment de produção.

O SQL adiciona colunas opcionais e uma função de salvamento. Não exclui registros, não altera aprovação/chancela e não despublica cards existentes. Requer as tabelas e permissões das migrações anteriores do projeto. Não executar todas as migrações antigas novamente.

## Teste no site

1. Entre como fornecedor e abra Meu painel.
2. Confira se nome, capa, categorias, portfólio e serviços antigos foram preservados.
3. Marque a categoria principal, alguns serviços, cidade-base, cidades atendidas e uma ou mais faixas. Para territórios adicionais, use o campo de texto.
4. Salve, recarregue a página e confira a persistência.
5. Altere o WhatsApp e salve pelo botão junto dos contatos. Recarregue e confira.
6. Remova uma categoria: serviços marcados exclusivos dela vão para o campo de outros serviços, para revisão, sem exclusão silenciosa.
7. Abra o perfil público e confira os serviços. O card deve continuar publicado mesmo com pendências.
8. Confira upload de capa e download da Chancela.

## Escopo e decisões

- Catálogo inicial com cinco sugestões para cada uma das 15 categorias; campo livre preserva serviços antigos e permite complementos.
- Categoria principal explícita, sem presumir que a primeira categoria retornada seja a principal.
- Território por IDs de cidades e complemento textual; não supõe atendimento em uma cidade apenas por ser a sede.
- Essencial, Ampliado e Exclusivo são faixas autodeclaradas, não níveis de qualidade ou chancela. A Curadoria deverá calibrar sua interpretação por categoria antes de usá-las como filtro de recomendação.
- O checklist considera os valores em edição; a confirmação de persistência ocorre ao salvar. Salvar parcialmente é permitido para os fornecedores existentes.
- Disponibilidade e proposta comercial continuam sob consulta.
- Não há integração de IA, calendário, e-mails novos, cobrança ou filtro público novo nesta PR.
- A exigência de perfil completo como condição para novas publicações será uma etapa própria do fluxo editorial; este checklist não muda a função de publicação existente.
- E-mail de acesso já existente é exibido; não foi criado campo de e-mail privado dentro da tabela pública suppliers.

## Validação técnica

`tsc --noEmit` para TypeScript. Teste `tests/supplier-profile-database.mjs` em PostgreSQL descartável PGlite: migração repetida, acesso do proprietário, negação a terceiros/anônimos, dados inválidos, campos editoriais não alterados pela função, salvamento parcial e rollback se a gravação de categorias falhar.

A função usa SECURITY INVOKER, opera sob RLS e lista explicitamente os campos editáveis. Não substitui uma auditoria de permissões já existentes no banco de produção. A migração precisa ser aplicada antes do código novo.
