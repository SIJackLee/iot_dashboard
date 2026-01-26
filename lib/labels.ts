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
