// 루트 페이지 - /farms로 리다이렉트

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/farms");
}
