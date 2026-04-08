import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import ChildrenLib "../lib/children";
import SensorsLib "../lib/sensors";
import EmotionLib "../lib/emotion";
import ChildTypes "../types/children";
import SensorTypes "../types/sensors";
import CommonTypes "../types/common";

mixin (
  roles : Map.Map<Principal, { #admin; #user }>,
  children : List.List<ChildTypes.ChildProfileInternal>,
  sensorReadings : List.List<SensorTypes.SensorReading>,
  emotionResults : List.List<SensorTypes.EmotionResult>,
  nextReadingId : [var Nat],
  nextEmotionId : [var Nat],
  aiApiUrl : Text,
  ic : CommonTypes.IcActor,
) {

  // Check if the AI API URL is a placeholder (not a real endpoint)
  func isPlaceholderUrl(url : Text) : Bool {
    url.contains(#text "example.com") or url.contains(#text "localhost") or url == ""
  };

  // HTTP POST endpoint: ESP32 submits sensor readings by device ID
  // Validates device ID against known children, stores reading, triggers emotion detection
  public shared func ingestSensorData(payload : SensorTypes.SensorPayload) : async SensorTypes.EmotionResult {
    let child = switch (ChildrenLib.getByDeviceId(children, payload.deviceId)) {
      case null { Runtime.trap("Unknown device ID: " # payload.deviceId) };
      case (?c) c;
    };
    let reading = SensorsLib.storeReading(sensorReadings, nextReadingId[0], child.id, payload);
    nextReadingId[0] += 1;

    // Call AI emotion detection
    let requestBody = EmotionLib.buildRequestBody(
      payload.gsr,
      payload.ppg,
      payload.hrv,
      payload.stressLevel,
      payload.motionIntensity,
    );

    let rawResponse = if (isPlaceholderUrl(aiApiUrl)) {
      // Placeholder URL — skip HTTP call, return default neutral response
      "{\"emotion\":\"calm\"}"
    } else {
      try {
        let response = await ic.http_request({
          url = aiApiUrl;
          max_response_bytes = ?2000;
          method = #post;
          headers = [
            { name = "Content-Type"; value = "application/json" },
            { name = "Accept"; value = "application/json" },
          ];
          body = ?requestBody.encodeUtf8();
          transform = null;
        });
        switch (response.body.decodeUtf8()) {
          case (?t) t;
          case null "{}";
        };
      } catch (_) {
        // HTTP call failed — fall back to default neutral response
        "{\"emotion\":\"calm\"}"
      }
    };

    let (emotionState, confidence, careSuggestions) = EmotionLib.parseResponse(rawResponse);
    let result = SensorsLib.storeEmotion(
      emotionResults,
      nextEmotionId[0],
      reading.id,
      child.id,
      reading.timestamp,
      emotionState,
      confidence,
      careSuggestions,
      rawResponse,
    );
    nextEmotionId[0] += 1;
    result;
  };

  // Get sensor readings for a child within a date range (for charts)
  public query ({ caller }) func getSensorReadings(
    childId : CommonTypes.ChildId,
    fromTimestamp : CommonTypes.Timestamp,
    toTimestamp : CommonTypes.Timestamp,
  ) : async [SensorTypes.SensorReading] {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    switch (ChildrenLib.getById(children, childId)) {
      case null { Runtime.trap("Child not found") };
      case (?child) {
        let isOwner = Principal.equal(child.caregiverId, caller);
        let isAdmin = switch (roles.get(caller)) { case (? #admin) true; case _ false };
        if (not isOwner and not isAdmin) {
          Runtime.trap("Unauthorized: Not your child");
        };
      };
    };
    SensorsLib.getByDateRange(sensorReadings, childId, fromTimestamp, toTimestamp);
  };

  // Get emotion history for a child
  public query ({ caller }) func getEmotionHistory(
    childId : CommonTypes.ChildId,
  ) : async [SensorTypes.EmotionResult] {
    switch (roles.get(caller)) {
      case null { Runtime.trap("Unauthorized") };
      case (?_) {};
    };
    switch (ChildrenLib.getById(children, childId)) {
      case null { Runtime.trap("Child not found") };
      case (?child) {
        let isOwner = Principal.equal(child.caregiverId, caller);
        let isAdmin = switch (roles.get(caller)) { case (? #admin) true; case _ false };
        if (not isOwner and not isAdmin) {
          Runtime.trap("Unauthorized: Not your child");
        };
      };
    };
    SensorsLib.getEmotionHistory(emotionResults, childId, 100);
  };
};
