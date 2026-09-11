# Filtros por categoria e múltiplos serviços

Página inicial e Acervo usam o mesmo seletor de serviços com caixas de marcação.

- Selecionar categoria carrega a lista oficial dessa categoria, mesmo sem fornecedores publicados que ofereçam todos os serviços.
- Serviços personalizados declarados por fornecedores ativos da categoria também são incluídos; opções repetidas por diferenças de acentuação/maiúsculas são agrupadas.
- A busca exige todos os serviços selecionados. Categoria, cidade e faixa de investimento continuam combináveis.
- Trocar de categoria limpa as seleções de serviços anteriores. Limpar serviços mantém os demais filtros.
- A URL usa parâmetros `servico` repetidos, compatíveis com links antigos de um único serviço. Nomes com vírgulas ou símbolos não são separados indevidamente.
- Abrir um perfil e voltar preserva todos os parâmetros e a restauração de rolagem existente.
- A lista oficial é uma opção de busca, não uma afirmação de que qualquer fornecedor oferece o serviço. A correspondência usa os serviços realmente declarados no perfil.

Nenhum SQL ou variável de ambiente nova. Aguardar a Vercel e fazer merge.

## Teste no site

1. Na página inicial, escolher Cinematografia: conferir os oito serviços oficiais.
2. Marcar dois e clicar Ver referências. Ambos devem continuar marcados no Acervo.
3. Conferir que os resultados oferecem ambos. Se nenhum oferecer, deve aparecer resultado vazio, sem ampliar a busca silenciosamente.
4. Desmarcar um, combinar cidade/investimento, abrir perfil e voltar.
5. Trocar para Fotografia Documental: os serviços de Cinematografia devem ser limpos.
6. Repetir a troca entre as 15 categorias, incluindo Curadoria Musical e Efeitos.
7. No celular, abrir Filtros e marcar/desmarcar os serviços; conferir Limpar serviços e Limpar filtros.
8. Abrir um link antigo com um único `servico`, inclusive sem categoria, e conferir que é possível remover a seleção.

Validação automatizada: TypeScript, testes dos filtros (múltiplos, dados ausentes, parâmetros antigos, caracteres especiais), catálogo de 15 categorias/113 serviços e regressão de personalização.
