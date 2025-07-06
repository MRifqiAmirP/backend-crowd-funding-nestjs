export class Gallery {
  id: String;
  projectId: String;
  title: string;
  image: Buffer;
  caption?: string;
  uploadedAt: Date;
}