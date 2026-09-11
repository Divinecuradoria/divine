import type { Metadata } from "next"
import { InstitutionalContact, InstitutionalPage, type InstitutionalSection } from "@/components/institutional-page"

export const metadata: Metadata = {
  title: "Privacidade e dados pessoais | DIVINE",
  description: "Saiba quais dados o DIVINE utiliza, o que aparece publicamente e como solicitar acesso, correção ou exclusão de informações.",
}

const sections: InstitutionalSection[] = [
  { id: "contato", title: "Sobre esta política", content: <>
    <p>Esta política explica o tratamento de dados na plataforma DIVINE Curadoria Nupcial. Para assuntos de privacidade, o canal de contato é <InstitutionalContact />. Informe que sua mensagem trata de dados pessoais.</p>
    <p>A navegação e o cadastro não autorizam qualquer uso dos seus dados. Cada finalidade deve ter fundamento adequado e respeitar suas escolhas. Novas experiências que dependam de autorização serão apresentadas separadamente.</p>
  </> },
  { id: "dados", title: "O que utilizamos e para quê", content: <>
    <ul>
      <li><strong>Acesso:</strong> e-mail, identificador de conta e dados técnicos de autenticação para entrar e proteger a sessão. A autenticação é processada pelo Supabase; não envie sua senha ao atendimento.</li>
      <li><strong>Passaporte:</strong> nome, data, localização, convidados, WhatsApp, foto do casal e observações informadas para manter seu perfil. Serviços procurados ou contratados, prioridades e favoritos organizam suas escolhas e ajudam a personalizar a apresentação do Acervo.</li>
      <li><strong>Fornecedores:</strong> identificação e contato profissional, categoria, atuação, portfólio, experiência, referências e informações da candidatura para contato, avaliação e acompanhamento editorial.</li>
      <li><strong>Perfil público:</strong> apresentação, capa, serviços, categorias, atuação, faixa de investimento, portfólio, redes e WhatsApp profissional para divulgar uma Referência autorizada.</li>
      <li><strong>Uso e suporte:</strong> registros técnicos, visitas, cliques em contatos e comunicações recebidas para operar o site, acompanhar utilização e investigar falhas ou uso indevido.</li>
    </ul>
    <p>Evite inserir documentos, dados bancários, informações de saúde ou detalhes íntimos em observações e serviços personalizados. Algumas escolhas, como interesse em terapia, podem revelar informações sensíveis. Esses dados não devem ser usados para inferir diagnósticos ou direcionar publicidade; eventual tratamento que exija consentimento específico depende de uma solicitação própria.</p>
    <p>Ao indicar referências ou enviar fotos com outras pessoas, forneça apenas o necessário e respeite seus direitos. Na ficha de curadoria, não solicitamos telefones ou documentos das referências.</p>
  </> },
  { id: "visibilidade", title: "O que fica público", content: <>
    <p>O perfil profissional publicado no Acervo é público, inclusive seus meios de contato e imagens, e pode ser encontrado em buscadores. Publique contatos destinados ao atendimento comercial.</p>
    <p>A foto do casal, suas preferências e os registros privados do Passaporte não fazem parte do Acervo. As informações internas da candidatura e da avaliação editorial também não são apresentadas no perfil público. O acesso técnico e operacional deve se limitar às pessoas e aos serviços necessários à finalidade.</p>
    <p>Ao abrir um portfólio, rede social ou WhatsApp, você acessa outro serviço, com suas próprias regras. Os dados que enviar diretamente ao fornecedor passam a ser tratados também por ele.</p>
  </> },
  { id: "fundamentos", title: "Finalidades e fundamentos", content: <>
    <p>Dados necessários à conta, às funcionalidades solicitadas e à candidatura são utilizados para prestar esses serviços e realizar os procedimentos solicitados por você. Registros também podem ser conservados para cumprir obrigações legais ou exercer direitos.</p>
    <p>Segurança, prevenção de abuso e melhorias operacionais podem se apoiar em interesse legítimo, quando cabível, com avaliação de necessidade, impacto e proteção dos titulares. Essa base não se aplica indistintamente a dados sensíveis. Quando o fundamento for consentimento, ele deverá ser específico e poderá ser revogado.</p>
    <p>Convites de curadoria e mensagens de autenticação estão ligados ao processo solicitado. A inscrição não equivale a autorização para campanhas de terceiros ou para venda de contatos.</p>
  </> },
  { id: "tecnologia", title: "Serviços de tecnologia", content: <>
    <p>A estrutura utiliza Supabase para autenticação, banco e arquivos, Resend para envio de e-mails e Vercel para hospedagem e análise de uso. Esses serviços recebem os dados necessários à operação correspondente. A localização do processamento depende da infraestrutura e pode envolver outros países; transferências devem observar as garantias exigidas pela legislação aplicável.</p>
    <p>O navegador armazena informações para manter sua sessão e recuperar a posição no Acervo. Filtros podem aparecer no endereço da página. A análise de uso da Vercel é integrada à versão de produção. Esta política não equivale a consentimento para rastreadores publicitários.</p>
    <p>Sair da conta e limpar os dados do site remove informações locais e pode exigir novo acesso. Isso não exclui automaticamente os dados da conta no servidor.</p>
  </> },
  { id: "protecao", title: "Proteção e conservação", content: <>
    <p>O sistema utiliza autenticação e regras de acesso. Fotos do casal usam armazenamento privado com acesso temporário; capas profissionais são públicas para exibição no Acervo. A compactação de imagens melhora o carregamento, mas não altera a finalidade ou a autorização de uso.</p>
    <p>Nenhum sistema elimina todos os riscos. Suspeitas de exposição ou acesso indevido podem ser comunicadas pelo nosso canal. Incidentes serão avaliados e comunicados quando exigido.</p>
    <p>A conservação depende da finalidade: prestação do serviço, acompanhamento da candidatura, obrigações e defesa de direitos. Após o encerramento, os dados sem justificativa de manutenção devem ser eliminados ou anonimizados. Cópias de segurança podem seguir ciclos próprios de remoção, sem autorizar novos usos incompatíveis.</p>
  </> },
  { id: "direitos", title: "Seus direitos e solicitações", content: <>
    <p>Você pode solicitar confirmação de tratamento, acesso e correção, informações sobre compartilhamento, revisão de decisões automatizadas aplicáveis e, nas hipóteses previstas em lei, portabilidade, bloqueio, anonimização ou eliminação. Pode ainda revogar consentimento e questionar tratamentos inadequados.</p>
    <p>Envie sua solicitação a <InstitutionalContact />, de preferência pelo e-mail da conta. Poderemos pedir somente informações necessárias para confirmar sua identidade. Não envie senha ou cópia de documento por iniciativa própria. A resposta observará os prazos legais aplicáveis e explicará eventuais limites de exclusão ou conservação.</p>
    <p>O cadastro não se destina a crianças. Caso identifique dados de menores inseridos indevidamente, contate a DIVINE para análise e providências. Você também pode recorrer à Autoridade Nacional de Proteção de Dados e aos órgãos competentes.</p>
  </> },
  { id: "novas-experiencias", title: "LUMI e novas experiências", content: <>
    <p>LUMI, Passaporte VIP e automações de contato estão no planejamento. Esta política não autoriza transmitir dados privados a modelos de IA, treinar modelos com esses dados ou contatar fornecedores em seu nome.</p>
    <p>Antes de ativar novos tratamentos, serão informados finalidade, dados necessários, destinatários e opções de controle. Mudanças relevantes serão comunicadas, e permissões específicas serão solicitadas quando necessárias. O texto será atualizado para refletir a operação efetiva.</p>
  </> },
]

export default function PrivacyPage() {
  return <InstitutionalPage title="Privacidade" subtitle="Informação clara sobre os dados que acompanham sua experiência." summary="O perfil público do fornecedor e o espaço privado do casal têm finalidades diferentes. Aqui explicamos essa distinção e como falar conosco sobre seus dados." sections={sections} />
}
