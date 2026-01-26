export const FARM_LABEL = "농장";
export const VENT_MODE_LABEL = "환기방식";
export const BLOWER_LABEL = "배기팬";
export const VENT_FAN_LABEL = "송풍팬";
export const ACTIVE_VENT_LABEL = "활성 팬";

export const roomLabel = (roomNo: number | string) => `${roomNo}번방`;
export const stallLabel = (stallNo: number | string) => `축사 ${stallNo}`;

export const ventModeLabel = (mode: string) => {
  if (mode === "exhaust") return "배기환기";
  if (mode === "intake") return "입기환기";
  return mode;
};

const SENSOR_LABELS: Record<string, string> = {
  es01: "온도",
  es02: "습도",
  es03: "이산화탄소",
  es04: "암모니아",
  es09: "음압",
};

const MOTOR_LABELS: Record<string, string> = {
  ec01: "송풍팬",
  ec02: "배기팬",
  ec03: "입기팬",
};

export const sensorLabel = (key: string) =>
  SENSOR_LABELS[key.toLowerCase()] ?? key.toUpperCase();

export const motorLabel = (key: string) =>
  MOTOR_LABELS[key.toLowerCase()] ?? key.toUpperCase();

// 센서 단위 정보
const SENSOR_UNITS: Record<string, string> = {
  es01: "℃",
  es02: "%",
  es03: "ppm",
  es04: "ppm",
  es09: "Pa",
};

// 센서 x10 스케일 여부
const SENSOR_SCALE_X10: Record<string, boolean> = {
  es01: true,  // 온도
  es02: true,  // 습도
  es03: false, // 이산화탄소
  es04: true,  // 암모니아
  es09: true,  // 음압
};

// 모터 단위
const MOTOR_UNITS: Record<string, string> = {
  ec01: "RPM",
  ec02: "RPM",
  ec03: "RPM",
};

// 모터 x10 스케일 여부 (모두 false)
const MOTOR_SCALE_X10: Record<string, boolean> = {
  ec01: false,
  ec02: false,
  ec03: false,
};

// 센서 값 변환 함수 (x10 스케일 적용)
export const convertSensorValue = (key: string, value: number): number => {
  const scaleX10 = SENSOR_SCALE_X10[key.toLowerCase()] ?? false;
  return scaleX10 ? Math.round((value / 10) * 10) / 10 : value;
};

// 모터 값 변환 함수 (현재는 변환 없음)
export const convertMotorValue = (key: string, value: number): number => {
  const scaleX10 = MOTOR_SCALE_X10[key.toLowerCase()] ?? false;
  return scaleX10 ? Math.round((value / 10) * 10) / 10 : value;
};

// 센서 단위 가져오기
export const getSensorUnit = (key: string): string =>
  SENSOR_UNITS[key.toLowerCase()] ?? "";

// 모터 단위 가져오기
export const getMotorUnit = (key: string): string =>
  MOTOR_UNITS[key.toLowerCase()] ?? "RPM";

// 센서 x10 스케일 여부 확인
export const isSensorScaleX10 = (key: string): boolean =>
  SENSOR_SCALE_X10[key.toLowerCase()] ?? false;
