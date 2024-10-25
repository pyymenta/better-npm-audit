export interface NsprcConfigs {
  readonly active?: boolean;
  readonly expiry?: string | number;
  readonly notes?: string;
}

export interface NsprcFile {
  readonly [key: string]: NsprcConfigs | string;
}

export type ReadNsprcStrategy = (filePath: string) => NsprcFile | boolean | Promise<NsprcFile | boolean>;
