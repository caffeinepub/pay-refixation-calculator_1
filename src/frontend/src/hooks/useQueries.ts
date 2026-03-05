import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PayFixationRecord } from "../backend.d";
import { useActor } from "./useActor";

// -------------------------------------------------------
// List all records from backend
// -------------------------------------------------------
export function useListRecords() {
  const { actor, isFetching } = useActor();
  return useQuery<PayFixationRecord[]>({
    queryKey: ["records"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

// -------------------------------------------------------
// Save a record to backend
// -------------------------------------------------------
export function useSaveRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      employeeId: string;
      employeeName: string;
      designation: string;
      department: string;
      dateOfAppointment: string;
      basicPayAtAppointment: bigint;
      fifthCpcScale: string;
      sixthCpcPayBand: string;
      seventhCpcLevel: bigint;
      calculatedAt: bigint;
      totalArrears: bigint;
      recordJson: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveRecord(
        params.employeeId,
        params.employeeName,
        params.designation,
        params.department,
        params.dateOfAppointment,
        params.basicPayAtAppointment,
        params.fifthCpcScale,
        params.sixthCpcPayBand,
        params.seventhCpcLevel,
        params.calculatedAt,
        params.totalArrears,
        params.recordJson,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}

// -------------------------------------------------------
// Delete a record
// -------------------------------------------------------
export function useDeleteRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
}
