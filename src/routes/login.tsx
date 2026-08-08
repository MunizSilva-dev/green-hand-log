import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Rodape } from "@/components/AppShell";
import { hash, setEstado, useEstado } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar | THE GARDEN" },
      { name: "description", content: "Acesse o THE GARDEN para gerenciar clientes, agenda e serviços de jardinagem e roçada." },
      { property: "og:title", content: "Entrar | THE GARDEN" },
      { property: "og:description", content: "Acesso ao sistema de gestão de jardinagem THE GARDEN." },
    ],
  }),
  component: Login,
});

type Modo = "login" | "cadastro" | "recuperar";

function Login() {
  const estado = useEstado();
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>(estado.usuario ? "login" : "cadastro");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState(estado.usuario?.email ?? "");
  const [senha, setSenha] = useState("");
  const [manter, setManter] = useState(true);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (modo === "recuperar") {
      if (!estado.usuario || estado.usuario.email !== email) {
        toast.error("E-mail não encontrado neste dispositivo");
        return;
      }
      if (senha.length < 6) {
        toast.error("A nova senha precisa de 6 caracteres");
        return;
      }
      const senhaHash = await hash(senha);
      setEstado((s) => ({ ...s, usuario: { ...s.usuario!, senhaHash } }));
      toast.success("Senha redefinida");
      setModo("login");
      return;
    }

    if (modo === "cadastro") {
      if (!nome.trim() || !email.trim() || senha.length < 6) {
        toast.error("Preencha nome, e-mail e senha (mín. 6 caracteres)");
        return;
      }
      const senhaHash = await hash(senha);
      setEstado((s) => ({ ...s, usuario: { nome, email, senhaHash }, sessaoAtiva: true }));
      toast.success(`Bem-vindo, ${nome}!`);
      navigate({ to: "/" });
      return;
    }

    const senhaHash = await hash(senha);
    if (!estado.usuario || estado.usuario.email !== email || estado.usuario.senhaHash !== senhaHash) {
      toast.error("E-mail ou senha incorretos");
      return;
    }
    setEstado((s) => ({ ...s, sessaoAtiva: manter }));
    if (!manter) setEstado((s) => ({ ...s, sessaoAtiva: true }));
    navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-garden px-5 py-10">
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="mb-8 text-center text-primary-foreground">
          <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-3xl bg-primary-foreground/15">
            <Leaf className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold tracking-[0.2em]">THE GARDEN</h1>
          <p className="mt-1 text-sm opacity-80">Jardinagem e roçada profissional</p>
        </div>

        <form onSubmit={enviar} className="space-y-4 rounded-3xl bg-card p-5 shadow-soft">
          {modo === "cadastro" && (
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="senha">{modo === "recuperar" ? "Nova senha" : "Senha"}</Label>
            <Input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          {modo === "login" && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <Checkbox checked={manter} onCheckedChange={(v) => setManter(!!v)} /> Manter conectado
            </label>
          )}
          <Button type="submit" size="lg" className="w-full rounded-full">
            {modo === "login" ? "Entrar" : modo === "cadastro" ? "Criar conta" : "Redefinir senha"}
          </Button>
          <div className="flex justify-between text-xs text-muted-foreground">
            <button type="button" onClick={() => setModo(modo === "login" ? "cadastro" : "login")}>
              {modo === "login" ? "Criar conta" : "Já tenho conta"}
            </button>
            <button type="button" onClick={() => setModo("recuperar")}>
              Esqueci a senha
            </button>
          </div>
        </form>
      </div>
      <div className="text-primary-foreground/80">
        <Rodape />
      </div>
    </div>
  );
}
