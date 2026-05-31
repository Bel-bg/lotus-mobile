import { Redirect } from 'expo-router'

/** Redirection vers le nouveau catalogue produits (F1) */
export default function StockScreen() {
  return <Redirect href="/(drawer)/(tabs)/produits/catalogue" />
}
