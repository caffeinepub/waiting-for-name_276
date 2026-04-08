import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/children";
import CommonTypes "../types/common";
import SensorTypes "../types/sensors";

module {
  public type ChildProfileInternal = Types.ChildProfileInternal;
  public type ChildProfile = Types.ChildProfile;
  public type ChildSummary = Types.ChildSummary;
  public type ChildId = CommonTypes.ChildId;

  // Create a new child profile
  public func createProfile(
    children : List.List<ChildProfileInternal>,
    nextId : Nat,
    name : Text,
    age : Nat,
    caregiverId : Principal,
    deviceId : CommonTypes.DeviceId,
  ) : ChildProfileInternal {
    let child : ChildProfileInternal = {
      id = nextId;
      var name = name;
      var age = age;
      caregiverId = caregiverId;
      var deviceId = deviceId;
      createdAt = Time.now();
    };
    children.add(child);
    child;
  };

  // Convert internal profile to public shared type
  public func toPublic(profile : ChildProfileInternal) : ChildProfile {
    {
      id = profile.id;
      name = profile.name;
      age = profile.age;
      caregiverId = profile.caregiverId;
      deviceId = profile.deviceId;
      createdAt = profile.createdAt;
    };
  };

  // Get all profiles owned by a caregiver
  public func getByCaregiver(
    children : List.List<ChildProfileInternal>,
    caregiverId : Principal,
  ) : List.List<ChildProfileInternal> {
    children.filter(func(c) { Principal.equal(c.caregiverId, caregiverId) });
  };

  // Get a single profile by ID
  public func getById(
    children : List.List<ChildProfileInternal>,
    id : ChildId,
  ) : ?ChildProfileInternal {
    children.find(func(c) { c.id == id });
  };

  // Get a profile by device ID
  public func getByDeviceId(
    children : List.List<ChildProfileInternal>,
    deviceId : CommonTypes.DeviceId,
  ) : ?ChildProfileInternal {
    children.find(func(c) { c.deviceId == deviceId });
  };

  // Update an existing child profile (returns updated via mapInPlace)
  public func update(
    children : List.List<ChildProfileInternal>,
    id : ChildId,
    caregiverId : Principal,
    name : Text,
    age : Nat,
    deviceId : CommonTypes.DeviceId,
  ) : Bool {
    var found = false;
    children.mapInPlace(func(c) {
      if (c.id == id and Principal.equal(c.caregiverId, caregiverId)) {
        c.name := name;
        c.age := age;
        c.deviceId := deviceId;
        found := true;
      };
      c;
    });
    found;
  };

  // Delete a child profile (returns true if found and owned)
  public func delete(
    children : List.List<ChildProfileInternal>,
    id : ChildId,
    caregiverId : Principal,
  ) : Bool {
    let before = children.size();
    let filtered = children.filter(func(c) {
      not (c.id == id and Principal.equal(c.caregiverId, caregiverId))
    });
    if (filtered.size() < before) {
      children.clear();
      children.append(filtered);
      true;
    } else {
      false;
    };
  };

  // Build dashboard summary for each child
  public func buildSummary(
    child : ChildProfileInternal,
    latestReading : ?SensorTypes.SensorReading,
    latestEmotion : ?SensorTypes.EmotionResult,
  ) : ChildSummary {
    {
      id = child.id;
      name = child.name;
      latestEmotion = switch (latestEmotion) { case (?e) ?e.emotionState; case null null };
      latestStressLevel = switch (latestReading) { case (?r) ?r.stressLevel; case null null };
      latestMotionIntensity = switch (latestReading) { case (?r) ?r.motionIntensity; case null null };
      latestTimestamp = switch (latestReading) { case (?r) ?r.timestamp; case null null };
    };
  };
};
