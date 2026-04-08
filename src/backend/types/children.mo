import CommonTypes "common";

module {
  public type ChildId = CommonTypes.ChildId;
  public type Timestamp = CommonTypes.Timestamp;
  public type DeviceId = CommonTypes.DeviceId;

  // Internal mutable child profile
  public type ChildProfileInternal = {
    id : ChildId;
    var name : Text;
    var age : Nat;
    caregiverId : Principal;
    var deviceId : DeviceId;
    createdAt : Timestamp;
  };

  // Shared/public child profile for API boundary
  public type ChildProfile = {
    id : ChildId;
    name : Text;
    age : Nat;
    caregiverId : Principal;
    deviceId : DeviceId;
    createdAt : Timestamp;
  };

  // Summary for dashboard listing
  public type ChildSummary = {
    id : ChildId;
    name : Text;
    latestEmotion : ?Text;
    latestStressLevel : ?Float;
    latestMotionIntensity : ?Float;
    latestTimestamp : ?Timestamp;
  };
};
