import type { backendInterface, ChildSummary, ChildDetail, Alert, EmotionResult, SensorReading, ChildProfile } from "../backend";
import { Variant_admin_user } from "../backend";

const now = BigInt(Date.now()) * BigInt(1_000_000);
const fiveMin = BigInt(5 * 60 * 1_000_000_000);

const mockChildren: ChildSummary[] = [
  { id: BigInt(1), name: "Lena", latestEmotion: "Calm", latestStressLevel: 25, latestMotionIntensity: 0.3, latestTimestamp: now },
  { id: BigInt(2), name: "Noah", latestEmotion: "Distressed", latestStressLevel: 82, latestMotionIntensity: 0.9, latestTimestamp: now - fiveMin },
  { id: BigInt(3), name: "Aisha", latestEmotion: "Happy", latestStressLevel: 18, latestMotionIntensity: 0.5, latestTimestamp: now - fiveMin * BigInt(2) },
  { id: BigInt(4), name: "Marcus", latestEmotion: "Anxious", latestStressLevel: 67, latestMotionIntensity: 0.7, latestTimestamp: now - fiveMin * BigInt(3) },
  { id: BigInt(5), name: "Yuki", latestEmotion: "Calm", latestStressLevel: 30, latestMotionIntensity: 0.2, latestTimestamp: now - fiveMin * BigInt(4) },
  { id: BigInt(6), name: "Sofia", latestEmotion: "Tired", latestStressLevel: 45, latestMotionIntensity: 0.4, latestTimestamp: now - fiveMin * BigInt(5) },
];

const makeSensorReadings = (childId: bigint): SensorReading[] =>
  Array.from({ length: 20 }, (_, i) => ({
    id: BigInt(i + 1),
    childId,
    deviceId: `ESP32-${childId.toString().padStart(3, "0")}`,
    timestamp: now - BigInt(i) * fiveMin,
    gsr: 400 + Math.round(Math.sin(i * 0.5) * 80),
    hrv: 55 + Math.round(Math.sin(i * 0.3) * 15),
    ppg: 70 + Math.round(Math.sin(i * 0.4) * 20),
    stressLevel: 30 + Math.round(Math.sin(i * 0.6) * 25),
    motionIntensity: 0.3 + Math.sin(i * 0.7) * 0.2,
    accelX: Math.sin(i * 0.2) * 0.5,
    accelY: Math.cos(i * 0.3) * 0.4,
    accelZ: 9.8 + Math.sin(i * 0.1) * 0.2,
    gyroX: Math.sin(i * 0.4) * 0.1,
    gyroY: Math.cos(i * 0.5) * 0.1,
    gyroZ: Math.sin(i * 0.6) * 0.05,
  }));

const mockEmotionHistory: EmotionResult[] = [
  {
    id: BigInt(1),
    childId: BigInt(2),
    readingId: BigInt(1),
    emotionState: "Distressed",
    confidence: 0.91,
    careSuggestions: ["Provide comfort", "Check for discomfort sources", "Gentle music may help"],
    rawResponse: "{}",
    timestamp: now,
  },
  {
    id: BigInt(2),
    childId: BigInt(2),
    readingId: BigInt(2),
    emotionState: "Anxious",
    confidence: 0.78,
    careSuggestions: ["Offer reassurance", "Reduce stimulation"],
    rawResponse: "{}",
    timestamp: now - fiveMin,
  },
];

const mockAlerts: Alert[] = [
  {
    childId: BigInt(2),
    childName: "Noah",
    stressLevel: 82,
    emotionState: "Distressed",
    timestamp: now,
  },
  {
    childId: BigInt(4),
    childName: "Marcus",
    stressLevel: 67,
    emotionState: "Anxious",
    timestamp: now - fiveMin,
  },
];

const mockChildDetail: ChildDetail = {
  profile: {
    id: BigInt(2),
    name: "Noah",
    age: BigInt(4),
    deviceId: "ESP32-002",
    caregiverId: { toText: () => "aaaaa-bbbbb" } as any,
    createdAt: now - BigInt(30) * fiveMin * BigInt(24) * BigInt(60),
  },
  recentReadings: makeSensorReadings(BigInt(2)),
  emotionHistory: mockEmotionHistory,
};

export const mockBackend: backendInterface = {
  assignRole: async () => undefined,
  createChild: async (name, age, deviceId) => ({
    id: BigInt(99),
    name,
    age,
    deviceId,
    caregiverId: { toText: () => "aaaaa-bbbbb" } as any,
    createdAt: now,
  }),
  deleteChild: async () => true,
  getAlerts: async () => mockAlerts,
  getChild: async (childId) => ({
    id: childId,
    name: "Lena",
    age: BigInt(5),
    deviceId: "ESP32-001",
    caregiverId: { toText: () => "aaaaa-bbbbb" } as any,
    createdAt: now,
  }),
  getChildDetail: async () => mockChildDetail,
  getEmotionHistory: async () => mockEmotionHistory,
  getMyChildren: async () => mockChildren,
  getMyRole: async () => Variant_admin_user.user,
  getSensorReadings: async (childId) => makeSensorReadings(childId),
  ingestSensorData: async () => ({
    id: BigInt(99),
    childId: BigInt(1),
    readingId: BigInt(1),
    emotionState: "Calm",
    confidence: 0.85,
    careSuggestions: ["All looks good"],
    rawResponse: "{}",
    timestamp: now,
  }),
  register: async () => undefined,
  updateChild: async () => true,
};
