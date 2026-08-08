import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/** Compacta a imagem para caber confortavelmente no armazenamento local. */
function comprimir(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function GaleriaFotos({
  fotos,
  onChange,
  label = "Fotos",
}: {
  fotos: string[];
  onChange?: (fotos: string[]) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [aberta, setAberta] = useState<string | null>(null);

  async function adicionar(files: FileList | null) {
    if (!files || !onChange) return;
    const novas = await Promise.all(Array.from(files).map(comprimir));
    onChange([...fotos, ...novas]);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {onChange && (
          <Button type="button" size="sm" variant="secondary" onClick={() => inputRef.current?.click()}>
            <Camera className="mr-1 size-4" /> Adicionar
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        hidden
        onChange={(e) => void adicionar(e.target.files)}
      />
      {fotos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Nenhuma foto ainda
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((f, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl">
              <img
                src={f}
                alt={`${label} ${i + 1}`}
                loading="lazy"
                className="aspect-square w-full cursor-zoom-in object-cover"
                onClick={() => setAberta(f)}
              />
              {onChange && (
                <button
                  type="button"
                  aria-label="Remover foto"
                  onClick={() => onChange(fotos.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 rounded-full bg-background/85 p-1 text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!aberta} onOpenChange={() => setAberta(null)}>
        <DialogContent className="max-w-lg p-2">
          <DialogTitle className="sr-only">Foto em tela cheia</DialogTitle>
          <DialogDescription className="sr-only">Visualização ampliada</DialogDescription>
          {aberta && <img src={aberta} alt="Foto ampliada" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
