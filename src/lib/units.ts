export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return { ft, inch };
}

export function ftInToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

export function lbsToKg(lbs: number): number {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function displayHeight(cm: number, lang: string): string {
  if (lang === "en") {
    const { ft, inch } = cmToFtIn(cm);
    return `${ft}'${inch}"`;
  }
  return `${cm} cm`;
}

export function displayWeight(kg: number, lang: string): string {
  if (lang === "en") return `${kgToLbs(kg)} lbs`;
  return `${kg} kg`;
}
