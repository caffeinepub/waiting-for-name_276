import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import ChildrenLib "../lib/children";
import SensorsLib "../lib/sensors";
import ChildTypes "../types/children";
import SensorTypes "../types/sensors";
import CommonTypes "../types/common";

mixin (
  roles : Map.Map<Principal, { #admin; #user }>,
  children : List.List<ChildTypes.ChildProfileInternal>,
  sensorReadings : List.List<SensorTypes.SensorReading>,
  emotionResults : List.List<SensorTypes.EmotionResult>,
  nextChildId : [var Nat],
) {
  // Register caller as first admin or as user
  public shared ({ caller }) func register() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot register");
    };
    if (roles.isEmpty()) {
      roles.add(caller, #admin);
    } else {
      switch (roles.get(caller)) {
        case (?_) {}; // already registered
        case null { roles.add(caller, #user) };
      };
    };
  };

  // Get the role of the caller
  public query ({ caller }) func getMyRole() : async ?{ #admin; #user } {
    roles.get(caller);
  };

  // Assign a role to a user (admin only)
  public shared ({ caller }) func assignRole(user : Principal, role : { #admin; #user }) : async () {
    switch (roles.get(caller)) {
      case (? #admin) {};
      case _ { Runtime.trap("Unauthorized: Only admins can assign roles") };
    };
    roles.add(user, role);
  };

  // Create a new child profile for the authenticated caregiver
  public shared ({ caller }) func createChild(
    name : Text,
    age : Nat,
    deviceId : CommonTypes.DeviceId,
  ) : async ChildTypes.ChildProfile {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized: Must register first") };
      case (?_) {};
    };
    let child = ChildrenLib.createProfile(children, nextChildId[0], name, age, caller, deviceId);
    nextChildId[0] += 1;
    ChildrenLib.toPublic(child);
  };

  // Get a specific child profile (caregiver must own the child)
  public query ({ caller }) func getChild(childId : CommonTypes.ChildId) : async ?ChildTypes.ChildProfile {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    switch (ChildrenLib.getById(children, childId)) {
      case null null;
      case (?child) {
        if (not Principal.equal(child.caregiverId, caller)) {
          switch (roles.get(caller)) {
            case (? #admin) ?ChildrenLib.toPublic(child);
            case _ null;
          };
        } else {
          ?ChildrenLib.toPublic(child);
        };
      };
    };
  };

  // Update a child profile (caregiver must own the child)
  public shared ({ caller }) func updateChild(
    childId : CommonTypes.ChildId,
    name : Text,
    age : Nat,
    deviceId : CommonTypes.DeviceId,
  ) : async Bool {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    ChildrenLib.update(children, childId, caller, name, age, deviceId);
  };

  // Delete a child profile (caregiver must own the child)
  public shared ({ caller }) func deleteChild(childId : CommonTypes.ChildId) : async Bool {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    ChildrenLib.delete(children, childId, caller);
  };

  // Get all children for the authenticated caregiver with latest sensor summary
  public query ({ caller }) func getMyChildren() : async [ChildTypes.ChildSummary] {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    let myChildren = ChildrenLib.getByCaregiver(children, caller);
    myChildren.map<ChildTypes.ChildProfileInternal, ChildTypes.ChildSummary>(func(child) {
      let latestReading = SensorsLib.getLatest(sensorReadings, child.id);
      let latestEmotion = SensorsLib.getLatestEmotion(emotionResults, child.id);
      ChildrenLib.buildSummary(child, latestReading, latestEmotion);
    }).toArray();
  };

  // Get full child detail: profile + latest 100 readings + emotion history
  public query ({ caller }) func getChildDetail(childId : CommonTypes.ChildId) : async ?SensorTypes.ChildDetail {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    switch (ChildrenLib.getById(children, childId)) {
      case null null;
      case (?child) {
        let isOwner = Principal.equal(child.caregiverId, caller);
        let isAdmin = switch (roles.get(caller)) { case (? #admin) true; case _ false };
        if (not isOwner and not isAdmin) {
          null;
        } else {
          let recentReadings = SensorsLib.getRecent(sensorReadings, childId, 100);
          let emotionHistory = SensorsLib.getEmotionHistory(emotionResults, childId, 50);
          ?{
            profile = ChildrenLib.toPublic(child);
            recentReadings;
            emotionHistory;
          };
        };
      };
    };
  };

  // Get stress/distress alerts for the caregiver's children (stress > 70 or distressed in last 1h)
  public query ({ caller }) func getAlerts() : async [SensorTypes.Alert] {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    let myChildren = ChildrenLib.getByCaregiver(children, caller);
    let childIds = myChildren.map<ChildTypes.ChildProfileInternal, CommonTypes.ChildId>(func(c) { c.id }).toArray();
    let oneHour : Int = 3_600_000_000_000;
    let alertTuples = SensorsLib.findAlerts(sensorReadings, emotionResults, childIds, 70.0, oneHour);
    alertTuples.filterMap<(CommonTypes.ChildId, ?SensorTypes.SensorReading, ?SensorTypes.EmotionResult), SensorTypes.Alert>(func((childId, maybeReading, maybeEmotion)) {
      switch (ChildrenLib.getById(children, childId)) {
        case null null;
        case (?child) {
          let stressLevel = switch (maybeReading) { case (?r) r.stressLevel; case null 0.0 };
          let emotionState = switch (maybeEmotion) { case (?e) e.emotionState; case null "unknown" };
          let ts = switch (maybeReading) { case (?r) r.timestamp; case null 0 };
          ?{
            childId;
            childName = child.name;
            stressLevel;
            emotionState;
            timestamp = ts;
          };
        };
      };
    });
  };
};
