import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/sensors";
import CommonTypes "../types/common";

module {
  public type SensorReading = Types.SensorReading;
  public type SensorPayload = Types.SensorPayload;
  public type EmotionResult = Types.EmotionResult;
  public type ChildId = CommonTypes.ChildId;
  public type Timestamp = CommonTypes.Timestamp;

  // Store a new sensor reading from a validated payload
  public func storeReading(
    readings : List.List<SensorReading>,
    nextId : Nat,
    childId : ChildId,
    payload : SensorPayload,
  ) : SensorReading {
    let reading : SensorReading = {
      id = nextId;
      childId = childId;
      deviceId = payload.deviceId;
      timestamp = payload.timestamp;
      gsr = payload.gsr;
      ppg = payload.ppg;
      hrv = payload.hrv;
      stressLevel = payload.stressLevel;
      motionIntensity = payload.motionIntensity;
      accelX = payload.accelX;
      accelY = payload.accelY;
      accelZ = payload.accelZ;
      gyroX = payload.gyroX;
      gyroY = payload.gyroY;
      gyroZ = payload.gyroZ;
    };
    readings.add(reading);
    reading;
  };

  // Get the latest reading for a child (highest timestamp)
  public func getLatest(
    readings : List.List<SensorReading>,
    childId : ChildId,
  ) : ?SensorReading {
    var latest : ?SensorReading = null;
    readings.forEach(func(r) {
      if (r.childId == childId) {
        switch (latest) {
          case null { latest := ?r };
          case (?prev) {
            if (r.timestamp > prev.timestamp) { latest := ?r };
          };
        };
      };
    });
    latest;
  };

  // Get readings for a child within a date range
  public func getByDateRange(
    readings : List.List<SensorReading>,
    childId : ChildId,
    fromTimestamp : Timestamp,
    toTimestamp : Timestamp,
  ) : [SensorReading] {
    readings.filter(func(r) {
      r.childId == childId and r.timestamp >= fromTimestamp and r.timestamp <= toTimestamp
    }).toArray();
  };

  // Get the most recent N readings for a child
  public func getRecent(
    readings : List.List<SensorReading>,
    childId : ChildId,
    limit : Nat,
  ) : [SensorReading] {
    let filtered = readings.filter(func(r) { r.childId == childId });
    let total = filtered.size();
    if (total <= limit) {
      filtered.toArray();
    } else {
      let start : Int = total - limit;
      filtered.sliceToArray(start, total);
    };
  };

  // Store an emotion detection result
  public func storeEmotion(
    emotions : List.List<EmotionResult>,
    nextId : Nat,
    readingId : CommonTypes.ReadingId,
    childId : ChildId,
    timestamp : Timestamp,
    emotionState : Text,
    confidence : Float,
    careSuggestions : [Text],
    rawResponse : Text,
  ) : EmotionResult {
    let result : EmotionResult = {
      id = nextId;
      readingId = readingId;
      childId = childId;
      timestamp = timestamp;
      emotionState = emotionState;
      confidence = confidence;
      careSuggestions = careSuggestions;
      rawResponse = rawResponse;
    };
    emotions.add(result);
    result;
  };

  // Get the latest emotion result for a child
  public func getLatestEmotion(
    emotions : List.List<EmotionResult>,
    childId : ChildId,
  ) : ?EmotionResult {
    var latest : ?EmotionResult = null;
    emotions.forEach(func(e) {
      if (e.childId == childId) {
        switch (latest) {
          case null { latest := ?e };
          case (?prev) {
            if (e.timestamp > prev.timestamp) { latest := ?e };
          };
        };
      };
    });
    latest;
  };

  // Get emotion history for a child (most recent N)
  public func getEmotionHistory(
    emotions : List.List<EmotionResult>,
    childId : ChildId,
    limit : Nat,
  ) : [EmotionResult] {
    let filtered = emotions.filter(func(e) { e.childId == childId });
    let total = filtered.size();
    if (total <= limit) {
      filtered.toArray();
    } else {
      let start : Int = total - limit;
      filtered.sliceToArray(start, total);
    };
  };

  // Get children with stress > threshold or distressed emotion within time window
  public func findAlerts(
    readings : List.List<SensorReading>,
    emotions : List.List<EmotionResult>,
    childIds : [ChildId],
    stressThreshold : Float,
    withinNanoseconds : Int,
  ) : [(ChildId, ?SensorReading, ?EmotionResult)] {
    let cutoff : Int = Time.now() - withinNanoseconds;
    childIds.filterMap<ChildId, (ChildId, ?SensorReading, ?EmotionResult)>(func(cid) {
      let latestReading = getLatest(readings, cid);
      let latestEmotion = getLatestEmotion(emotions, cid);
      let hasStress = switch (latestReading) {
        case (?r) r.stressLevel > stressThreshold and r.timestamp >= cutoff;
        case null false;
      };
      let hasDistress = switch (latestEmotion) {
        case (?e) (e.emotionState == "distressed" or e.emotionState == "stressed") and e.timestamp >= cutoff;
        case null false;
      };
      if (hasStress or hasDistress) {
        ?(cid, latestReading, latestEmotion);
      } else {
        null;
      };
    });
  };
};
