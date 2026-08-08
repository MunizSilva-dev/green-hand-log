/**
 * Notificações locais do PWA:
 * - resumo diário no horário configurado (padrão 07:00)
 * - serviço iniciando em 30 minutos
 * - serviço atrasado
 * - serviço concluído
 */
import type { Cliente, Servico } from "./store";

const MARCA = "the-garden:notificados";

function jaNotificado(chave: string) {
  const set = new Set<string>(JSON.parse(localStorage.getItem(MARCA) || "[]"));
  if (set.has(chave)) return true;
  set.add(chave);
  localStorage.setItem(MARCA, JSON.stringify([...set].slice(-200)));
  return false;
}

export async function pedirPermissao() {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "default") return await Notification.requestPermission();
  return Notification.permission;
}

export function notificar(titulo: string, corpo: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  new Notification(titulo, { body: corpo, icon: "/icon-192.png", badge: "/icon-192.png" });
}

export function verificarNotificacoes(
  servicos: Servico[],
  clientes: Cliente[],
  horaNotificacao: string,
) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const agora = new Date();
  const dia = agora.toISOString().slice(0, 10);
  const nome = (id: string) => clientes.find((c) => c.id === id)?.nome ?? "Cliente";
  const doDia = servicos
    .filter((s) => s.data === dia && s.status !== "cancelado")
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const [hh, mm] = horaNotificacao.split(":").map(Number);
  const alvo = new Date(agora);
  alvo.setHours(hh ?? 7, mm ?? 0, 0, 0);
  if (agora >= alvo && doDia.length && !jaNotificado(`diario:${dia}`)) {
    notificar(
      "Clientes agendados para hoje",
      doDia.map((s) => `${nome(s.clienteId)} – ${s.hora}`).join("\n"),
    );
  }

  for (const s of doDia) {
    const inicio = new Date(`${s.data}T${s.hora}:00`);
    const diffMin = (inicio.getTime() - agora.getTime()) / 60000;
    if (s.status === "agendado" && diffMin > 0 && diffMin <= 30 && !jaNotificado(`30:${s.id}`)) {
      notificar("Serviço em breve", `${nome(s.clienteId)} começa às ${s.hora}`);
    }
    if (s.status === "agendado" && diffMin < -15 && !jaNotificado(`atraso:${s.id}`)) {
      notificar("Serviço atrasado", `${nome(s.clienteId)} estava previsto para ${s.hora}`);
    }
  }
}
