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
import { SEVENTH_CPC_LEVELS, SIXTH_CPC_PAY_BANDS } from "@/data/payScales";
import { ArrowLeft, Calculator, Info } from "lucide-react";
import { useState } from "react";

export interface SixthSeventhCPCSelection {
  payBandId: string;
  gradePay: number;
  levelId: string;
}

interface Step3Props {
  data: SixthSeventhCPCSelection;
  onCalculate: (data: SixthSeventhCPCSelection) => void;
  onBack: () => void;
}

export function Step3SixthSeventhCPC({
  data,
  onCalculate,
  onBack,
}: Step3Props) {
  const [payBandId, setPayBandId] = useState(data.payBandId || "");
  const [gradePay, setGradePay] = useState(data.gradePay || 0);
  const [levelId, setLevelId] = useState(data.levelId || "");
  const [errors, setErrors] = useState<{
    payBand?: string;
    gradePay?: string;
    level?: string;
  }>({});

  const selectedBand = SIXTH_CPC_PAY_BANDS.find((b) => b.id === payBandId);
  const selectedLevel = SEVENTH_CPC_LEVELS.find((l) => l.id === levelId);

  function handlePayBandChange(val: string) {
    setPayBandId(val);
    const band = SIXTH_CPC_PAY_BANDS.find((b) => b.id === val);
    if (band && band.gradePays.length === 1) {
      setGradePay(band.gradePays[0]);
    } else {
      setGradePay(0);
    }
    setErrors((prev) => ({ ...prev, payBand: undefined, gradePay: undefined }));
  }

  function validate(): boolean {
    const newErrors: { payBand?: string; gradePay?: string; level?: string } =
      {};
    if (!payBandId) newErrors.payBand = "Please select a pay band.";
    if (!levelId) newErrors.level = "Please select a pay matrix level.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    onCalculate({ payBandId, gradePay, levelId });
  }

  return (
    <div className="space-y-6">
      {/* 6th CPC Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 rounded-full bg-[oklch(0.68_0.15_80)]" />
          <h3 className="font-semibold text-base text-foreground">
            6th CPC — 2006 Pay Revision
          </h3>
          <span className="badge-6th ml-1">6th CPC</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pay Band */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground">
              Pay Band <span className="text-destructive">*</span>
            </Label>
            <Select value={payBandId} onValueChange={handlePayBandChange}>
              <SelectTrigger
                className={`font-mono text-sm ${errors.payBand ? "border-destructive" : ""}`}
                data-ocid="step3.pay_band_select"
              >
                <SelectValue placeholder="Select pay band" />
              </SelectTrigger>
              <SelectContent>
                {SIXTH_CPC_PAY_BANDS.map((band) => (
                  <SelectItem
                    key={band.id}
                    value={band.id}
                    className="font-mono text-sm"
                  >
                    <span className="font-bold mr-2">{band.id}</span>
                    <span className="text-muted-foreground">
                      {band.label.replace(`${band.id} `, "")}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.payBand && (
              <p className="text-xs text-destructive">{errors.payBand}</p>
            )}
          </div>

          {/* Grade Pay */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground">
              Grade Pay <span className="text-destructive">*</span>
            </Label>
            <Select
              value={gradePay > 0 ? String(gradePay) : ""}
              onValueChange={(val) => setGradePay(Number.parseInt(val))}
              disabled={!selectedBand}
            >
              <SelectTrigger
                className={`font-mono text-sm ${errors.gradePay ? "border-destructive" : ""}`}
                data-ocid="step3.grade_pay_select"
              >
                <SelectValue
                  placeholder={
                    selectedBand ? "Select grade pay" : "Select pay band first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {selectedBand?.gradePays.map((gp) => (
                  <SelectItem
                    key={gp}
                    value={String(gp)}
                    className="font-mono text-sm"
                  >
                    {gp === 0 ? "Nil (HAG/APEX)" : `₹${formatINR(gp)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gradePay && (
              <p className="text-xs text-destructive">{errors.gradePay}</p>
            )}
          </div>
        </div>

        {/* 6th CPC Info Card */}
        {selectedBand && (
          <Card className="border-[oklch(0.68_0.15_80/0.25)] bg-[oklch(0.68_0.15_80/0.05)]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2 text-[oklch(0.45_0.14_75)] font-semibold text-sm">
                <Info className="w-3.5 h-3.5" />
                Pay Band: {selectedBand.id}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Band Range</p>
                  <p className="font-mono text-sm font-semibold">
                    ₹{formatINR(selectedBand.min)} – ₹
                    {formatINR(selectedBand.max)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Selected Grade Pay
                  </p>
                  <p className="font-mono text-sm font-semibold">
                    {gradePay === 0 ? "Nil" : `₹${formatINR(gradePay)}`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Annual Increment
                  </p>
                  <p className="font-mono text-sm font-semibold text-[oklch(0.45_0.14_75)]">
                    3% of (Basic + GP)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-border" />

      {/* 7th CPC Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-5 rounded-full bg-[oklch(0.48_0.15_145)]" />
          <h3 className="font-semibold text-base text-foreground">
            7th CPC — 2016 Pay Revision
          </h3>
          <span className="badge-7th ml-1">7th CPC</span>
        </div>

        {/* Level Select */}
        <div className="space-y-1.5">
          <Label className="text-sm font-semibold text-foreground">
            Pay Matrix Level <span className="text-destructive">*</span>
          </Label>
          <Select
            value={levelId}
            onValueChange={(val) => {
              setLevelId(val);
              setErrors((prev) => ({ ...prev, level: undefined }));
            }}
          >
            <SelectTrigger
              className={`font-mono text-sm ${errors.level ? "border-destructive" : ""}`}
              data-ocid="step3.level_select"
            >
              <SelectValue placeholder="Select pay matrix level (1–18)" />
            </SelectTrigger>
            <SelectContent className="max-h-72 overflow-y-auto">
              {SEVENTH_CPC_LEVELS.map((level) => (
                <SelectItem
                  key={level.id}
                  value={level.id}
                  className="font-mono text-sm"
                >
                  <span className="font-bold mr-2">{level.label}</span>
                  <span className="text-muted-foreground">
                    (Min: ₹{formatINR(level.minPay)})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-xs text-destructive">{errors.level}</p>
          )}
        </div>

        {/* 7th CPC Info Card */}
        {selectedLevel && (
          <Card className="border-[oklch(0.48_0.15_145/0.25)] bg-[oklch(0.48_0.15_145/0.05)]">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2 text-[oklch(0.35_0.15_145)] font-semibold text-sm">
                <Info className="w-3.5 h-3.5" />
                Pay Matrix: {selectedLevel.label}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Minimum Pay</p>
                  <p className="font-mono text-sm font-semibold">
                    ₹{formatINR(selectedLevel.minPay)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Level Number</p>
                  <p className="font-mono text-sm font-semibold">
                    {selectedLevel.level}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Annual Increment
                  </p>
                  <p className="font-mono text-sm font-semibold text-[oklch(0.35_0.15_145)]">
                    3% of Basic (↑100)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="gap-2"
          data-ocid="step3.back_button"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleCalculate}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 gap-2"
          data-ocid="step3.calculate_button"
        >
          <Calculator className="w-4 h-4" />
          Calculate Pay Progression
        </Button>
      </div>
    </div>
  );
}
