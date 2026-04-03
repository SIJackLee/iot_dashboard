// /farms/[registNo] (서버 컴포넌트 래퍼)

import FarmDetailClient from "./farm-detail-client";

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ registNo: string }>;
}) {
  const { registNo } = await params;
  return <FarmDetailClient registNo={registNo} />;
}
