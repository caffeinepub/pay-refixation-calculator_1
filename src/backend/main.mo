import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Order "mo:core/Order";

actor {
  type PayFixationRecord = {
    id : Nat;
    employeeId : Text;
    employeeName : Text;
    designation : Text;
    department : Text;
    dateOfAppointment : Text;
    basicPayAtAppointment : Nat;
    fifthCpcScale : Text;
    sixthCpcPayBand : Text;
    seventhCpcLevel : Nat;
    calculatedAt : Int;
    totalArrears : Int;
    recordJson : Text;
  };

  module PayFixationRecord {
    public func compare(a : PayFixationRecord, b : PayFixationRecord) : Order.Order {
      if (a.id < b.id) #less else if (a.id > b.id) #greater else {
        #equal;
      };
    };
  };

  var nextId = 0;
  let records = Map.empty<Nat, PayFixationRecord>();

  public shared ({ caller }) func saveRecord(
    employeeId : Text,
    employeeName : Text,
    designation : Text,
    department : Text,
    dateOfAppointment : Text,
    basicPayAtAppointment : Nat,
    fifthCpcScale : Text,
    sixthCpcPayBand : Text,
    seventhCpcLevel : Nat,
    calculatedAt : Int,
    totalArrears : Int,
    recordJson : Text,
  ) : async Nat {
    let record : PayFixationRecord = {
      id = nextId;
      employeeId;
      employeeName;
      designation;
      department;
      dateOfAppointment;
      basicPayAtAppointment;
      fifthCpcScale;
      sixthCpcPayBand;
      seventhCpcLevel;
      calculatedAt;
      totalArrears;
      recordJson;
    };
    records.add(nextId, record);
    nextId += 1;
    record.id;
  };

  public query ({ caller }) func listRecords() : async [PayFixationRecord] {
    records.values().toArray().sort();
  };

  public shared ({ caller }) func deleteRecord(id : Nat) : async () {
    if (not records.containsKey(id)) {
      Runtime.trap("No record with this ID exists");
    };
    records.remove(id);
  };
};
