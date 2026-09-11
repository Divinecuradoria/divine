import type { Metadata } from "next"
import Link from "next/link"
import { InstitutionalContact, InstitutionalPage, type InstitutionalSection } from "@/components/institutional-page"

export const metadata: Metadata = {
  title: "A Curadoria · Termos de uso | DIVINE",
  description: "Conheça a proposta DIVINE, os critérios editoriais, as responsabilidades na contratação e os projetos futuros da plataforma.",
}

const sections: InstitutionalSection[] = [
  { id: "proposta", title: "O que é a DIVINE", content: <>
    <p>A DIVINE Curadoria Nupcial é uma plataforma operada por M3Dev Sistemas e Marketing e aproxima casais e profissionais selecionados do mercado de casamentos, inicialmente no Centro-Oeste Mineiro. O Acervo reúne perfis profissionais; o Passaporte organiza interesses, prioridades e favoritos do casal.</p>
    <p>Estes termos orientam o uso do site por visitantes, casais e fornecedores. A DIVINE oferece descoberta, informação e curadoria editorial. Nesta versão, não recebe pagamentos pelos casamentos, não celebra contratos em nome dos profissionais e não organiza a execução do evento.</p>
  </> },
  { id: "metodo", title: "Curadoria e reconhecimento", content: <>
    <p>O cadastro inicial manifesta interesse. O convite permite avançar na avaliação, mas não equivale à aprovação. A ficha e as evidências disponíveis subsidiam uma decisão humana sobre qualidade do trabalho, reputação e confiança, experiência do cliente, identidade e profissionalismo.</p>
    <p>A aprovação concede o reconhecimento de Referência DIVINE. A publicação no Acervo é uma etapa própria. Notas e justificativas de avaliação são internas. Experiência e volume de eventos são evidências, sem aprovação automática por tempo de mercado.</p>
    <p>A Chancela DIVINE tem a validade indicada no perfil e está sujeita a revisão. Representa uma apreciação editorial, não uma certificação técnica, licença profissional, seguro ou garantia de resultado. Não substitui a verificação de habilitações e condições de contratação.</p>
    <p>O Acervo é deliberadamente limitado, sem reserva pública de vagas por categoria ou território. Nenhum pagamento compra aprovação, renovação ou manutenção da chancela.</p>
  </> },
  { id: "contratacao", title: "Contratação dos serviços", content: <>
    <p>Orçamentos, disponibilidade, reuniões, contratos e pagamentos são tratados diretamente entre casal e fornecedor. Um favorito, uma indicação, um clique no WhatsApp ou uma faixa de investimento não representam reserva, preço fechado ou compromisso de contratação.</p>
    <p>Antes de contratar, confirme serviços incluídos, deslocamento, equipe, prazos, condições de pagamento, cancelamento e plano para imprevistos. Registre o combinado em contrato e verifique as autorizações exigidas para o serviço.</p>
    <p>O fornecedor responde por suas informações, propostas, atendimento e execução, inclusive equipe, documentação, direitos de imagem e obrigações profissionais aplicáveis. Serviços de saúde, estética, turismo, alimentação e efeitos especiais exigem atenção às habilitações e regras próprias. A divulgação no Acervo não comprova, por si só, essas condições.</p>
    <p>A DIVINE não promete disponibilidade, satisfação integral ou ausência de falhas dos profissionais. Essa delimitação não afasta a responsabilidade da DIVINE por sua própria atuação nem as responsabilidades e os direitos que a legislação imponha em cada situação.</p>
  </> },
  { id: "contas", title: "Contas e informações", content: <>
    <p>Mantenha dados de contato e informações profissionais atualizados. Proteja sua senha e seus links de acesso; não os compartilhe. Comunique suspeitas de uso indevido pelo nosso canal de atendimento.</p>
    <p>Cadastre apenas informações verdadeiras e materiais que possa utilizar. Não se apresente como outra pessoa, publique conteúdo ilícito ou discriminatório, envie mensagens abusivas ou tente acessar dados privados de terceiros. Quem atua em nome de uma empresa deve estar autorizado a representá-la.</p>
    <p>As sugestões e a ordem de apresentação podem considerar localização, serviços e preferências informadas. Dependem da qualidade dos dados cadastrados e não substituem a escolha do casal. Categorias de investimento descrevem posicionamento comercial, sem criar níveis de qualidade da chancela.</p>
  </> },
  { id: "conteudo", title: "Imagens, perfis e chancela", content: <>
    <p>Ao fornecer material para um perfil público, o profissional deve ter os direitos e as autorizações necessários, inclusive das pessoas retratadas. A autorização de publicação abrange a apresentação no Acervo e os ajustes técnicos necessários, como redimensionamento e compactação, preservando o sentido do conteúdo. O material continua pertencendo a seus titulares.</p>
    <p>Campanhas externas e usos promocionais adicionais deverão respeitar as autorizações correspondentes. Fotos e informações privadas do Passaporte não se tornam material publicitário por causa do cadastro.</p>
    <p>O uso da arte da chancela é restrito à Referência autorizada, com nome e validade correspondentes. Não é permitido transferir o reconhecimento, adulterar a arte ou apresentá-lo como vigente após vencimento, suspensão ou retirada.</p>
  </> },
  { id: "comercial", title: "Independência editorial", content: <>
    <p>O Passaporte básico é gratuito. Qualquer serviço pago dependerá de oferta específica, com preço, escopo e condições apresentados antes da contratação. Não há cobrança automática decorrente destes termos.</p>
    <p>A visibilidade comercial é distinta da aprovação editorial. Conteúdos e posições contratados deverão ser identificados como publicidade ou conteúdo patrocinado. Comprar divulgação não garante chancela nem preferência na seleção personalizada do casal.</p>
  </> },
  { id: "futuro", title: "O que estamos planejando", content: <>
    <p>As possibilidades abaixo integram o planejamento e não constituem serviços disponíveis por esta página, benefícios adquiridos ou promessa de lançamento:</p>
    <ul>
      <li><strong>LUMI:</strong> assistência digital para compreender desejos e sugerir profissionais com base em localização, serviços, estilo e investimento informado.</li>
      <li><strong>Passaporte VIP:</strong> experiência opcional paga, com benefícios e eventual acesso à LUMI definidos em oferta própria.</li>
      <li><strong>Apoio a contatos:</strong> preparação de pedidos de disponibilidade e reuniões, sempre sob consulta. O envio em nome do casal exigirá confirmação específica; não haverá contratação automática.</li>
      <li><strong>Experiências e serviços profissionais:</strong> eventos, privilégios de parceiros, concierge, divulgação identificada, métricas e planos comerciais.</li>
      <li><strong>Expansão:</strong> ampliação territorial e estudos do mercado com dados tratados de forma compatível com sua finalidade e com a privacidade.</li>
    </ul>
    <p>Esses recursos poderão mudar ou não ser lançados. Se forem oferecidos, terão condições e informações de privacidade próprias antes da ativação. Estes termos não autorizam treinamento de IA com dados privados, compartilhamento comercial indiscriminado ou mensagens em nome dos usuários.</p>
  </> },
  { id: "atendimento", title: "Revisões e atendimento", content: <>
    <p>Problemas com perfis, direitos de imagem, conduta ou uso da chancela podem ser relatados a <InstitutionalContact />. Descreva o ocorrido e envie somente evidências necessárias. Uma reclamação será analisada; não implica retirada automática nem julgamento definitivo sobre o serviço.</p>
    <p>Diante de irregularidades ou riscos, a DIVINE poderá corrigir conteúdo, restringir acesso ou rever a publicação e a chancela. A pessoa afetada poderá pedir esclarecimentos e apresentar informações. Medidas urgentes de proteção podem anteceder esse contato.</p>
    <p>O site pode passar por manutenção e alterações. Atualizações materiais destas regras serão comunicadas de forma adequada antes de produzir novos compromissos, sem suprimir direitos ou modificar retroativamente contratações concluídas. Questões de consumo permanecem sujeitas aos canais e órgãos competentes, conforme a legislação brasileira.</p>
    <p>Sobre seus dados, consulte a <Link href="/privacidade">Política de Privacidade</Link>. Respostas práticas estão em <Link href="/duvidas">Dúvidas frequentes</Link>.</p>
  </> },
]

export default function CuradoriaTermsPage() {
  return <InstitutionalPage title="A Curadoria" subtitle="Termos de uso e compromissos da plataforma." summary="A chancela não se compra. A confiança se constrói com critérios, informação clara e responsabilidades bem definidas." sections={sections} />
}
