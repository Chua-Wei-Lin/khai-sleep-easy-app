import { Ionicons } from "@expo/vector-icons";
import type { TextInputProps } from "react-native";

export type RowType =
  | "switch"
  | "link"
  | "button"
  | "radio-button"
  | "note"
  | "text-input"
  | "date";

export type Card = {
  id: string;
  sectionLabel?: string;
  rows: Array<{
    id: string;
    type: RowType;
    title: string;
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    route?: string; // for "link"
    onPress?: () => void; // for "button" & "radio-button"
    textInputProps?: TextInputProps; // for "text-input"
  }>;
};

export type ListItem =
  | { kind: "title" }
  | { kind: "spacer"; id: string }
  | { kind: "section"; id: string; label: string }
  | { kind: "card"; id: string; card: Card }
  | { kind: "cta" };
