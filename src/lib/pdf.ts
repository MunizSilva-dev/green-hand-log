/**
 * Geração de PDF no próprio dispositivo (nada é enviado para servidor).
 * Cobrança do serviço e relatório de serviços, no estilo do recibo THE GARDEN.
 */
import { jsPDF } from "jspdf";
import { moeda, type Cliente, type Config, type Servico } from "@/lib/store";

const VERDE: [number, number, number] = [27, 94, 32];
const VERDE_CLARO: [number, number, number] = [129, 199, 132];

function cabecalho(doc: jsPDF, subtitulo: string) {
  doc.setFillColor(...VERDE);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("THE GARDEN", 15, 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(subtitulo, 15, 23);
  doc.setTextColor(30, 30, 30);
}

function titulo(doc: jsPDF, texto: string, y: number) {
  doc.setFillColor(...VERDE_CLARO);
  doc.rect(15, y - 5, 180, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(20, 50, 25);
  doc.text(texto, 17, y);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "normal");
  return y + 10;
}

function rodape(doc: jsPDF, config: Config) {
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `THE GARDEN · Jardinagem e roçada${config.contato ? ` · ${config.contato}` : ""}`,
    105,
    287,
    { align: "center" },
  );
}

function baixar(doc: jsPDF, nome: string) {
  doc.save(nome);
}

const soNumeros = (t: string) => t.replace(/[^0-9a-zA-Z]/g, "");

/** PDF de cobrança — sem tempo de serviço e sem nomes da equipe. */
export function gerarCobrancaPdf({
  servico,
  cliente,
  config,
}: {
  servico: Servico;
  cliente?: Cliente | undefined;
  config: Config;
}) {
  const doc = new jsPDF();
  cabecalho(doc, "Recibo de serviço");

  let y = 42;
  doc.setFontSize(10);
  if (config.profissionalNome) {
    doc.setFont("helvetica", "bold");
    doc.text("Responsável:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(config.profissionalNome, 45, y);
    y += 6;
  }
  if (config.profissionalCpf) {
    doc.setFont("helvetica", "bold");
    doc.text("CPF:", 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(config.profissionalCpf, 45, y);
    y += 6;
  }

  y = titulo(doc, "CLIENTE", y + 6);
  const dados: [string, string][] = [
    ["Cliente", cliente?.nome ?? "-"],
    ["Endereço", cliente?.endereco ?? "-"],
    ["Cidade", cliente?.cidade ?? "-"],
    ["Data", new Date(`${servico.data}T00:00`).toLocaleDateString("pt-BR")],
  ];
  for (const [rotulo, valor] of dados) {
    doc.setFont("helvetica", "bold");
    doc.text(`${rotulo}:`, 15, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(valor), 45, y);
    y += 6;
  }

  y = titulo(doc, "SERVIÇOS PRESTADOS", y + 6);
  doc.text(`• ${servico.tipo}`, 17, y);
  doc.text(moeda(servico.valor), 193, y, { align: "right" });
  y += 6;
  for (const extra of servico.extras) {
    doc.text(`• ${extra}`, 17, y);
    y += 6;
  }

  y += 2;
  doc.setDrawColor(...VERDE);
  doc.line(15, y, 195, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("TOTAL", 17, y);
  doc.text(moeda(servico.valor), 193, y, { align: "right" });
  doc.setFontSize(10);

  if (config.pixNome || config.pixChave) {
    y = titulo(doc, "PAGAMENTO VIA PIX", y + 12);
    if (config.pixNome) {
      doc.text(`Favorecido: ${config.pixNome}`, 17, y);
      y += 6;
    }
    if (config.pixChave) {
      doc.text(`Chave ${config.pixTipo}: ${config.pixChave}`, 17, y);
      y += 6;
    }
  }

  rodape(doc, config);
  baixar(doc, `cobranca-${soNumeros(cliente?.nome ?? "cliente")}-${servico.data}.pdf`);
}

/** PDF de relatório: cliente, valor e despesas de cada serviço concluído. */
export function gerarRelatorioPdf({
  servicos,
  clientes,
  config,
  periodo,
}: {
  servicos: Servico[];
  clientes: Cliente[];
  config: Config;
  periodo: string;
}) {
  const doc = new jsPDF();
  cabecalho(doc, `Relatório de serviços · ${periodo}`);

  let y = titulo(doc, "SERVIÇOS CONCLUÍDOS", 42);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Data", 17, y);
  doc.text("Cliente", 40, y);
  doc.text("Despesas", 150, y, { align: "right" });
  doc.text("Valor", 193, y, { align: "right" });
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(15, y, 195, y);
  y += 6;
  doc.setFont("helvetica", "normal");

  let totalValor = 0;
  let totalDespesa = 0;

  for (const s of servicos) {
    if (y > 265) {
      doc.addPage();
      y = 25;
    }
    const nome = clientes.find((c) => c.id === s.clienteId)?.nome ?? "Cliente";
    const despesas = s.despesas ?? [];
    const somaDespesa = despesas.reduce((a, d) => a + (d.valor || 0), 0);
    totalValor += s.valor || 0;
    totalDespesa += somaDespesa;

    doc.text(new Date(`${s.data}T00:00`).toLocaleDateString("pt-BR"), 17, y);
    doc.text(doc.splitTextToSize(nome, 100)[0] ?? nome, 40, y);
    doc.text(somaDespesa ? moeda(somaDespesa) : "—", 150, y, { align: "right" });
    doc.text(moeda(s.valor || 0), 193, y, { align: "right" });
    y += 6;

    for (const d of despesas) {
      if (!d.descricao && !d.valor) continue;
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text(`- ${d.descricao || "Despesa"}: ${moeda(d.valor || 0)}`, 45, y);
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      y += 5;
    }
  }

  if (y > 250) {
    doc.addPage();
    y = 25;
  }
  y += 4;
  doc.setDrawColor(...VERDE);
  doc.line(15, y, 195, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Serviços: ${servicos.length}`, 17, y);
  y += 7;
  doc.text("Total recebido", 17, y);
  doc.text(moeda(totalValor), 193, y, { align: "right" });
  y += 7;
  doc.text("Total de despesas", 17, y);
  doc.text(moeda(totalDespesa), 193, y, { align: "right" });
  y += 7;
  doc.setTextColor(...VERDE);
  doc.text("Lucro", 17, y);
  doc.text(moeda(totalValor - totalDespesa), 193, y, { align: "right" });

  rodape(doc, config);
  baixar(doc, `relatorio-the-garden-${new Date().toISOString().slice(0, 10)}.pdf`);
}
