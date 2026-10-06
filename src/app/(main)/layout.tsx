import React from "react";
import { MainLayoutContainer } from "@/components/layout/MainLayoutContainer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayoutContainer>{children}</MainLayoutContainer>;
}
