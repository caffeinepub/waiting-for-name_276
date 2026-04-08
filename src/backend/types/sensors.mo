import CommonTypes "common";

module {
  public type ReadingId = CommonTypes.ReadingId;
  public type ChildId = CommonTypes.ChildId;
  public type EmotionId = CommonTypes.EmotionId;
  public type Timestamp = CommonTypes.Timestamp;
  public type DeviceId = CommonTypes.DeviceId;

  // Raw sensor payload from ESP32
  public type SensorPayload = {
    deviceId : DeviceId;
    timestamp : Timestamp;
    gsr : Float;
    ppg : Float;
    hrv : Float;
    stressLevel : Float;
    motionIntensity : Float;
    accelX : Float;
    accelY : Float;
    accelZ : Float;
    gyroX : Float;
    gyroY : Float;
    gyroZ : Float;
  };

  // Stored sensor reading (includes generated ID and child association)
  public type SensorReading = {
    id : ReadingId;
    childId : ChildId;
    deviceId : DeviceId;
    timestamp : Timestamp;
    gsr : Float;
    ppg : Float;
    hrv : Float;
    stressLevel : Float;
    motionIntensity : Float;
    accelX : Float;
    accelY : Float;
    accelZ : Float;
    gyroX : Float;
    gyroY : Float;
    gyroZ : Float;
  };

  // Emotion detection result
  public type EmotionResult = {
    id : EmotionId;
    readingId : ReadingId;
    childId : ChildId;
    timestamp : Timestamp;
    emotionState : Text;
    confidence : Float;
    careSuggestions : [Text];
    rawResponse : Text;
  };

  // Alert for stress/distress
  public type Alert = {
    childId : ChildId;
    childName : Text;
    stressLevel : Float;
    emotionState : Text;
    timestamp : Timestamp;
  };

  // Child detail response (profile + sensor + emotion data)
  public type ChildDetail = {
    profile : {
      id : ChildId;
      name : Text;
      age : Nat;
      caregiverId : Principal;
      deviceId : DeviceId;
      createdAt : Timestamp;
    };
    recentReadings : [SensorReading];
    emotionHistory : [EmotionResult];
  };
};
