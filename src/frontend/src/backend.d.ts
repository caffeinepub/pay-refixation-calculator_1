import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PayFixationRecord {
    id: bigint;
    employeeName: string;
    designation: string;
    recordJson: string;
    calculatedAt: bigint;
    basicPayAtAppointment: bigint;
    employeeId: string;
    dateOfAppointment: string;
    fifthCpcScale: string;
    department: string;
    seventhCpcLevel: bigint;
    totalArrears: bigint;
    sixthCpcPayBand: string;
}
export interface backendInterface {
    deleteRecord(id: bigint): Promise<void>;
    listRecords(): Promise<Array<PayFixationRecord>>;
    saveRecord(employeeId: string, employeeName: string, designation: string, department: string, dateOfAppointment: string, basicPayAtAppointment: bigint, fifthCpcScale: string, sixthCpcPayBand: string, seventhCpcLevel: bigint, calculatedAt: bigint, totalArrears: bigint, recordJson: string): Promise<bigint>;
}
