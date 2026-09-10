# Etapa 2 — texto editorial e busca do Acervo

Não há SQL novo. Esta PR depende da migração `202609100002_supplier_profile_structure.sql` da PR #28, já aplicada no projeto segundo a confirmação do responsável.

## Alterações

- Página inicial: Descobrir, Selecionar e Zelar, com texto editorial atualizado.
- Acervo: categoria, cidade, serviço efetivamente declarado e faixa de investimento; os filtros se combinam.
- Pesquisa da página inicial: seção expansível com serviço e faixa, mantendo a primeira linha compacta.
- Serviços incluem os textos personalizados/antigos; busca ignora acentos/caixa, mas não confunde serviços apenas por palavras parecidas.
- Trocar a categoria limpa o serviço anterior. As faixas permanecem combináveis com a nova categoria.
- Cidade considera território explícito. Em perfis legados sem cidades de atendimento cadastradas, utiliza a sede. Não infere deslocamento por texto livre.
- Perfis sem faixa aparecem na busca geral, mas não são enquadrados automaticamente em uma faixa.
- Filtros ficam na URL, permitindo compartilhar, recarregar e voltar do perfil com a busca preservada.
- Restauração de rolagem aguarda dados do Acervo e personalização; layout das capas reserva espaço.
- Localização do casal usa profiles.location antes dos metadados de autenticação. Contas legadas de casais são reconhecidas, mas uma conta com perfil de fornecedor não é tratada como casal apenas pelo role legado noiva.
- Página pública do fornecedor mostra faixas declaradas e território; preços antigos deixam de aparecer nesses cards/detalhes. Disponibilidade sempre sob consulta.
- Correção de teclado: ativar coração/WhatsApp não abre também o perfil.

## Como testar depois do deployment

1. Confirme no painel do fornecedor os serviços, cidades atendidas e faixas; salve.
2. No Acervo, combine Cinematografia + um serviço da Vértice + sua faixa. Confira se o card aparece.
3. Selecione outra faixa que o fornecedor não marcou: ele não deve aparecer.
4. Selecione cidade atendida diferente da sede e confira o resultado.
5. Abra o perfil, confira serviços/faixas/território e use Voltar ao Acervo. Os filtros e a posição devem ser preservados.
6. Recarregue o Acervo filtrado e use Limpar filtros.
7. No celular, abra Filtros e teste os quatro controles.
8. Na página inicial, abra Refinar por serviço e investimento e use Ver referências.

Validação automatizada: `node tests/acervo-search.mjs` e `tsc --noEmit`. Confirmar build da Vercel antes do merge e teste autenticado depois da publicação.

## Continuidade

A próxima etapa do plano é o Passaporte: categorias procuradas/contratadas, até três prioridades e preferência de investimento. Esta entrega conecta a oferta à pesquisa, sem introduzir IA, agendas, cobrança ou disparos de e-mail. A LUMI permanece para o piloto após os dados dos casais estarem estruturados.
