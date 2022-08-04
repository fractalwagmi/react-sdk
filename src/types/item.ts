export interface FractalItem {
  files: FractalItemFile[];
  id: string;
  name: string;
}

export interface FractalItemFile {
  type: string;
  uri: string;
}
