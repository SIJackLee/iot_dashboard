// /rooms/[key12] 페이지 (서버 컴포넌트 래퍼)

import RoomDetailClient from "./room-detail-client";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ key12: string }>;
}) {
  const { key12 } = await params;
  return <RoomDetailClient key12={key12} />;
}
