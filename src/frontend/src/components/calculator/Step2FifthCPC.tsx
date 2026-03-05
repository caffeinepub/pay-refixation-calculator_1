import { formatINR } from "@/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIFTH_CPC_SCALES, type FifthCPCScale } from "@/data/payScales";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { useState } from "react";

interface Step2Props {
  selectedScaleId: string;
  onNext: (scaleId: string) => void;
  onBack: () => void;
}

function getProgressionPreview(
  scale: FifthCPCScale,
  startPay: number,
): number[] {
  const result: number[] = [startPay];
  let current = startPay;
  for (let i = 0; i < 4; i++) {
    if (scale.increment === 0) {
      result.push(current);
      continue;
    }
    let next = current;
    for (const stage of scale.stages) {
      if (current < stage.upTo) {
        next = Math.min(current + stage.increment, stage.upTo);
        break;
      }
    }
    current = next;
    result.push(current);
  }
  return result;
}

export function Step2FifthCPC({ selectedScaleId, onNext, onBack }: Step2Props) {
  const [scaleId, setScaleId] = useState(selectedScaleId || "");
  const [error, setError] = useState("");

  const selectedScale = FIFTH_CPC_SCALES.find((s) => s.id === scaleId);

  function handleNext() {
    if (!scaleId) {
      setError("Please select a pay scale.");
      return;
    }
    onNext(scaleId);
  }

  function handleSelect(val: string) {
    setScaleId(val);
    setError("");
  }

  const progression = selectedScale
    ? getProgressionPreview(selectedScale, selectedScale.min)
    : [];

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold text-foreground">
          5th CPC Pay Scale <span className="text-destructive">*</span>
        </Label>
        <Select value={scaleId} onValueChange={handleSelect}>
          <SelectTrigger
            className={`w-full font-mono text-sm ${error ? "border-destructive" : ""}`}
            data-ocid="step2.scale_select"
          >
            <SelectValue placeholder="Select pay scale (S-1 to S-34)" />
          </SelectTrigger>
          <SelectContent className="max-h-80 overflow-y-auto">
            {FIFTH_CPC_SCALES.map((scale) => (
              <SelectItem
                key={scale.id}
                value={scale.id}
                className="font-mono text-sm"
              >
                <span className="font-bold mr-2">{scale.id}</span>
                <span className="text-muted-foreground">
                  {scale.label.replace(`${scale.id}: `, "")}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {selectedScale && (
        <Card className="border-primary/20 bg-primary/3">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Info className="w-4 h-4" />
              Scale Details: {selectedScale.id}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Minimum Pay
                </p>
                <p className="font-mono font-bold text-base text-foreground">
                  ₹{formatINR(selectedScale.min)}
                </p>
              </div>

              <div className="bg-white rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Primary Increment
                </p>
                <p className="font-mono font-bold text-base text-foreground">
                  {selectedScale.increment === 0
                    ? "Fixed (No Increment)"
                    : `₹${formatINR(selectedScale.increment)}`}
                </p>
              </div>

              <div className="bg-white rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Maximum Pay
                </p>
                <p className="font-mono font-bold text-base text-foreground">
                  ₹{formatINR(selectedScale.max)}
                </p>
              </div>

              <div className="bg-white rounded-md border border-border p-3">
                <p className="text-xs text-muted-foreground mb-1">Stages</p>
                <p className="font-mono font-bold text-base text-foreground">
                  {selectedScale.stages.length}
                </p>
              </div>
            </div>

            {selectedScale.description && (
              <p className="text-sm text-muted-foreground italic">
                {selectedScale.description}
              </p>
            )}

            {/* Sample progression */}
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                Sample Pay Progression (from minimum)
              </p>
              <div className="flex flex-wrap gap-2">
                {progression.map((pay, yearIdx) => {
                  const label = yearIdx === 0 ? "Min" : `Year ${yearIdx}`;
                  return (
                    <div key={label} className="flex flex-col items-center">
                      <div className="bg-primary/10 border border-primary/25 rounded px-3 py-1.5 font-mono text-sm font-semibold text-primary">
                        ₹{formatINR(pay)}
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Multi-stage info */}
            {selectedScale.stages.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                  Stage Increments
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedScale.stages.map((stage) => (
                    <div
                      key={`stage-${stage.upTo}`}
                      className="text-xs bg-muted rounded px-2 py-1 font-mono"
                    >
                      Up to ₹{formatINR(stage.upTo)}: +₹
                      {formatINR(stage.increment)}/yr
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
          data-ocid="step2.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 gap-2"
          data-ocid="step2.next_button"
        >
          Next: 6th & 7th CPC
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
