/**
 * THE GARDEN — camada de dados local-first.
 * Todos os dados ficam no dispositivo (localStorage, chave única por módulo),
 * com estrutura pronta para sincronização futura com um servidor.
 */
import { useSyncExternalStore } from "react";

export type Frequencia = "semanal" | "quinzenal" | "mensal" | "eventual";
export type StatusServico = "agendado" | "andamento" | "concluido" | "cancelado";
export type Prioridade = "baixa" | "media" | "alta";

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  bairro: string;
  cidade: string;
  observacoes: string;
  fotos: string[];
  areaM2: number;
  tempoEstimado: number; // minutos
  frequencia: Frequencia;
  criadoEm: string;
};

export type Material = { nome: string; quantidade: string };

export type Servico = {
  id: string;
  clienteId: string;
  data: string; // yyyy-MM-dd
  hora: string; // HH:mm
  tipo: string;
  tempoEstimado: number; // minutos
  observacoes: string;
  prioridade: Prioridade;
  endereco: string;
  status: StatusServico;
  inicioReal?: string;
  fimReal?: string;
  valor: number; // R$
  ajudantes: string[]; // ids de ajudantes
  extras: string[];
  materiais: Material[];
  ferramentas: string[];
  fotosAntes: string[];
  fotosDepois: string[];
  criadoEm: string;
};

export type Ajudante = {
  id: string;
  nome: string;
  telefone: string;
  observacoes: string;
  criadoEm: string;
};

export type Usuario = { nome: string; email: string; senhaHash: string };

export type Config = {
  horaNotificacao: string;
  notificacoesAtivas: boolean;
  /** Dados do recibo / cobrança (PIX) */
  profissionalNome: string;
  profissionalCpf: string;
  pixNome: string;
  pixChave: string;
  pixCpf: string;
  contato: string;
};

export type Estado = {
  usuario: Usuario | null;
  sessaoAtiva: boolean;
  clientes: Cliente[];
  servicos: Servico[];
  ajudantes: Ajudante[];
  config: Config;
};

export const FERRAMENTAS = [
  "Roçadeira 1",
  "Roçadeira 2",
  "Carrinho da roçadeira",
  "Motosserra",
  "Motopoda",
] as const;

export const MATERIAIS = [
  "Gasolina",
  "Óleo",
  "Fio de nylon",
  "Corrente",
  "Adubo",
  "Herbicida",
  "Outros",
] as const;

export const EXTRAS = [
  "Poda",
  "Limpeza",
  "Retirada de entulho",
  "Aplicação de produto",
  "Corte de árvore",
  "Outros",
] as const;

const KEY = "the-garden:v1";

const inicial: Estado = {
  usuario: null,
  sessaoAtiva: false,
  clientes: [],
  servicos: [],
  ajudantes: [],
  config: {
    horaNotificacao: "07:00",
    notificacoesAtivas: true,
    profissionalNome: "",
    profissionalCpf: "",
    pixNome: "",
    pixChave: "",
    pixCpf: "",
    contato: "",
  },
};

let estado: Estado = inicial;
let carregado = false;
const ouvintes = new Set<() => void>();

function carregar(): Estado {
  if (typeof window === "undefined") return inicial;
  if (carregado) return estado;
  try {
    const bruto = window.localStorage.getItem(KEY);
    if (bruto) {
      const salvo = JSON.parse(bruto) as Partial<Estado>;
      estado = {
        ...inicial,
        ...salvo,
        ajudantes: salvo.ajudantes ?? [],
        config: { ...inicial.config, ...(salvo.config ?? {}) },
      };
    }
  } catch {
    estado = inicial;
  }
  carregado = true;
  return estado;
}

function persistir() {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(estado));
  }
  ouvintes.forEach((l) => l());
}

export function setEstado(atualizar: (e: Estado) => Estado) {
  estado = atualizar(carregar());
  persistir();
}

export function useEstado(): Estado {
  return useSyncExternalStore(
    (l) => {
      ouvintes.add(l);
      return () => ouvintes.delete(l);
    },
    () => carregar(),
    () => inicial,
  );
}

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

/** Hash simples (SHA-256) para a senha guardada localmente. */
export async function hash(texto: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------- Clientes ----------
export function salvarCliente(c: Omit<Cliente, "id" | "criadoEm"> & { id?: string }) {
  setEstado((e) => {
    if (c.id) {
      return {
        ...e,
        clientes: e.clientes.map((x) => (x.id === c.id ? { ...x, ...c, id: c.id } : x)),
      };
    }
    const novo: Cliente = { ...c, id: uid(), criadoEm: new Date().toISOString() } as Cliente;
    return { ...e, clientes: [...e.clientes, novo] };
  });
}

export function excluirCliente(id: string) {
  setEstado((e) => ({
    ...e,
    clientes: e.clientes.filter((c) => c.id !== id),
    servicos: e.servicos.filter((s) => s.clienteId !== id),
  }));
}

// ---------- Serviços ----------
export function salvarServico(s: Partial<Servico> & { id?: string }) {
  setEstado((e) => {
    if (s.id) {
      return { ...e, servicos: e.servicos.map((x) => (x.id === s.id ? { ...x, ...s } : x)) };
    }
    const novo: Servico = {
      id: uid(),
      clienteId: "",
      data: new Date().toISOString().slice(0, 10),
      hora: "08:00",
      tipo: "Roçada",
      tempoEstimado: 60,
      observacoes: "",
      prioridade: "media",
      endereco: "",
      status: "agendado",
      extras: [],
      materiais: [],
      ferramentas: [],
      fotosAntes: [],
      fotosDepois: [],
      criadoEm: new Date().toISOString(),
      ...s,
      valor: s.valor ?? 0,
      ajudantes: s.ajudantes ?? [],
    };
    return { ...e, servicos: [...e.servicos, novo] };
  });
}

export function excluirServico(id: string) {
  setEstado((e) => ({ ...e, servicos: e.servicos.filter((s) => s.id !== id) }));
}

// ---------- Ajudantes ----------
export function salvarAjudante(a: Omit<Ajudante, "id" | "criadoEm"> & { id?: string }) {
  setEstado((e) => {
    if (a.id) {
      return {
        ...e,
        ajudantes: e.ajudantes.map((x) => (x.id === a.id ? { ...x, ...a, id: a.id! } : x)),
      };
    }
    const novo: Ajudante = { ...a, id: uid(), criadoEm: new Date().toISOString() };
    return { ...e, ajudantes: [...e.ajudantes, novo] };
  });
}

export function excluirAjudante(id: string) {
  setEstado((e) => ({ ...e, ajudantes: e.ajudantes.filter((a) => a.id !== id) }));
}

export const moeda = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// ---------- Backup ----------
export function exportarDados() {
  return JSON.stringify(carregar(), null, 2);
}

export function importarDados(json: string) {
  const dados = JSON.parse(json) as Estado;
  setEstado(() => ({ ...inicial, ...dados }));
}

export const hoje = () => new Date().toISOString().slice(0, 10);

export function minutosParaTexto(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}h${m ? ` ${m}min` : ""}` : `${m}min`;
}
