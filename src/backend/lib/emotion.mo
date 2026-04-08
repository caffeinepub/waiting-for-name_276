import Float "mo:core/Float";
import Text "mo:core/Text";

module {
  // Build the JSON request body to send to the AI service
  public func buildRequestBody(
    gsr : Float,
    ppg : Float,
    hrv : Float,
    stressLevel : Float,
    motionIntensity : Float,
  ) : Text {
    "{\"gsr\":" # gsr.toText() #
    ",\"ppg\":" # ppg.toText() #
    ",\"hrv\":" # hrv.toText() #
    ",\"stress_level\":" # stressLevel.toText() #
    ",\"motion_intensity\":" # motionIntensity.toText() # "}";
  };

  // Parse AI response JSON text into emotion state, confidence, and care suggestions
  // Returns defaults on parse failure
  public func parseResponse(rawResponse : Text) : (Text, Float, [Text]) {
    let lower = rawResponse.toLower();
    let emotionState = if (lower.contains(#text "distressed")) {
      "distressed"
    } else if (lower.contains(#text "stressed")) {
      "stressed"
    } else if (lower.contains(#text "happy")) {
      "happy"
    } else if (lower.contains(#text "calm")) {
      "calm"
    } else if (lower.contains(#text "anxious")) {
      "anxious"
    } else {
      "neutral"
    };
    let confidence : Float = 0.8;
    let careSuggestions : [Text] = switch (emotionState) {
      case "distressed" {
        ["Comfort the child immediately", "Check for physical discomfort", "Provide a calm environment"]
      };
      case "stressed" {
        ["Reduce stimulation", "Engage in calming activities", "Ensure rest and hydration"]
      };
      case "anxious" {
        ["Provide reassurance", "Maintain a routine", "Offer gentle physical contact"]
      };
      case _ {
        ["Continue monitoring", "Maintain normal care routine"]
      };
    };
    (emotionState, confidence, careSuggestions);
  };
};
