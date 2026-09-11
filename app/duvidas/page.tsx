import type { Metadata } from "next"
import Link from "next/link"
import { InstitutionalContact, InstitutionalPage } from "@/components/institutional-page"

export const metadata: Metadata = { title: "Dúvidas frequentes | DIVINE", description: "Respostas sobre o Passaporte, a curadoria, a contratação de fornecedores e a privacidade." }

const questions = [
  ["O Passaporte é gratuito?", "Sim. O Passaporte básico permite organizar seu perfil, interesses e favoritos. Um eventual plano VIP será opcional e terá condições próprias antes de qualquer contratação."],
  ["O convite já significa aprovação?", "Não. O convite permite avançar na avaliação. Aprovação como Referência e publicação no Acervo são etapas distintas."],
  ["Um fornecedor pode comprar a chancela?", "Não. Divulgação e serviços comerciais não substituem a decisão editorial. As faixas de investimento também não representam níveis de qualidade da chancela."],
  ["A indicação garante disponibilidade?", "Não. A disponibilidade é sempre confirmada diretamente com o profissional. Favoritos e filtros não reservam datas nem fixam valores."],
  ["Com quem contrato o serviço?", "Diretamente com o fornecedor. Confira escopo, equipe, prazos, pagamento e cancelamento em contrato. A DIVINE não recebe o pagamento do evento nesta versão."],
  ["Minha foto e meus favoritos ficam públicos?", "Os dados privados do Passaporte não integram o Acervo. Já o perfil publicado do fornecedor, com sua capa e contatos profissionais, é público."],
  ["A LUMI já está disponível?", "A LUMI integra o planejamento de novas experiências. Seus recursos, condições de acesso e informações sobre uso de dados serão apresentados antes da ativação."],
]

export default function QuestionsPage() {
  return <InstitutionalPage title="Dúvidas frequentes" subtitle="Para conhecer o Acervo e dar o próximo passo com clareza." summary="A escolha continua sendo sua. A DIVINE ajuda a conhecer profissionais e organizar o que importa para o seu casamento." sections={[
    { id: "respostas", title: "Como funciona", content: <div className="divide-y divide-onix/10">{questions.map(([question, answer]) => <details key={question} className="py-4"><summary className="cursor-pointer pr-2 font-medium text-onix focus-visible:outline focus-visible:outline-bronze">{question}</summary><p className="mt-3">{answer}</p></details>)}</div> },
    { id: "ajuda", title: "Ainda precisa de ajuda?", content: <><p>Fale com a Curadoria pelo e-mail <InstitutionalContact />.</p><p>Consulte também os <Link href="/a-curadoria">Termos de uso</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</p></> },
  ]} />
}
