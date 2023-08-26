type UploadData = {
  data: string;
  iv: string;
};

type ArweaveData = {
  file: UploadData;
  metadata: UploadData;
  schemaVersion: string;
};

export type { ArweaveData, UploadData };
