import { Redirect } from "expo-router";
import React from "react";

export default function LegacyExportsPdfRedirect() {
  return <Redirect href="/documents" />;
}
