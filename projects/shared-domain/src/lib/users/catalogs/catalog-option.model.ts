export interface CatalogOption<TCode extends string = string> {
  code: TCode;
  label: string;
  description: string;
  icon: string;
  sortOrder: number;
  enabled: boolean;
}
