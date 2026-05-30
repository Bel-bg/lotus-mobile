import { APP_CONFIG } from "@/store/config";
import type {
  BilanData,
  BilanDateRange,
  BilanInventoryRow,
  BilanShortcut,
} from "@/types/bilan";
import { getBoutique } from "@/lib/db/boutique";
import { updateBilanPdfPath } from "@/lib/db/bilans";
import { getDB, initDB } from "@/lib/db/schema";
import { formatDate, formatMontant } from "@/lib/utils/formatters";

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
});

function formatLocalDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseISODate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  const day = copy.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + delta);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getShortcutRange(
  shortcut: Exclude<BilanShortcut, "custom">,
  baseDate = new Date()
): BilanDateRange {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  if (shortcut === "today") {
    const iso = formatLocalDateToISO(today);
    return { startDate: iso, endDate: iso, shortcut };
  }

  if (shortcut === "week") {
    return {
      startDate: formatLocalDateToISO(startOfWeek(today)),
      endDate: formatLocalDateToISO(today),
      shortcut,
    };
  }

  return {
    startDate: formatLocalDateToISO(startOfMonth(today)),
    endDate: formatLocalDateToISO(today),
    shortcut,
  };
}

export function normalizeDateRange(range: BilanDateRange): BilanDateRange {
  if (range.startDate <= range.endDate) {
    return range;
  }

  return {
    ...range,
    startDate: range.endDate,
    endDate: range.startDate,
  };
}

export function getDateRangeLabel(range: BilanDateRange): string {
  const normalized = normalizeDateRange(range);

  if (normalized.startDate === normalized.endDate) {
    const date = parseISODate(normalized.startDate);
    const weekday = WEEKDAY_FORMATTER.format(date);
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} · ${formatDate(
      normalized.startDate
    )}`;
  }

  return `${formatDate(normalized.startDate)} - ${formatDate(
    normalized.endDate
  )}`;
}

export function getCompactDateRangeLabel(range: BilanDateRange): string {
  const normalized = normalizeDateRange(range);

  if (normalized.shortcut === "today") {
    return "Aujourd'hui";
  }

  if (normalized.shortcut === "week") {
    return "Cette semaine";
  }

  if (normalized.shortcut === "month") {
    return "Ce mois";
  }

  if (normalized.startDate === normalized.endDate) {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
    }).format(parseISODate(normalized.startDate));
  }

  const start = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(parseISODate(normalized.startDate));
  const end = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(parseISODate(normalized.endDate));

  return `${start} - ${end}`;
}

export function hasSingleDayRange(range: BilanDateRange): boolean {
  return normalizeDateRange(range).startDate === normalizeDateRange(range).endDate;
}

export async function getBilanData(range: BilanDateRange): Promise<BilanData> {
  await initDB();
  const db = getDB();
  const normalizedRange = normalizeDateRange(range);
  const [boutique, sortiesRows, entreesRows] = await Promise.all([
    getBoutique(),
    db.getAllAsync<any>(
      `SELECT
         vi.produit_id AS produit_id,
         vi.produit_nom AS produit_nom,
         SUM(vi.quantite) AS quantite,
         COALESCE(SUM(vi.sous_total) / NULLIF(SUM(vi.quantite), 0), 0) AS prix_unitaire,
         SUM(vi.sous_total) AS total
       FROM vente_items vi
       INNER JOIN ventes v ON v.id = vi.vente_id
       WHERE date(v.created_at) BETWEEN ? AND ?
       GROUP BY vi.produit_id, vi.produit_nom
       ORDER BY total DESC, vi.produit_nom COLLATE NOCASE ASC`,
      [normalizedRange.startDate, normalizedRange.endDate]
    ),
    db.getAllAsync<any>(
      `SELECT
         m.produit_id AS produit_id,
         COALESCE(p.nom, 'Produit supprimé') AS produit_nom,
         SUM(m.quantite) AS quantite,
         COALESCE(p.prix_unitaire, 0) AS prix_unitaire,
         SUM(m.quantite) * COALESCE(p.prix_unitaire, 0) AS total
       FROM mouvements m
       LEFT JOIN produits p ON p.id = m.produit_id
       WHERE m.type = 'entree'
         AND date(m.created_at) BETWEEN ? AND ?
       GROUP BY m.produit_id, COALESCE(p.nom, 'Produit supprimé'), COALESCE(p.prix_unitaire, 0)
       ORDER BY total DESC, produit_nom COLLATE NOCASE ASC`,
      [normalizedRange.startDate, normalizedRange.endDate]
    ),
  ]);

  const sorties = sortiesRows.map(mapInventoryRow);
  const entrees = entreesRows.map(mapInventoryRow);

  const chiffreAffaires = sorties.reduce((sum, row) => sum + row.total, 0);
  const valeurStockEntre = entrees.reduce((sum, row) => sum + row.total, 0);

  return {
    boutique,
    range: normalizedRange,
    sorties,
    entrees,
    summary: {
      totalEntrees: entrees.reduce((sum, row) => sum + row.quantite, 0),
      totalSorties: sorties.reduce((sum, row) => sum + row.quantite, 0),
      valeurStockEntre,
      chiffreAffaires,
      margeBrute: chiffreAffaires - valeurStockEntre,
      mouvementCount: entrees.length + sorties.length,
    },
  };
}

export async function persistBilanPdfUri(
  range: BilanDateRange,
  pdfUri: string
): Promise<void> {
  if (!hasSingleDayRange(range)) {
    return;
  }

  await updateBilanPdfPath(range.startDate, pdfUri);
}

export function buildBilanPdfHtml(data: BilanData): string {
  const boutiqueNom = data.boutique?.nom?.trim() || APP_CONFIG.name;
  const boutiqueOwner = data.boutique?.proprietaire?.trim();
  const boutiquePhone = data.boutique?.telephone?.trim();
  const boutiqueEmail = data.boutique?.email?.trim();
  const label = getDateRangeLabel(data.range);
  const marginTone = data.summary.margeBrute >= 0 ? "#166534" : "#B91C1C";

  const renderTableRows = (rows: BilanInventoryRow[]) =>
    rows.length === 0
      ? `<tr><td colspan="4" class="empty">Aucune ligne sur cette période.</td></tr>`
      : rows
          .map(
            (row) => `
              <tr>
                <td>${escapeHtml(row.produitNom)}</td>
                <td>${row.quantite}</td>
                <td>${formatMontant(row.prixUnitaire)}</td>
                <td>${formatMontant(row.total)}</td>
              </tr>
            `
          )
          .join("");

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bilan Lotus Business</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #111111;
            padding: 28px;
          }
          .header {
            border: 1px solid #111111;
            padding: 20px;
            margin-bottom: 24px;
          }
          .brand {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px;
          }
          .meta {
            margin: 4px 0;
            font-size: 13px;
          }
          .section {
            margin-bottom: 24px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            margin: 0 0 12px;
            text-transform: uppercase;
          }
          .summary-grid {
            display: table;
            width: 100%;
            border-spacing: 12px 0;
            margin: 0 -12px 24px;
          }
          .summary-card {
            display: table-cell;
            border: 1px solid #111111;
            padding: 16px;
            width: 33%;
          }
          .summary-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #555555;
            margin-bottom: 8px;
          }
          .summary-value {
            font-size: 20px;
            font-weight: 700;
          }
          .summary-value.margin {
            color: ${marginTone};
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #D5D5D5;
            padding: 10px 12px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background: #F5F5F5;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.04em;
          }
          .empty {
            text-align: center;
            color: #666666;
            font-style: italic;
          }
          .note {
            margin-top: 10px;
            color: #666666;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <section class="header">
          <p class="brand">${escapeHtml(boutiqueNom)}</p>
          <p class="meta">Période: ${escapeHtml(label)}</p>
          ${
            boutiqueOwner
              ? `<p class="meta">Responsable: ${escapeHtml(boutiqueOwner)}</p>`
              : ""
          }
          ${
            boutiquePhone
              ? `<p class="meta">Téléphone: ${escapeHtml(boutiquePhone)}</p>`
              : ""
          }
          ${
            boutiqueEmail
              ? `<p class="meta">Email: ${escapeHtml(boutiqueEmail)}</p>`
              : ""
          }
        </section>

        <section class="summary-grid">
          <div class="summary-card">
            <div class="summary-label">Valeur stock entré</div>
            <div class="summary-value">${formatMontant(
              data.summary.valeurStockEntre
            )}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Chiffre d'affaires</div>
            <div class="summary-value">${formatMontant(
              data.summary.chiffreAffaires
            )}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Marge brute</div>
            <div class="summary-value margin">${formatMontant(
              data.summary.margeBrute
            )}</div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Inventaire des sorties</h2>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Qté</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${renderTableRows(data.sorties)}</tbody>
          </table>
        </section>

        ${
          data.entrees.length > 0
            ? `
              <section class="section">
                <h2 class="section-title">Inventaire des entrées</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Qté</th>
                      <th>Prix unitaire</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>${renderTableRows(data.entrees)}</tbody>
                </table>
                <p class="note">
                  Les entrées sont valorisées avec le prix unitaire produit actuellement stocké,
                  car le schéma SQLite ne conserve pas encore de prix d'achat par réapprovisionnement.
                </p>
              </section>
            `
            : ""
        }
      </body>
    </html>
  `;
}

function mapInventoryRow(row: any): BilanInventoryRow {
  return {
    produitId: row.produit_id,
    produitNom: row.produit_nom,
    quantite: Number(row.quantite ?? 0),
    prixUnitaire: Number(row.prix_unitaire ?? 0),
    total: Number(row.total ?? 0),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
