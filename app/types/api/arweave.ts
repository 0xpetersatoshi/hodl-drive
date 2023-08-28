type UploadData = {
  data: string;
  iv: string;
};

type ChunkedUploadData = {
  chunks: UploadData[];
};

type ArweaveData = {
  file: ChunkedUploadData;
  metadata: UploadData;
  schemaVersion: string;
};

export type { ArweaveData, UploadData, ChunkedUploadData };
