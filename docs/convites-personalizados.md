# Gerador de convites

Acesso: Curadoria → Gerar convite personalizado (`/curadoria/convites`). Exige que `divine_is_reviewer` retorne verdadeiro, inclusive ao gerar a arte.

1. Informe o nome profissional (até 100 caracteres).
2. Selecione convite para avaliação ou formação inaugural já aprovada.
3. Para a segunda opção, confirme que houve avaliação e aprovação reais.
4. Gere a prévia e baixe o PNG de 1200 × 1800 pixels.

Arte em ônix, bronze e alabastro, mesmo selo do gerador da chancela, título manuscrito Allura e corpo em fonte serifada para leitura. Nomes longos usam até duas linhas com redução limitada; nomes que não cabem são recusados, sem corte silencioso. Alterar campos invalida a prévia anterior.

O QR aponta para `https://www.divinecuradoria.com.br/aplicar`, sem nome ou dados pessoais no endereço. A matriz local possui correção M e quatro módulos de margem. Não usa serviço externo de geração de QR. Se o destino mudar, regenerar a matriz de `lib/invitation-qr.ts` e validar por decodificação; mudar apenas a constante de URL não muda o QR.

A geração é local no navegador. Não envia convites, não armazena a lista, não altera status, não cria autorização de publicação e não contorna o fluxo de candidatura. O QR público não é um token de aprovação. A opção de aprovado depende da declaração do curador, não consulta uma candidatura pelo nome. A aprovação no sistema continua exigindo o processo próprio.

Sem novas dependências npm ou migração SQL. Allura é servida pelo Next Font, como as fontes existentes no projeto.

Validação: TypeScript; renderização dos dois modelos, incluindo nome longo; decodificação do QR nas artes completas. Conferir também a prévia no navegador/mobile. No celular, o PNG pode abrir para salvar em Imagens conforme o navegador.
