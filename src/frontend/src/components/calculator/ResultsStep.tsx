import type { CalculationResult, PayRow } from "@/calculations";
import { formatINR, recomputeArrears } from "@/calculations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronUp,
  IndianRupee,
  Loader2,
  Printer,
  RotateCcw,
  Save,
  TrendingDown,
} from "lucide-react";
import { useCallback, useState } from "react";
import type { EmployeeDetails } from "./Step1EmployeeDetails";

interface ResultsStepProps {
  result: CalculationResult;
  employee: EmployeeDetails;
  fifthCpcScaleId: string;
  sixthCpcPayBandId: string;
  sixthCpcGradePay: number;
  seventhCpcLevelId: string;
  onSave: (result: CalculationResult, rows: PayRow[]) => Promise<void>;
  onNewCalculation: () => void;
  isSaving: boolean;
}

type EditField = "basic" | "da" | "ta";

export function ResultsStep({
  result,
  employee,
  fifthCpcScaleId,
  sixthCpcPayBandId,
  sixthCpcGradePay,
  seventhCpcLevelId,
  onSave,
  onNewCalculation,
  isSaving,
}: ResultsStepProps) {
  const [rows, setRows] = useState<PayRow[]>(result.rows);
  const [editingCell, setEditingCell] = useState<{
    year: number;
    field: EditField;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showArrearsBreakdown, setShowArrearsBreakdown] = useState(true);

  const arrears = recomputeArrears(rows);

  function startEdit(year: number, field: EditField, currentValue: number) {
    setEditingCell({ year, field });
    setEditValue(String(currentValue));
  }

  function commitEdit() {
    if (!editingCell) return;
    const value = Number.parseInt(editValue) || 0;
    setRows((prev) =>
      prev.map((row) => {
        if (row.year !== editingCell.year) return row;
        let updated = { ...row };
        if (editingCell.field === "basic") updated.drawnBasic = value;
        if (editingCell.field === "da") updated.drawnDA = value;
        if (editingCell.field === "ta") updated.drawnTA = value;
        updated.drawnTotal =
          updated.drawnBasic + updated.drawnDA + updated.drawnTA;
        updated.difference = updated.dueTotal - updated.drawnTotal;
        return updated;
      }),
    );
    setEditingCell(null);
    setEditValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") setEditingCell(null);
  }

  function getEraBadge(era: PayRow["era"]) {
    if (era === "5th") return <span className="badge-5th">5th CPC</span>;
    if (era === "6th") return <span className="badge-6th">6th CPC</span>;
    return <span className="badge-7th">7th CPC</span>;
  }

  const handleSave = useCallback(async () => {
    await onSave(
      {
        ...result,
        ...arrears,
      },
      rows,
    );
  }, [onSave, result, arrears, rows]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const refixed6thRow = rows.find((r) => r.era === "6th" && r.isRefixedYear);
  const refixed7thRow = rows.find((r) => r.era === "7th" && r.isRefixedYear);

  return (
    <div className="space-y-6" data-ocid="results.section">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="summary-card-5th">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              5th CPC Pay (2005)
            </p>
            <p className="font-mono text-xl font-bold text-foreground">
              ₹{formatINR(result.fifthCPCPayAt2005)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Final 5th CPC basic
            </p>
          </CardContent>
        </Card>

        <Card className="summary-card-6th">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              6th CPC Refixed (2006)
            </p>
            <p className="font-mono text-xl font-bold text-foreground">
              ₹
              {formatINR(
                refixed6thRow?.dueBasic ?? result.sixthCPCRefixedAt2006,
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              × 1.86 of ₹{formatINR(result.fifthCPCPayAt2005)}
            </p>
          </CardContent>
        </Card>

        <Card className="summary-card-7th">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              7th CPC Refixed (2016)
            </p>
            <p className="font-mono text-xl font-bold text-foreground">
              ₹
              {formatINR(
                refixed7thRow?.dueBasic ?? result.seventhCPCRefixedAt2016,
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              × 2.57 of 6th basic
            </p>
          </CardContent>
        </Card>

        <Card className="summary-card-arrears">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              Total Arrears
            </p>
            <p
              className={`font-mono text-xl font-bold ${
                arrears.totalArrears > 0
                  ? "text-[oklch(0.52_0.22_27)]"
                  : "text-[oklch(0.45_0.15_145)]"
              }`}
            >
              ₹{formatINR(arrears.totalArrears)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {arrears.totalArrears > 0 ? "Due to employee" : "No arrears"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pay Progression Table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-base text-foreground">
            Pay Progression Table
          </h3>
          <p className="text-xs text-muted-foreground">
            Click any Drawn cell to edit
          </p>
        </div>
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table
              className="pay-table w-full text-sm"
              data-ocid="results.table"
            >
              <thead>
                <tr>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold min-w-[60px]">
                    Year
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold min-w-[80px]">
                    Era
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-xs font-semibold"
                    colSpan={4}
                  >
                    Due (As Per Judgment)
                  </th>
                  <th
                    className="px-3 py-2.5 text-center text-xs font-semibold"
                    colSpan={4}
                  >
                    Drawn (Actually Paid)
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold min-w-[90px]">
                    Difference
                  </th>
                </tr>
                <tr className="sub-header">
                  <th className="px-3 py-1.5 text-xs text-white/70 text-left" />
                  <th className="px-3 py-1.5 text-xs text-white/70" />
                  {/* Due columns */}
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[80px]">
                    Basic
                  </th>
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[70px]">
                    DA
                  </th>
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[60px]">
                    TA
                  </th>
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[90px]">
                    Total
                  </th>
                  {/* Drawn columns */}
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[80px]">
                    Basic ✎
                  </th>
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[70px]">
                    DA ✎
                  </th>
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[60px]">
                    TA ✎
                  </th>
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right min-w-[90px]">
                    Total
                  </th>
                  {/* Difference */}
                  <th className="px-3 py-1.5 text-xs text-white/90 text-right" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isEditing = (field: EditField) =>
                    editingCell?.year === row.year &&
                    editingCell?.field === field;

                  const rowClass = row.isRefixedYear
                    ? "row-refixed"
                    : idx % 2 === 0
                      ? "bg-white"
                      : "bg-muted/30";

                  return (
                    <tr
                      key={row.year}
                      className={`${rowClass} border-b border-border/50 hover:bg-primary/5 transition-colors`}
                    >
                      <td className="px-3 py-2 font-mono font-semibold text-sm">
                        {row.year}
                        {row.isRefixedYear && (
                          <span className="ml-1 text-[10px] text-[oklch(0.45_0.14_75)] font-bold uppercase">
                            Refixed
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {getEraBadge(row.era)}
                      </td>

                      {/* Due cells */}
                      <td className="px-3 py-2 text-right font-mono text-sm">
                        {formatINR(row.dueBasic)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm text-muted-foreground">
                        {formatINR(row.dueDA)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm text-muted-foreground">
                        {formatINR(row.dueTA)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-semibold">
                        {formatINR(row.dueTotal)}
                      </td>

                      {/* Drawn cells (editable) */}
                      {(["basic", "da", "ta"] as EditField[]).map((field) => {
                        const value =
                          field === "basic"
                            ? row.drawnBasic
                            : field === "da"
                              ? row.drawnDA
                              : row.drawnTA;
                        return (
                          <td key={field} className="px-3 py-2 text-right">
                            {isEditing(field) ? (
                              <Input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={commitEdit}
                                onKeyDown={handleKeyDown}
                                className="w-20 h-7 text-right text-xs font-mono p-1 border-primary"
                                autoFocus
                              />
                            ) : (
                              <button
                                type="button"
                                className="editable-cell font-mono text-sm cursor-pointer hover:text-primary bg-transparent border-none p-0"
                                onClick={() =>
                                  startEdit(row.year, field, value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ")
                                    startEdit(row.year, field, value);
                                }}
                                aria-label={`Edit ${field} for ${row.year}`}
                              >
                                {formatINR(value)}
                              </button>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right font-mono text-sm font-semibold">
                        {formatINR(row.drawnTotal)}
                      </td>

                      {/* Difference */}
                      <td className="px-3 py-2 text-right">
                        <span
                          className={
                            row.difference > 0
                              ? "arrears-positive"
                              : "arrears-zero"
                          }
                        >
                          {row.difference > 0 ? "+" : ""}
                          {formatINR(row.difference)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Arrears Breakdown Panel */}
      <div data-ocid="results.arrears_panel">
        <button
          type="button"
          className="flex items-center gap-2 font-semibold text-base text-foreground mb-3 hover:text-primary transition-colors"
          onClick={() => setShowArrearsBreakdown(!showArrearsBreakdown)}
        >
          <TrendingDown className="w-4 h-4" />
          Arrears Breakdown
          {showArrearsBreakdown ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </button>

        {showArrearsBreakdown && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Component-wise */}
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
                  Component-wise Arrears
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "Basic Pay Arrears",
                      value: arrears.basicArrears,
                      color: "text-primary",
                    },
                    {
                      label: "DA Arrears",
                      value: arrears.daArrears,
                      color: "text-[oklch(0.45_0.14_75)]",
                    },
                    {
                      label: "TA Arrears",
                      value: arrears.taArrears,
                      color: "text-[oklch(0.35_0.15_145)]",
                    },
                  ].map(({ label, value, color }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center py-1 border-b border-border/50"
                    >
                      <span className="text-sm text-muted-foreground">
                        {label}
                      </span>
                      <span
                        className={`font-mono font-semibold text-sm ${color}`}
                      >
                        ₹{formatINR(value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="font-mono font-bold text-base text-[oklch(0.52_0.22_27)]">
                      ₹{formatINR(arrears.totalArrears)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Era-wise */}
            <Card className="border-border">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-wide font-semibold text-muted-foreground mb-3">
                  Era-wise Arrears
                </p>
                <div className="space-y-2">
                  {[
                    {
                      label: "5th CPC Period (1998–2005)",
                      value: arrears.fifthCPCPeriodArrears,
                      badge: <span className="badge-5th">5th</span>,
                    },
                    {
                      label: "6th CPC Period (2006–2015)",
                      value: arrears.sixthCPCPeriodArrears,
                      badge: <span className="badge-6th">6th</span>,
                    },
                    {
                      label: "7th CPC Period (2016–Present)",
                      value: arrears.seventhCPCPeriodArrears,
                      badge: <span className="badge-7th">7th</span>,
                    },
                  ].map(({ label, value, badge }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center py-1 border-b border-border/50"
                    >
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        {badge}
                        <span className="hidden sm:inline">{label}</span>
                      </span>
                      <span className="font-mono font-semibold text-sm text-foreground">
                        ₹{formatINR(value)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="font-mono font-bold text-base text-[oklch(0.52_0.22_27)]">
                      ₹{formatINR(arrears.totalArrears)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          data-ocid="results.save_button"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Record"}
        </Button>

        <Button
          onClick={handlePrint}
          variant="outline"
          className="gap-2"
          data-ocid="results.print_button"
        >
          <Printer className="w-4 h-4" />
          Print Statement
        </Button>

        <Button
          onClick={onNewCalculation}
          variant="outline"
          className="gap-2 ml-auto"
          data-ocid="results.new_calc_button"
        >
          <RotateCcw className="w-4 h-4" />
          New Calculation
        </Button>
      </div>

      {/* Print Statement (hidden on screen, visible on print) */}
      <PrintStatement
        employee={employee}
        rows={rows}
        arrears={arrears}
        result={result}
        fifthCpcScaleId={fifthCpcScaleId}
        sixthCpcPayBandId={sixthCpcPayBandId}
        sixthCpcGradePay={sixthCpcGradePay}
        seventhCpcLevelId={seventhCpcLevelId}
      />
    </div>
  );
}

// -------------------------------------------------------
// Print Statement Component
// -------------------------------------------------------
interface PrintStatementProps {
  employee: EmployeeDetails;
  rows: PayRow[];
  arrears: ReturnType<typeof recomputeArrears>;
  result: CalculationResult;
  fifthCpcScaleId: string;
  sixthCpcPayBandId: string;
  sixthCpcGradePay: number;
  seventhCpcLevelId: string;
}

function PrintStatement({
  employee,
  rows,
  arrears,
  result,
  fifthCpcScaleId,
  sixthCpcPayBandId,
  sixthCpcGradePay,
  seventhCpcLevelId,
}: PrintStatementProps) {
  return (
    <div className="print-statement hidden">
      {/* Header */}
      <div className="print-header">
        <p className="print-title">GOVERNMENT OF INDIA</p>
        <p className="print-subtitle">{employee.department}</p>
        <p
          className="print-subtitle"
          style={{ fontWeight: "bold", fontSize: "14pt", marginTop: "8px" }}
        >
          PAY FIXATION STATEMENT
        </p>
        <p className="print-subtitle" style={{ fontSize: "10pt" }}>
          (As per Hon'ble Supreme Court Judgment on Pay Refixation)
        </p>
      </div>

      {/* Employee Details */}
      <table className="print-table" style={{ marginBottom: "15px" }}>
        <tbody>
          <tr>
            <td style={{ width: "25%", fontWeight: "bold" }}>Employee Name</td>
            <td style={{ width: "25%" }}>{employee.name}</td>
            <td style={{ width: "25%", fontWeight: "bold" }}>Employee ID</td>
            <td>{employee.employeeId}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Designation</td>
            <td>{employee.designation}</td>
            <td style={{ fontWeight: "bold" }}>Department</td>
            <td>{employee.department}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>Date of Appointment</td>
            <td>{employee.dateOfAppointment}</td>
            <td style={{ fontWeight: "bold" }}>Basic Pay at Appointment</td>
            <td>₹{formatINR(employee.basicPayAtAppointment)}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>5th CPC Scale</td>
            <td>{fifthCpcScaleId}</td>
            <td style={{ fontWeight: "bold" }}>6th CPC Pay Band</td>
            <td>
              {sixthCpcPayBandId} (GP: ₹{formatINR(sixthCpcGradePay)})
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>7th CPC Level</td>
            <td>{seventhCpcLevelId}</td>
            <td style={{ fontWeight: "bold" }}>Statement Date</td>
            <td>{new Date().toLocaleDateString("en-IN")}</td>
          </tr>
        </tbody>
      </table>

      {/* Summary */}
      <table className="print-table" style={{ marginBottom: "15px" }}>
        <thead>
          <tr>
            <th>5th CPC Final Basic (2005)</th>
            <th>6th CPC Refixed Basic (2006)</th>
            <th>7th CPC Refixed Basic (2016)</th>
            <th>Total Arrears</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ textAlign: "center", fontWeight: "bold" }}>
              ₹{formatINR(result.fifthCPCPayAt2005)}
            </td>
            <td style={{ textAlign: "center", fontWeight: "bold" }}>
              ₹{formatINR(result.sixthCPCRefixedAt2006)}
            </td>
            <td style={{ textAlign: "center", fontWeight: "bold" }}>
              ₹{formatINR(result.seventhCPCRefixedAt2016)}
            </td>
            <td
              style={{
                textAlign: "center",
                fontWeight: "bold",
                color: arrears.totalArrears > 0 ? "red" : "green",
              }}
            >
              ₹{formatINR(arrears.totalArrears)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Pay Progression Table */}
      <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
        Year-wise Pay Progression:
      </p>
      <table className="print-table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Era</th>
            <th>Due Basic</th>
            <th>Due DA</th>
            <th>Due TA</th>
            <th>Due Total</th>
            <th>Drawn Basic</th>
            <th>Drawn DA</th>
            <th>Drawn TA</th>
            <th>Drawn Total</th>
            <th>Difference</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.year}>
              <td style={{ textAlign: "center" }}>
                {row.year}
                {row.isRefixedYear ? "*" : ""}
              </td>
              <td style={{ textAlign: "center" }}>{row.era} CPC</td>
              <td style={{ textAlign: "right" }}>{formatINR(row.dueBasic)}</td>
              <td style={{ textAlign: "right" }}>{formatINR(row.dueDA)}</td>
              <td style={{ textAlign: "right" }}>{formatINR(row.dueTA)}</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatINR(row.dueTotal)}
              </td>
              <td style={{ textAlign: "right" }}>
                {formatINR(row.drawnBasic)}
              </td>
              <td style={{ textAlign: "right" }}>{formatINR(row.drawnDA)}</td>
              <td style={{ textAlign: "right" }}>{formatINR(row.drawnTA)}</td>
              <td style={{ textAlign: "right", fontWeight: "bold" }}>
                {formatINR(row.drawnTotal)}
              </td>
              <td
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                  color: row.difference > 0 ? "red" : "green",
                }}
              >
                {row.difference > 0 ? "+" : ""}
                {formatINR(row.difference)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Arrears Summary */}
      <p style={{ fontWeight: "bold", marginTop: "15px", marginBottom: "5px" }}>
        Arrears Summary:
      </p>
      <table className="print-table">
        <thead>
          <tr>
            <th>Component</th>
            <th>5th CPC Period</th>
            <th>6th CPC Period</th>
            <th>7th CPC Period</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ fontWeight: "bold" }}>Basic Arrears</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right", fontWeight: "bold" }}>
              ₹{formatINR(arrears.basicArrears)}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>DA Arrears</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right", fontWeight: "bold" }}>
              ₹{formatINR(arrears.daArrears)}
            </td>
          </tr>
          <tr>
            <td style={{ fontWeight: "bold" }}>TA Arrears</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right" }}>—</td>
            <td style={{ textAlign: "right", fontWeight: "bold" }}>
              ₹{formatINR(arrears.taArrears)}
            </td>
          </tr>
          <tr style={{ borderTop: "2px solid black" }}>
            <td style={{ fontWeight: "bold" }}>Total Arrears</td>
            <td style={{ textAlign: "right", fontWeight: "bold" }}>
              ₹{formatINR(arrears.fifthCPCPeriodArrears)}
            </td>
            <td style={{ textAlign: "right", fontWeight: "bold" }}>
              ₹{formatINR(arrears.sixthCPCPeriodArrears)}
            </td>
            <td style={{ textAlign: "right", fontWeight: "bold" }}>
              ₹{formatINR(arrears.seventhCPCPeriodArrears)}
            </td>
            <td
              style={{ textAlign: "right", fontWeight: "bold", color: "red" }}
            >
              ₹{formatINR(arrears.totalArrears)}
            </td>
          </tr>
        </tbody>
      </table>

      <p style={{ fontSize: "9pt", marginTop: "10px" }}>
        * Rows marked with * denote pay refixation years (2006, 2016)
      </p>

      {/* Signatures */}
      <div className="print-signatures">
        <div>
          <p
            style={{
              borderTop: "1px solid black",
              paddingTop: "5px",
              marginTop: "40px",
              minWidth: "180px",
            }}
          >
            Dealing Assistant
          </p>
        </div>
        <div>
          <p
            style={{
              borderTop: "1px solid black",
              paddingTop: "5px",
              marginTop: "40px",
              minWidth: "180px",
            }}
          >
            Section Officer / DDO
          </p>
        </div>
        <div>
          <p
            style={{
              borderTop: "1px solid black",
              paddingTop: "5px",
              marginTop: "40px",
              minWidth: "180px",
            }}
          >
            Head of Office
          </p>
        </div>
      </div>
    </div>
  );
}
