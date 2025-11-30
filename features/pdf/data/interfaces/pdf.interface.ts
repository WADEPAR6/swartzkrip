export interface IPdf {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date | string;
  uploadedBy?: string;
  tags?: string[];
  isActive: boolean;
}

export interface IPdfListResponse {
  data: IPdf[];
  total: number;
  page: number;
  limit: number;
}

export interface IPdfCreateRequest {
  title: string;
  description?: string;
  file: File;
  tags?: string[];
}

export interface IPdfUpdateRequest {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  isActive?: boolean;
}