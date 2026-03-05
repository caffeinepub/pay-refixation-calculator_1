import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useState } from "react";

export interface EmployeeDetails {
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  dateOfAppointment: string;
  basicPayAtAppointment: number;
}

interface Step1Props {
  data: EmployeeDetails;
  onNext: (data: EmployeeDetails) => void;
}

export function Step1EmployeeDetails({ data, onNext }: Step1Props) {
  const [form, setForm] = useState<EmployeeDetails>(data);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EmployeeDetails, string>>
  >({});

  function validate(): boolean {
    const newErrors: Partial<Record<keyof EmployeeDetails, string>> = {};

    if (!form.name.trim()) newErrors.name = "Employee name is required.";
    if (!form.employeeId.trim())
      newErrors.employeeId = "Employee ID is required.";
    if (!form.designation.trim())
      newErrors.designation = "Designation is required.";
    if (!form.department.trim())
      newErrors.department = "Department is required.";

    if (!form.dateOfAppointment) {
      newErrors.dateOfAppointment = "Date of appointment is required.";
    } else {
      const year = new Date(form.dateOfAppointment).getFullYear();
      if (year !== 1998) {
        newErrors.dateOfAppointment =
          "Date of appointment must be in 1998 (as per Supreme Court Judgment).";
      }
    }

    if (!form.basicPayAtAppointment || form.basicPayAtAppointment <= 0) {
      newErrors.basicPayAtAppointment =
        "Basic pay at appointment must be a positive number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onNext(form);
    }
  }

  function update(field: keyof EmployeeDetails, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Employee Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="emp-name"
            className="text-sm font-semibold text-foreground"
          >
            Employee Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="emp-name"
            placeholder="Enter full name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={errors.name ? "border-destructive" : ""}
            data-ocid="step1.name_input"
          />
          {errors.name && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Employee ID */}
        <div className="space-y-1.5">
          <Label
            htmlFor="emp-id"
            className="text-sm font-semibold text-foreground"
          >
            Employee ID <span className="text-destructive">*</span>
          </Label>
          <Input
            id="emp-id"
            placeholder="Enter employee ID / PF No."
            value={form.employeeId}
            onChange={(e) => update("employeeId", e.target.value)}
            className={errors.employeeId ? "border-destructive" : ""}
            data-ocid="step1.id_input"
          />
          {errors.employeeId && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.employeeId}
            </p>
          )}
        </div>

        {/* Designation */}
        <div className="space-y-1.5">
          <Label
            htmlFor="emp-desig"
            className="text-sm font-semibold text-foreground"
          >
            Designation <span className="text-destructive">*</span>
          </Label>
          <Input
            id="emp-desig"
            placeholder="e.g., Section Officer, Assistant"
            value={form.designation}
            onChange={(e) => update("designation", e.target.value)}
            className={errors.designation ? "border-destructive" : ""}
            data-ocid="step1.designation_input"
          />
          {errors.designation && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.designation}
            </p>
          )}
        </div>

        {/* Department */}
        <div className="space-y-1.5">
          <Label
            htmlFor="emp-dept"
            className="text-sm font-semibold text-foreground"
          >
            Department / Ministry <span className="text-destructive">*</span>
          </Label>
          <Input
            id="emp-dept"
            placeholder="e.g., Ministry of Finance"
            value={form.department}
            onChange={(e) => update("department", e.target.value)}
            className={errors.department ? "border-destructive" : ""}
            data-ocid="step1.department_input"
          />
          {errors.department && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.department}
            </p>
          )}
        </div>

        {/* Date of Appointment */}
        <div className="space-y-1.5">
          <Label
            htmlFor="emp-date"
            className="text-sm font-semibold text-foreground"
          >
            Date of Appointment <span className="text-destructive">*</span>
          </Label>
          <Input
            id="emp-date"
            type="date"
            min="1998-01-01"
            max="1998-12-31"
            value={form.dateOfAppointment}
            onChange={(e) => update("dateOfAppointment", e.target.value)}
            className={errors.dateOfAppointment ? "border-destructive" : ""}
            data-ocid="step1.date_input"
          />
          <p className="text-xs text-muted-foreground">
            Must be in 1998 (as per Supreme Court Judgment)
          </p>
          {errors.dateOfAppointment && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.dateOfAppointment}
            </p>
          )}
        </div>

        {/* Basic Pay at Appointment */}
        <div className="space-y-1.5">
          <Label
            htmlFor="basic-pay"
            className="text-sm font-semibold text-foreground"
          >
            Basic Pay at Appointment (₹){" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="basic-pay"
            type="number"
            min="1000"
            max="35000"
            placeholder="e.g., 4500"
            value={form.basicPayAtAppointment || ""}
            onChange={(e) =>
              update(
                "basicPayAtAppointment",
                Number.parseInt(e.target.value) || 0,
              )
            }
            className={`font-mono ${errors.basicPayAtAppointment ? "border-destructive" : ""}`}
            data-ocid="step1.basic_pay_input"
          />
          <p className="text-xs text-muted-foreground">
            Enter the pay as per appointment order (will be clamped to selected
            scale)
          </p>
          {errors.basicPayAtAppointment && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.basicPayAtAppointment}
            </p>
          )}
        </div>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-foreground/80">
          This calculator is for Government of India employees appointed in
          1998, as per the Hon'ble Supreme Court Judgment on Pay Refixation.
          Ensure all details match official service records.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 gap-2"
          data-ocid="step1.next_button"
        >
          Next: 5th CPC Scale
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </form>
  );
}
