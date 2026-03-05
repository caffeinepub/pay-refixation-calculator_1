import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Calculator, FileText, Scale, Shield } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { RecordsTab } from "@/components/calculator/RecordsTab";
import { ResultsStep } from "@/components/calculator/ResultsStep";
import {
  type EmployeeDetails,
  Step1EmployeeDetails,
} from "@/components/calculator/Step1EmployeeDetails";
import { Step2FifthCPC } from "@/components/calculator/Step2FifthCPC";
import {
  type SixthSeventhCPCSelection,
  Step3SixthSeventhCPC,
} from "@/components/calculator/Step3SixthSeventhCPC";
import { StepIndicator } from "@/components/calculator/StepIndicator";

import {
  type CalculationResult,
  type PayRow,
  calculatePayProgression,
} from "@/calculations";
import {
  FIFTH_CPC_SCALES,
  SEVENTH_CPC_LEVELS,
  SIXTH_CPC_PAY_BANDS,
} from "@/data/payScales";
import {
  useDeleteRecord,
  useListRecords,
  useSaveRecord,
} from "@/hooks/useQueries";

// -------------------------------------------------------
// Query Client
// -------------------------------------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});

// -------------------------------------------------------
// Wizard State
// -------------------------------------------------------
const WIZARD_STEPS = [
  { label: "Employee Details", sublabel: "Personal info" },
  { label: "5th CPC Scale", sublabel: "1998 pay scale" },
  { label: "6th & 7th CPC", sublabel: "2006 & 2016" },
  { label: "Results", sublabel: "Pay progression" },
];

const EMPTY_EMPLOYEE: EmployeeDetails = {
  name: "",
  employeeId: "",
  designation: "",
  department: "",
  dateOfAppointment: "",
  basicPayAtAppointment: 0,
};

const EMPTY_6TH7TH: SixthSeventhCPCSelection = {
  payBandId: "",
  gradePay: 0,
  levelId: "",
};

// -------------------------------------------------------
// Main App (Inner — needs QueryClient context)
// -------------------------------------------------------
function AppInner() {
  const [activeTab, setActiveTab] = useState<"calculator" | "records">(
    "calculator",
  );
  const [wizardStep, setWizardStep] = useState(1);

  // Form state
  const [employee, setEmployee] = useState<EmployeeDetails>(EMPTY_EMPLOYEE);
  const [fifthCpcScaleId, setFifthCpcScaleId] = useState("");
  const [cpc6and7, setCpc6and7] =
    useState<SixthSeventhCPCSelection>(EMPTY_6TH7TH);
  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);

  // Backend hooks
  const {
    data: records,
    isLoading: recordsLoading,
    isError: recordsError,
  } = useListRecords();
  const saveRecord = useSaveRecord();
  const deleteRecord = useDeleteRecord();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  // -------------------------------------------------------
  // Wizard navigation
  // -------------------------------------------------------
  function handleStep1Next(data: EmployeeDetails) {
    setEmployee(data);
    setWizardStep(2);
  }

  function handleStep2Next(scaleId: string) {
    setFifthCpcScaleId(scaleId);
    setWizardStep(3);
  }

  function handleStep3Calculate(data: SixthSeventhCPCSelection) {
    setCpc6and7(data);

    const scale = FIFTH_CPC_SCALES.find((s) => s.id === fifthCpcScaleId);
    const band = SIXTH_CPC_PAY_BANDS.find((b) => b.id === data.payBandId);
    const level = SEVENTH_CPC_LEVELS.find((l) => l.id === data.levelId);

    if (!scale || !band || !level) {
      toast.error("Invalid selection. Please go back and re-select.");
      return;
    }

    try {
      const result = calculatePayProgression(
        employee.basicPayAtAppointment,
        scale,
        band,
        data.gradePay,
        level,
      );
      setCalcResult(result);
      setWizardStep(4);
    } catch (err) {
      toast.error("Calculation failed. Please check your inputs.");
      console.error(err);
    }
  }

  function handleNewCalculation() {
    setEmployee(EMPTY_EMPLOYEE);
    setFifthCpcScaleId("");
    setCpc6and7(EMPTY_6TH7TH);
    setCalcResult(null);
    setWizardStep(1);
  }

  // -------------------------------------------------------
  // Save record
  // -------------------------------------------------------
  const handleSave = useCallback(
    async (result: CalculationResult, _rows: PayRow[]) => {
      const level = SEVENTH_CPC_LEVELS.find((l) => l.id === cpc6and7.levelId);
      try {
        const recordJson = JSON.stringify({
          fifthCPCPayAt2005: result.fifthCPCPayAt2005,
          sixthCPCRefixedAt2006: result.sixthCPCRefixedAt2006,
          seventhCPCRefixedAt2016: result.seventhCPCRefixedAt2016,
          totalArrears: result.totalArrears,
          basicArrears: result.basicArrears,
          daArrears: result.daArrears,
          taArrears: result.taArrears,
          fifthCPCPeriodArrears: result.fifthCPCPeriodArrears,
          sixthCPCPeriodArrears: result.sixthCPCPeriodArrears,
          seventhCPCPeriodArrears: result.seventhCPCPeriodArrears,
        });

        await saveRecord.mutateAsync({
          employeeId: employee.employeeId,
          employeeName: employee.name,
          designation: employee.designation,
          department: employee.department,
          dateOfAppointment: employee.dateOfAppointment,
          basicPayAtAppointment: BigInt(employee.basicPayAtAppointment),
          fifthCpcScale: fifthCpcScaleId,
          sixthCpcPayBand: `${cpc6and7.payBandId}-GP${cpc6and7.gradePay}`,
          seventhCpcLevel: BigInt(Math.round(level?.level ?? 1)),
          calculatedAt: BigInt(Date.now()),
          totalArrears: BigInt(Math.round(result.totalArrears)),
          recordJson,
        });

        // Also save to localStorage as cache
        const lsKey = "payRefixRecords";
        const existing = JSON.parse(localStorage.getItem(lsKey) || "[]");
        const newRecord = {
          id: Date.now(),
          employeeName: employee.name,
          employeeId: employee.employeeId,
          designation: employee.designation,
          department: employee.department,
          dateOfAppointment: employee.dateOfAppointment,
          basicPayAtAppointment: employee.basicPayAtAppointment,
          fifthCpcScale: fifthCpcScaleId,
          sixthCpcPayBand: `${cpc6and7.payBandId}-GP${cpc6and7.gradePay}`,
          seventhCpcLevel: level?.level ?? 1,
          calculatedAt: Date.now(),
          totalArrears: result.totalArrears,
          recordJson,
        };
        localStorage.setItem(lsKey, JSON.stringify([...existing, newRecord]));

        toast.success("Record saved successfully!");
      } catch (err) {
        toast.error("Failed to save record. Please try again.");
        console.error(err);
      }
    },
    [employee, fifthCpcScaleId, cpc6and7, saveRecord],
  );

  // -------------------------------------------------------
  // Delete record
  // -------------------------------------------------------
  const handleDelete = useCallback(
    async (id: bigint) => {
      setDeletingId(id);
      try {
        await deleteRecord.mutateAsync(id);
        toast.success("Record deleted.");
      } catch {
        toast.error("Failed to delete record.");
      } finally {
        setDeletingId(null);
      }
    },
    [deleteRecord],
  );

  const handleClearAll = useCallback(async () => {
    if (!records) return;
    await Promise.all(records.map((r) => deleteRecord.mutateAsync(r.id)));
    localStorage.removeItem("payRefixRecords");
    toast.success("All records cleared.");
  }, [records, deleteRecord]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Government Header */}
      <header className="govt-header text-primary-foreground no-print">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/10 rounded-full border border-white/25 flex items-center justify-center">
                <Scale className="w-6 h-6 text-white/90" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Shield className="w-3.5 h-3.5 text-white/70" />
                <span className="text-xs font-semibold tracking-[0.15em] text-white/70 uppercase">
                  Government of India
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-white leading-tight tracking-tight">
                Pay Refixation Calculator
              </h1>
              <p className="text-xs text-white/60 mt-0.5 hidden sm:block">
                5th · 6th · 7th Central Pay Commission &nbsp;|&nbsp; As per
                Supreme Court Judgment
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "calculator" | "records")}
        >
          <TabsList className="mb-6 bg-muted/60 w-full sm:w-auto">
            <TabsTrigger
              value="calculator"
              className="gap-2 flex-1 sm:flex-none"
              data-ocid="records.calculator_tab"
            >
              <Calculator className="w-4 h-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="gap-2 flex-1 sm:flex-none"
              data-ocid="records.tab"
            >
              <FileText className="w-4 h-4" />
              Records
              {records && records.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 font-mono leading-none">
                  {records.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator">
            <Card className="border-border shadow-sm">
              <CardContent className="p-0">
                {/* Step Indicator */}
                <div className="border-b border-border px-6 bg-muted/30">
                  <StepIndicator
                    steps={WIZARD_STEPS}
                    currentStep={wizardStep}
                  />
                </div>

                {/* Step Content */}
                <div className="p-6">
                  {/* Step header */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      {WIZARD_STEPS[wizardStep - 1]?.label}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {wizardStep === 1 &&
                        "Enter employee information as per service records."}
                      {wizardStep === 2 &&
                        "Select the 5th CPC pay scale applicable at the time of appointment in 1998."}
                      {wizardStep === 3 &&
                        "Select the 6th CPC pay band/grade pay and 7th CPC pay matrix level."}
                      {wizardStep === 4 &&
                        "Review the calculated pay progression and arrears. Drawn values are editable."}
                    </p>
                  </div>

                  {wizardStep === 1 && (
                    <Step1EmployeeDetails
                      data={employee}
                      onNext={handleStep1Next}
                    />
                  )}
                  {wizardStep === 2 && (
                    <Step2FifthCPC
                      selectedScaleId={fifthCpcScaleId}
                      onNext={handleStep2Next}
                      onBack={() => setWizardStep(1)}
                    />
                  )}
                  {wizardStep === 3 && (
                    <Step3SixthSeventhCPC
                      data={cpc6and7}
                      onCalculate={handleStep3Calculate}
                      onBack={() => setWizardStep(2)}
                    />
                  )}
                  {wizardStep === 4 && calcResult && (
                    <ResultsStep
                      result={calcResult}
                      employee={employee}
                      fifthCpcScaleId={fifthCpcScaleId}
                      sixthCpcPayBandId={cpc6and7.payBandId}
                      sixthCpcGradePay={cpc6and7.gradePay}
                      seventhCpcLevelId={cpc6and7.levelId}
                      onSave={handleSave}
                      onNewCalculation={handleNewCalculation}
                      isSaving={saveRecord.isPending}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records">
            <Card className="border-border shadow-sm">
              <CardContent className="p-6">
                <RecordsTab
                  records={records}
                  isLoading={recordsLoading}
                  isError={recordsError}
                  onDelete={handleDelete}
                  onClearAll={handleClearAll}
                  isDeletingId={deletingId}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 no-print">
        <div className="container max-w-5xl mx-auto px-4">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()}. Built with{" "}
            <span className="text-[oklch(0.52_0.22_27)]">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              caffeine.ai
            </a>
            &nbsp;|&nbsp;For official use as per Supreme Court Judgment on Pay
            Refixation
          </p>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}

// -------------------------------------------------------
// App with providers
// -------------------------------------------------------
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
