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

export type Despesa = { descricao: string; valor: number };

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
  despesas: Despesa[];
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

export type PixTipo = "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "ALEATORIA";

export const PIX_TIPOS: PixTipo[] = ["CPF", "CNPJ", "EMAIL", "TELEFONE", "ALEATORIA"];

export type Config = {
  horaNotificacao: string;
  notificacoesAtivas: boolean;
  /** Dados do recibo / cobrança (PIX) */
  profissionalNome: string;
  profissionalCpf: string;
  pixNome: string;
  pixTipo: PixTipo;
  pixChave: string;
  pixCpf: string;
  contato: string;
  cookiesAceitos: boolean;
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

/** Chave antiga (dados em texto puro) — migrada e apagada no primeiro login. */
const KEY_LEGADO = "the-garden:v1";
/** Conta (nome, e-mail, hash da senha, salt). Não contém dados de clientes. */
const KEY_CONTA = "the-garden:conta";
/** Dados criptografados com AES-GCM 256 (chave derivada da senha via PBKDF2). */
const KEY_DADOS = "the-garden:dados";
/** Chave da sessão atual — só dura enquanto a aba/app estiver aberta. */
const KEY_SESSAO = "the-garden:sessao";

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
    pixTipo: "CPF",
    pixChave: "",
    pixCpf: "",
    contato: "",
    cookiesAceitos: false,
  },
};

type Conta = { usuario: Usuario; salt: string };

let estado: Estado = inicial;
let carregado = false;
let chave: CryptoKey | null = null;
let fila: Promise<void> = Promise.resolve();
const ouvintes = new Set<() => void>();

// ---------- Criptografia ----------
const b64 = (b: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(b instanceof Uint8Array ? b : new Uint8Array(b))));
const deB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function derivarChave(senha: string, salt: string) {
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(senha),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: deB64(salt), iterations: 250_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

async function cifrar(k: CryptoKey, texto: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(texto));
  return JSON.stringify({ iv: b64(iv), ct: b64(ct) });
}

async function decifrar(k: CryptoKey, bruto: string) {
  const { iv, ct } = JSON.parse(bruto) as { iv: string; ct: string };
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: deB64(iv) }, k, deB64(ct));
  return new TextDecoder().decode(pt);
}

function lerConta(): Conta | null {
  try {
    const c = window.localStorage.getItem(KEY_CONTA);
    if (c) return JSON.parse(c) as Conta;
    const legado = window.localStorage.getItem(KEY_LEGADO);
    const u = legado ? (JSON.parse(legado) as Partial<Estado>).usuario : null;
    return u ? { usuario: u, salt: "" } : null;
  } catch {
    return null;
  }
}

function mesclar(salvo: Partial<Estado>): Estado {
  return {
    ...inicial,
    ...salvo,
    ajudantes: salvo.ajudantes ?? [],
    config: { ...inicial.config, ...(salvo.config ?? {}) },
  };
}

function carregar(): Estado {
  if (typeof window === "undefined") return inicial;
  if (carregado) return estado;
  estado = { ...inicial, usuario: lerConta()?.usuario ?? null };
  carregado = true;
  return estado;
}

function persistir() {
  ouvintes.forEach((l) => l());
  if (typeof window === "undefined" || !chave) return;
  const k = chave;
  const { usuario: _u, sessaoAtiva: _s, ...dados } = estado;
  fila = fila
    .then(async () => window.localStorage.setItem(KEY_DADOS, await cifrar(k, JSON.stringify(dados))))
    .catch(() => {});
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

// ---------- Sessão / desbloqueio ----------
async function abrir(k: CryptoKey, manter: boolean) {
  chave = k;
  const dadosCifrados = window.localStorage.getItem(KEY_DADOS);
  let dados: Partial<Estado> = {};
  if (dadosCifrados) {
    dados = JSON.parse(await decifrar(k, dadosCifrados)) as Partial<Estado>;
  } else {
    const legado = window.localStorage.getItem(KEY_LEGADO);
    if (legado) dados = JSON.parse(legado) as Partial<Estado>;
  }
  if (manter) {
    window.sessionStorage.setItem(KEY_SESSAO, b64(await crypto.subtle.exportKey("raw", k)));
  }
  estado = { ...mesclar(dados), usuario: lerConta()?.usuario ?? null, sessaoAtiva: true };
  carregado = true;
  persistir();
  await fila;
  window.localStorage.removeItem(KEY_LEGADO); // remove a cópia sem criptografia
}

let iniciando: Promise<void> | null = null;
/** Retoma a sessão da aba atual (se houver) sem pedir a senha de novo. */
export function iniciar() {
  if (typeof window === "undefined") return Promise.resolve();
  iniciando ??= (async () => {
    carregar();
    const s = window.sessionStorage.getItem(KEY_SESSAO);
    if (!s || chave) return;
    try {
      const k = await crypto.subtle.importKey("raw", deB64(s), "AES-GCM", true, ["encrypt", "decrypt"]);
      await abrir(k, true);
    } catch {
      window.sessionStorage.removeItem(KEY_SESSAO);
    }
  })();
  return iniciando;
}

export async function criarConta(nome: string, email: string, senha: string) {
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
  const usuario: Usuario = { nome, email, senhaHash: await hash(senha) };
  window.localStorage.setItem(KEY_CONTA, JSON.stringify({ usuario, salt } satisfies Conta));
  await abrir(await derivarChave(senha, salt), true);
}

export async function entrar(email: string, senha: string, manter: boolean) {
  const conta = lerConta();
  if (!conta || conta.usuario.email !== email || conta.usuario.senhaHash !== (await hash(senha))) {
    return false;
  }
  if (!conta.salt) {
    // Conta antiga, ainda sem criptografia: gera o salt agora.
    conta.salt = b64(crypto.getRandomValues(new Uint8Array(16)));
    window.localStorage.setItem(KEY_CONTA, JSON.stringify(conta));
  }
  await abrir(await derivarChave(senha, conta.salt), manter);
  return true;
}

/** Sem a senha antiga não é possível decifrar: os dados deste aparelho são apagados. */
export async function redefinirSenha(email: string, novaSenha: string) {
  const conta = lerConta();
  if (!conta || conta.usuario.email !== email) return false;
  window.localStorage.removeItem(KEY_DADOS);
  window.localStorage.removeItem(KEY_LEGADO);
  window.localStorage.removeItem(KEY_CONTA);
  sair();
  await criarConta(conta.usuario.nome, email, novaSenha);
  sair();
  return true;
}

export function sair() {
  chave = null;
  if (typeof window !== "undefined") window.sessionStorage.removeItem(KEY_SESSAO);
  estado = { ...inicial, usuario: lerConta()?.usuario ?? null };
  carregado = true;
  ouvintes.forEach((l) => l());
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
      despesas: s.despesas ?? [],
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
