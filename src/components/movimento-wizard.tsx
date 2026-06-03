import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Colaborador, Equipamento } from "@/lib/db";

type FormState = { colaborador_id: string; equipamento_id: string; data: string };

interface Props {
  colaboradores: Colaborador[];
  equipamentos: Equipamento[];
  value: FormState;
  onChange: (v: FormState) => void;
  onSubmit: () => any;
  submitLabel: string;
  dateLabel: string;
}

const STEPS = ["Colaborador", "Equipamento", "Data"];

export function MovimentoWizard({ colaboradores, equipamentos, value, onChange, onSubmit, submitLabel, dateLabel }: Props) {
  const [step, setStep] = useState(0);

  const colab = colaboradores.find((c) => c.id === value.colaborador_id);
  const equip = equipamentos.find((e) => e.id === value.equipamento_id);

  const canNext =
    (step === 0 && !!value.colaborador_id) ||
    (step === 1 && !!value.equipamento_id) ||
    (step === 2 && !!value.data);

  async function handleSubmit() {
    await onSubmit();
    setStep(0);
  }

  return (
    <Card className="p-4 space-y-4">
      {/* Stepper */}
      <div className="flex items-center justify-between gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-[10px] ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>{label}</span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="space-y-2">
          <Label>Selecionar colaborador</Label>
          <Select value={value.colaborador_id} onValueChange={(v) => onChange({ ...value, colaborador_id: v })}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Toque para selecionar" /></SelectTrigger>
            <SelectContent>
              {colaboradores.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome} ({c.matricula})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <Label>Selecionar equipamento</Label>
          <Select value={value.equipamento_id} onValueChange={(v) => onChange({ ...value, equipamento_id: v })}>
            <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Toque para selecionar" /></SelectTrigger>
            <SelectContent>
              {equipamentos.map((e) => <SelectItem key={e.id} value={e.id}>{e.patrimonio} - {e.modelo}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>{dateLabel}</Label>
            <Input type="date" className="h-12 text-base" value={value.data} onChange={(e) => onChange({ ...value, data: e.target.value })} />
          </div>
          <div className="rounded-md border p-3 text-sm space-y-1 bg-muted/30">
            <div><span className="text-muted-foreground">Colaborador:</span> {colab?.nome ?? "-"}</div>
            <div><span className="text-muted-foreground">Equipamento:</span> {equip ? `${equip.patrimonio} - ${equip.modelo}` : "-"}</div>
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        {step > 0 && (
          <Button type="button" variant="outline" className="flex-1 h-12 text-base" onClick={() => setStep(step - 1)}>
            Voltar
          </Button>
        )}
        {step < 2 && (
          <Button type="button" className="flex-1 h-12 text-base" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Avançar
          </Button>
        )}
        {step === 2 && (
          <Button type="button" className="flex-1 h-12 text-base" disabled={!canNext} onClick={handleSubmit}>
            {submitLabel}
          </Button>
        )}
      </div>
    </Card>
  );
}
