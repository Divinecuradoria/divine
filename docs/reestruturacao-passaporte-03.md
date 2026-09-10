# Etapa 3 — Serviços e escolhas do casal

O catálogo compartilhado contém exatamente as 15 categorias e os 113 serviços da última lista aprovada, sem subcategorias. O fornecedor pode selecionar serviços e escrever em **Outros serviços personalizados**; valores antigos continuam preservados no campo livre. As faixas de investimento existentes continuam iguais.

O Passaporte oferece, em cada categoria:

- Não selecionado, Procuramos ou Já contratado;
- Prioridade apenas para serviços procurados;
- Outros serviços personalizados, adicionados à própria categoria;
- Contagem de escolhas e salvamento explícito.

Serviços com o mesmo nome em categorias diferentes são escolhas independentes. Favoritar um fornecedor continua sendo uma ação diferente de declarar um serviço contratado. Não existe integração LUMI nem envio de e-mail nesta etapa.

## Instalação antes do merge

1. Abra `supabase/migrations/202609110001_passport_services.sql` nesta PR e clique em **Raw**.
2. Copie todo o texto SQL, de `begin;` até `commit;`.
3. No Supabase, abra **SQL Editor → New query**, cole o conteúdo e clique em **Run**. Não cole o nome/caminho do arquivo.
4. Com a consulta concluída, confira o build da Vercel e faça merge desta PR.

A migração cria a tabela privada `couple_service_preferences`, com validação e acesso apenas pelo titular. Renomeia Curadoria Musical para Curadoria Musical e Efeitos mantendo ID e slug, atualiza candidaturas existentes e aceita formulários antigos através de normalização. Não altera a chancela, o status dos interessados ou a publicação dos fornecedores. Requer as migrações anteriores já aplicadas no projeto.

Caso a migração não esteja aplicada, o bloco de escolhas informa falha de carregamento; o restante do Passaporte continua funcionando. Não permite salvar sobre dados que não foram carregados.

## Verificação

1. Entrar como casal, abrir Passaporte e expandir Cinematografia.
2. Marcar um serviço como Procuramos e como Prioridade. Marcar outro como Já contratado.
3. Adicionar um serviço personalizado, salvar e recarregar: conferir os três registros.
4. Mudar o prioritário para Já contratado: prioridade deve desmarcar.
5. Selecionar Degustação em Gastronomia e Confeitaria: devem ser independentes.
6. Remover uma seleção, salvar e reabrir. Outra conta não deve enxergar essas escolhas.
7. Conferir no fornecedor os serviços anteriores em Outros e as novas sugestões da categoria.
8. Conferir Curadoria Musical e Efeitos no formulário e Acervo, mantendo links antigos.

Testes locais: `node tests/passport-services.mjs`, `node tests/acervo-search.mjs`, `tsc --noEmit`. Banco descartável: `PGLITE_MODULE=/caminho/pglite/dist/index.js node tests/passport-services-database.mjs`.
