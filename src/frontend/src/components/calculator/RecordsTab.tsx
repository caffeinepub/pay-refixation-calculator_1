import type { PayFixationRecord } from "@/backend.d";
import { formatINR } from "@/calculations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Eye, FileX2, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

interface RecordsTabProps {
  records: PayFixationRecord[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onDelete: (id: bigint) => Promise<void>;
  onClearAll: () => Promise<void>;
  isDeletingId: bigint | null;
}

interface ViewDialogData {
  record: PayFixationRecord;
  parsed: ReturnType<typeof parseRecord>;
}

function parseRecord(record: PayFixationRecord) {
  try {
    return JSON.parse(record.recordJson) as {
      fifthCPCPayAt2005: number;
      sixthCPCRefixedAt2006: number;
      seventhCPCRefixedAt2016: number;
      totalArrears: number;
      basicArrears: number;
      daArrears: number;
      taArrears: number;
    };
  } catch {
    return null;
  }
}

export function RecordsTab({
  records,
  isLoading,
  isError,
  onDelete,
  onClearAll,
  isDeletingId,
}: RecordsTabProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<bigint | null>(null);
  const [viewData, setViewData] = useState<ViewDialogData | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  async function handleConfirmDelete() {
    if (deleteConfirmId === null) return;
    await onDelete(deleteConfirmId);
    setDeleteConfirmId(null);
  }

  async function handleClearAll() {
    setIsClearingAll(true);
    await onClearAll();
    setIsClearingAll(false);
    setShowClearConfirm(false);
  }

  function handleView(record: PayFixationRecord) {
    setViewData({ record, parsed: parseRecord(record) });
  }

  if (isLoading) {
    return (
      <div className="space-y-3 p-4" data-ocid="records.loading_state">
        {["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
          <Skeleton key={id} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-ocid="records.error_state"
      >
        <AlertCircle className="w-10 h-10 text-destructive mb-3" />
        <p className="text-sm text-muted-foreground">
          Failed to load records. Please try again.
        </p>
      </div>
    );
  }

  const hasRecords = records && records.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-foreground">
            Saved Calculations
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {records?.length ?? 0} record
            {(records?.length ?? 0) !== 1 ? "s" : ""} saved
          </p>
        </div>
        {hasRecords && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => setShowClearConfirm(true)}
            data-ocid="records.clear_all_button"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All
          </Button>
        )}
      </div>

      {/* Empty State */}
      {!hasRecords ? (
        <div
          className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg"
          data-ocid="records.empty_state"
        >
          <FileX2 className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="font-medium text-muted-foreground">
            No saved calculations
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
            Complete a pay fixation calculation and click "Save Record" to save
            it here.
          </p>
        </div>
      ) : (
        /* Records Table */
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table data-ocid="records.table">
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead className="text-xs font-semibold w-12">
                    #
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Employee Name
                  </TableHead>
                  <TableHead className="text-xs font-semibold hidden md:table-cell">
                    Employee ID
                  </TableHead>
                  <TableHead className="text-xs font-semibold hidden lg:table-cell">
                    Designation
                  </TableHead>
                  <TableHead className="text-xs font-semibold hidden md:table-cell">
                    Saved On
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-right">
                    Total Arrears
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records!.map((record, index) => {
                  const ocidIndex = index + 1;
                  const calculatedDate = new Date(
                    Number(record.calculatedAt),
                  ).toLocaleDateString("en-IN");

                  return (
                    <TableRow
                      key={String(record.id)}
                      className="hover:bg-primary/3"
                      data-ocid="records.row"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {ocidIndex}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {record.employeeName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                        {record.employeeId}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {record.designation}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                        {calculatedDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-mono font-semibold text-sm ${
                            Number(record.totalArrears) > 0
                              ? "text-[oklch(0.52_0.22_27)]"
                              : "text-[oklch(0.45_0.15_145)]"
                          }`}
                        >
                          ₹{formatINR(Number(record.totalArrears))}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0"
                            onClick={() => handleView(record)}
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 w-7 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                            onClick={() => setDeleteConfirmId(record.id)}
                            disabled={isDeletingId === record.id}
                            title="Delete Record"
                            data-ocid={`records.delete_button.${ocidIndex}`}
                          >
                            {isDeletingId === record.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteConfirmId !== null}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="sm:max-w-md" data-ocid="records.dialog">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this record? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              data-ocid="records.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeletingId !== null}
              data-ocid="records.confirm_button"
            >
              {isDeletingId !== null ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirm Dialog */}
      <Dialog
        open={showClearConfirm}
        onOpenChange={(open) => !open && setShowClearConfirm(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clear All Records</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all {records?.length} records?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowClearConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={isClearingAll}
            >
              {isClearingAll ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewData !== null}
        onOpenChange={(open) => !open && setViewData(null)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Details</DialogTitle>
            <DialogDescription>
              Pay fixation record for {viewData?.record.employeeName}
            </DialogDescription>
          </DialogHeader>
          {viewData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Employee Name</p>
                  <p className="font-semibold">
                    {viewData.record.employeeName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Employee ID</p>
                  <p className="font-mono">{viewData.record.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Designation</p>
                  <p>{viewData.record.designation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p>{viewData.record.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Date of Appointment
                  </p>
                  <p className="font-mono">
                    {viewData.record.dateOfAppointment}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Basic Pay at Appointment
                  </p>
                  <p className="font-mono font-semibold">
                    ₹{formatINR(Number(viewData.record.basicPayAtAppointment))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">5th CPC Scale</p>
                  <p className="font-mono">{viewData.record.fifthCpcScale}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    6th CPC Pay Band
                  </p>
                  <p className="font-mono">{viewData.record.sixthCpcPayBand}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">7th CPC Level</p>
                  <p className="font-mono">
                    Level {String(viewData.record.seventhCpcLevel)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Arrears</p>
                  <p className="font-mono font-bold text-[oklch(0.52_0.22_27)]">
                    ₹{formatINR(Number(viewData.record.totalArrears))}
                  </p>
                </div>
              </div>
              {viewData.parsed && (
                <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Summary
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        5th CPC (2005)
                      </p>
                      <p className="font-mono font-semibold">
                        ₹{formatINR(viewData.parsed.fifthCPCPayAt2005)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        6th CPC (2006)
                      </p>
                      <p className="font-mono font-semibold">
                        ₹{formatINR(viewData.parsed.sixthCPCRefixedAt2006)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        7th CPC (2016)
                      </p>
                      <p className="font-mono font-semibold">
                        ₹{formatINR(viewData.parsed.seventhCPCRefixedAt2016)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Total Arrears
                      </p>
                      <p className="font-mono font-bold text-[oklch(0.52_0.22_27)]">
                        ₹{formatINR(viewData.parsed.totalArrears)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewData(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
