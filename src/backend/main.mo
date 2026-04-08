import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import CommonTypes "types/common";
import ChildTypes "types/children";
import SensorTypes "types/sensors";
import ChildrenApi "mixins/children-api";
import SensorsApi "mixins/sensors-api";



actor {
  // Authorization state: principal -> role (#admin, #user)
  let roles = Map.empty<Principal, { #admin; #user }>();

  // Child profiles storage
  let children = List.empty<ChildTypes.ChildProfileInternal>();
  let nextChildId = [var 0 : Nat];

  // Sensor readings storage
  let sensorReadings = List.empty<SensorTypes.SensorReading>();
  let nextReadingId = [var 0 : Nat];

  // Emotion detection results storage
  let emotionResults = List.empty<SensorTypes.EmotionResult>();
  let nextEmotionId = [var 0 : Nat];

  // AI service URL
  let aiApiUrl : Text = "https://api.example.com/emotion-detect";

  // IC management canister for HTTP outcalls (produced by migration to drop deprecated is_replicated field)
  let ic = actor ("aaaaa-aa") : CommonTypes.IcActor;

  // Include domain mixins
  include ChildrenApi(roles, children, sensorReadings, emotionResults, nextChildId);
  include SensorsApi(roles, children, sensorReadings, emotionResults, nextReadingId, nextEmotionId, aiApiUrl, ic);
};
