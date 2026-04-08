import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type DeviceId = string;
export interface ChildDetail {
    recentReadings: Array<SensorReading>;
    emotionHistory: Array<EmotionResult>;
    profile: {
        id: ChildId;
        age: bigint;
        caregiverId: Principal;
        name: string;
        createdAt: Timestamp;
        deviceId: DeviceId;
    };
}
export type Timestamp = bigint;
export interface Alert {
    stressLevel: number;
    emotionState: string;
    childId: ChildId;
    timestamp: Timestamp;
    childName: string;
}
export type ChildId = bigint;
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
export interface SensorPayload {
    gsr: number;
    hrv: number;
    ppg: number;
    accelX: number;
    accelY: number;
    accelZ: number;
    stressLevel: number;
    motionIntensity: number;
    gyroX: number;
    gyroY: number;
    gyroZ: number;
    deviceId: DeviceId;
    timestamp: Timestamp;
}
export interface ChildSummary {
    id: ChildId;
    latestStressLevel?: number;
    latestMotionIntensity?: number;
    latestEmotion?: string;
    name: string;
    latestTimestamp?: Timestamp;
}
export interface EmotionResult {
    id: EmotionId;
    emotionState: string;
    careSuggestions: Array<string>;
    childId: ChildId;
    timestamp: Timestamp;
    rawResponse: string;
    confidence: number;
    readingId: ReadingId;
}
export type ReadingId = bigint;
export type EmotionId = bigint;
export interface ChildProfile {
    id: ChildId;
    age: bigint;
    caregiverId: Principal;
    name: string;
    createdAt: Timestamp;
    deviceId: DeviceId;
}
export enum Variant_admin_user {
    admin = "admin",
    user = "user"
}
export interface backendInterface {
    assignRole(user: Principal, role: Variant_admin_user): Promise<void>;
    createChild(name: string, age: bigint, deviceId: DeviceId): Promise<ChildProfile>;
    deleteChild(childId: ChildId): Promise<boolean>;
    getAlerts(): Promise<Array<Alert>>;
    getChild(childId: ChildId): Promise<ChildProfile | null>;
    getChildDetail(childId: ChildId): Promise<ChildDetail | null>;
    getEmotionHistory(childId: ChildId): Promise<Array<EmotionResult>>;
    getMyChildren(): Promise<Array<ChildSummary>>;
    getMyRole(): Promise<Variant_admin_user | null>;
    getSensorReadings(childId: ChildId, fromTimestamp: Timestamp, toTimestamp: Timestamp): Promise<Array<SensorReading>>;
    ingestSensorData(payload: SensorPayload): Promise<EmotionResult>;
    register(): Promise<void>;
    updateChild(childId: ChildId, name: string, age: bigint, deviceId: DeviceId): Promise<boolean>;
}
