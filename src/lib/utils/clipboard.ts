/**
 * Copie texte — utilise expo-clipboard si installé, sinon false
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Clipboard = require('expo-clipboard') as {
      setStringAsync: (value: string) => Promise<void>
    }
    await Clipboard.setStringAsync(text)
    return true
  } catch {
    return false
  }
}
