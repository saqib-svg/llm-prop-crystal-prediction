export const PROPERTY_LABELS: Record<string, string> = {
  band_gap: "Band Gap",
  bandgap_classifier: "Directness",
  energy_above_hull: "Energy Above Hull",
  energy_per_atom: "Energy Per Atom",
  formation_energy: "Formation Energy",
  volume: "Volume",
  density: "Density",
  conductivity: "Conductivity",
  bulk_modulus: "Bulk Modulus",
  elasticity: "Elasticity",
};

export function getPropertyLabel(key: string): string {
  return PROPERTY_LABELS[key] || key;
}
