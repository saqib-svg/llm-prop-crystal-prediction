export const PROPERTY_LABELS: Record<string, string> = {
  band_gap: "Band Gap",
  density: "Density",
  conductivity: "Conductivity",
  formation_energy: "Formation Energy",
  bulk_modulus: "Bulk Modulus",
  elasticity: "Elasticity",
};

export function getPropertyLabel(key: string): string {
  return PROPERTY_LABELS[key] || key;
}
