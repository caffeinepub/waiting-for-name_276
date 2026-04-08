import type { Principal } from "@icp-sdk/core/principal";

export type ChildId = bigint;
export type ReadingId = bigint;
export type EmotionId = bigint;
export type Timestamp = bigint;
export type DeviceId = string;

export type EmotionState =
  | "calm"
  | "alert"
  | "distressed"
  | "excited"
  | "unknown";

export interface ChildProfile {
  id: ChildId;
  age: bigint;
  caregiverId: Principal;
  name: string;
  createdAt: Timestamp;
  deviceId: DeviceId;
}

export interface ChildSummary {
  id: ChildId;
  latestStressLevel?: number;
  latestMotionIntensity?: number;
  latestEmotion?: string;
  name: string;
  latestTimestamp?: Timestamp;
}

export interface SensorReading {
  id: ReadingId;
  gsr: number;
  hrv: number;
  ppg: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  stressLevel: number;
  childId: ChildId;
  motionIntensity: number;
  gyroX: number;
  gyroY: number;
  gyroZ: number;
  deviceId: DeviceId;
  timestamp: Timestamp;
}

export interface EmotionResult {
  id: EmotionId;
  emotionState: string;
  careSuggestions: string[];
  childId: ChildId;
  timestamp: Timestamp;
  rawResponse: string;
  confidence: number;
  readingId: ReadingId;
}

export interface Alert {
  stressLevel: number;
  emotionState: string;
  childId: ChildId;
  timestamp: Timestamp;
  childName: string;
}

export interface ChildDetail {
  recentReadings: SensorReading[];
  emotionHistory: EmotionResult[];
  profile: {
    id: ChildId;
    age: bigint;
    caregiverId: Principal;
    name: string;
    createdAt: Timestamp;
    deviceId: DeviceId;
  };
}

export interface StressAlert {
  childId: ChildId;
  childName: string;
  alertType: "stress" | "distressed";
  stressLevel?: number;
  emotionState?: string;
  timestamp: number;
}
