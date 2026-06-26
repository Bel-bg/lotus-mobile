import {
  ScanLine,
  PackagePlus,
  Receipt,
  BellDot,
  ArrowLeftRight,
  TrendingUp,
} from "lucide-react-native";
import { FloatingActionButton, FABAction } from "./Fab";

const ICON_SIZE = 20;
const ICON_COLOR = "#111111";

export default function HomeFab() {
  const fabActions: FABAction[] = [
    {
      key: "expense",
      label: "Dépense annexe",
      icon: <Receipt size={ICON_SIZE} color={ICON_COLOR} />,
      onPress: () => console.log("→ Dépense annexe"),
    },
    {
      key: "alert",
      label: "Seuils d'alerte",
      icon: <BellDot size={ICON_SIZE} color={ICON_COLOR} />,
      onPress: () => console.log("→ Seuils d'alerte"),
    },
    {
      key: "currency",
      label: "Convertisseur",
      icon: <ArrowLeftRight size={ICON_SIZE} color={ICON_COLOR} />,
      onPress: () => console.log("→ Convertisseur monnaies"),
    },
    {
      key: "movements",
      label: "Mouvements",
      icon: <TrendingUp size={ICON_SIZE} color={ICON_COLOR} />,
      onPress: () => console.log("→ Mouvements de stock"),
    },
  ];

  return <FloatingActionButton actions={fabActions} />;
}
