// /rooms/[key12]/motor (서버 컴포넌트 래퍼)

import RoomMotorClient from "./room-motor-client";

export default async function RoomMotorPage({
  params,
}: {
  params: Promise<{ key12: string }>;
}) {
  const { key12 } = await params;
  return <RoomMotorClient key12={key12} />;
}
