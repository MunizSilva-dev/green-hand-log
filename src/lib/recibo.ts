import { moeda, type Cliente, type Config, type Servico } from "@/lib/store";

/** Monta a mensagem de cobrança do serviço, no mesmo formato do recibo THE GARDEN. */
export function montarRecibo({
  servico,
  cliente,
  config,
}: {
  servico: Servico;
  cliente?: Cliente | undefined;
  config: Config;
}) {
  const linhas: string[] = [];
  linhas.push("*THE GARDEN*");
  linhas.push("_Jardinagem e roçada profissional_");
  linhas.push("");
  if (config.profissionalNome) linhas.push(`*Responsável:* ${config.profissionalNome}`);
  if (config.profissionalCpf) linhas.push(`*CPF:* ${config.profissionalCpf}`);
  linhas.push("");
  linhas.push("*CLIENTE*");
  linhas.push(`Cliente: ${cliente?.nome ?? "-"}`);
  if (cliente?.endereco) linhas.push(`Endereço: ${cliente.endereco}`);
  if (cliente?.cidade) linhas.push(`Cidade: ${cliente.cidade}`);
  linhas.push(`Data: ${new Date(`${servico.data}T00:00`).toLocaleDateString("pt-BR")}`);
  linhas.push("");
  linhas.push("*Serviços Prestados*");
  linhas.push(`• ${servico.tipo} — ${moeda(servico.valor)}`);
  for (const extra of servico.extras) linhas.push(`• ${extra}`);
  linhas.push("");
  linhas.push(`*TOTAL: ${moeda(servico.valor)}*`);
  if (config.pixNome || config.pixChave) {
    linhas.push("");
    linhas.push("*PIX*");
    if (config.pixNome) linhas.push(config.pixNome);
    if (config.pixChave) linhas.push(`Chave (${config.pixTipo}): ${config.pixChave}`);
  }
  if (config.contato) {
    linhas.push("");
    linhas.push(`Contato: ${config.contato}`);
  }
  return linhas.join("\n");
}

export function linkWhatsapp(numero: string, texto: string) {
  const so = numero.replace(/\D/g, "");
  const base = so ? `https://wa.me/${so.length > 11 ? so : `55${so}`}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(texto)}`;
}
