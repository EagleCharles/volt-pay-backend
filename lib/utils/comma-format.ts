export function commaFormat(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function removeCommas(value: string): string {
  return value.replace(/,/g, '');
}
