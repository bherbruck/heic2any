export const blobToFile = (blob: Blob, fileName: string): File => {
  const b: any = blob
  b.lastModifiedDate = new Date()
  b.name = fileName
  return blob as File
}
