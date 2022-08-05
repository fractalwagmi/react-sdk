export interface Item {
  files: ItemFile[];
  id: string;
  name: string;
}

export interface ItemFile {
  type: string;
  uri: string;
}
