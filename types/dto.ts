// DTO 정의 - 모든 시간 필드는 KST ISO 문자열(+09:00)

export type ISODateTimeKst = string; // "2026-01-22T10:45:00+09:00"
export type Key12 = string; // "FARM01010101"
export type RegistNo = string; // "FARM01"
export type VentMode = "exhaust" | "intake";
export type RoomState = "normal" | "warn" | "danger" | "offline";
export type IntArray = number[];

// (2) SensorsDTO
export interface SensorsDTO {
  es01: IntArray;
  es02: IntArray;
  es03: IntArray;
  es04: IntArray;
  es09: IntArray;
}

// (3) MotorsDTO
export interface MotorsDTO {
  ec01: IntArray;
  ventMode: VentMode;
  ec02: IntArray | null;
  ec03: IntArray | null;
  activeVent: IntArray;
}

// (4) FarmsSummaryResponseDTO
export interface FarmSummaryDTO {
  registNo: RegistNo;
  totalRooms: number; // 60
  normal: number;
  warn: number;
  danger: number;
  offline: number;
  lastUpdatedAtKst: ISODateTimeKst | null;
  freshnessSec: number | null;
}

export interface FarmsSummaryResponseDTO {
  serverNowKst: ISODateTimeKst;
  items: FarmSummaryDTO[];
}

// (5) FarmDetailDTO (Lite)
export interface RoomSnapshotLiteDTO {
  key12: Key12;
  stallNo: number;
  roomNo: number;
  ventMode: VentMode;
  blowerCount: number;
  ventCount: number;
  measureTsKst: ISODateTimeKst;
  updatedAtKst: ISODateTimeKst;
  freshnessSec: number;
  state: RoomState;
}

export interface StallDetailDTO {
  stallNo: number;
  rooms: RoomSnapshotLiteDTO[];
}

export interface FarmDetailDTO {
  serverNowKst: ISODateTimeKst;
  farm: {
    registNo: RegistNo;
    totalRooms: number;
  };
  summary: {
    normal: number;
    warn: number;
    danger: number;
    offline: number;
    lastUpdatedAtKst: ISODateTimeKst | null;
    freshnessP50Sec?: number;
    freshnessP95Sec?: number;
  };
  stalls: StallDetailDTO[];
}

// (6) RoomSnapshotFullDTO
export interface RoomSnapshotFullDTO {
  serverNowKst: ISODateTimeKst;
  mapping: {
    key12: Key12;
    registNo: RegistNo;
    species?: number;
    speciesCode?: string;
    stallTyCode: number;
    stallNo: number;
    roomNo: number;
    ventMode: VentMode;
    blowerCount: number;
    ventCount: number;
  };
  timing: {
    measureTsKst: ISODateTimeKst;
    updatedAtKst: ISODateTimeKst;
    freshnessSec: number;
  };
  state: RoomState;
  sensors: SensorsDTO;
  motors: MotorsDTO;
}

// (7) RoomLogsResponseDTO
export interface RoomLogPointDTO {
  measureTsKst: ISODateTimeKst;
  createdAtKst?: ISODateTimeKst;
  sensors: SensorsDTO;
  motors: MotorsDTO;
}

export interface RoomLogsResponseDTO {
  serverNowKst: ISODateTimeKst;
  key12: Key12;
  items: RoomLogPointDTO[];
  nextCursor?: ISODateTimeKst;
}
