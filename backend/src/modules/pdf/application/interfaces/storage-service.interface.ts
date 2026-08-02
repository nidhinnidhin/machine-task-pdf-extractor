export interface IStorageService {
  /**
   * Saves a file buffer to the storage provider.
   * @param key The unique key or filename for the file
   * @param file The file buffer
   * @param mimetype Optional file mime type
   * @returns The path or identifier where the file was saved
   */
  save(key: string, file: Buffer, mimetype?: string): Promise<string>;

  /**
   * Retrieves a file buffer from the storage provider.
   * @param key The unique key or file path of the file
   */
  get(key: string): Promise<Buffer>;

  /**
   * Deletes a file from the storage provider.
   * @param key The unique key or file path of the file to delete
   */
  delete(key: string): Promise<void>;
}
