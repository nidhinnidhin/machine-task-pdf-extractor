import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { IStorageService } from '../../application/interfaces/storage-service.interface';

@Injectable()
export class S3StorageService implements IStorageService {
  private readonly _s3Client: S3Client;
  private readonly _bucketName: string;

  constructor(private readonly _configService: ConfigService) {
    const region = this._configService.get<string>('AWS_REGION') || 'us-east-1';
    const accessKeyId = this._configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this._configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const endpoint = this._configService.get<string>('AWS_S3_ENDPOINT');

    this._bucketName = this._configService.get<string>('AWS_S3_BUCKET') || '';

    const s3Config: any = {
      region,
    };

    if (accessKeyId && secretAccessKey) {
      s3Config.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    if (endpoint) {
      s3Config.endpoint = endpoint;
      s3Config.forcePathStyle = true; // Often required for local S3-compatible systems like MinIO/LocalStack
    }

    this._s3Client = new S3Client(s3Config);
  }

  async save(key: string, file: Buffer, mimetype?: string): Promise<string> {
    await this._s3Client.send(
      new PutObjectCommand({
        Bucket: this._bucketName,
        Key: key,
        Body: file,
        ContentType: mimetype || 'application/pdf',
      }),
    );
    // Return the S3 key, which is stored in the database as filePath
    return key;
  }

  async get(key: string): Promise<Buffer> {
    if (path.isAbsolute(key)) {
      // Legacy fallback: read from local file system if the path is an absolute disk path
      return await fs.readFile(key);
    }

    const response = await this._s3Client.send(
      new GetObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      }),
    );

    if (!response.Body) {
      throw new Error(`S3 response body is empty for key: ${key}`);
    }

    const bytes = await response.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  async delete(key: string): Promise<void> {
    if (path.isAbsolute(key)) {
      // Legacy fallback for pre-existing files on local disk
      try {
        await fs.unlink(key);
      } catch {
        // Ignore if file doesn't exist
      }
      return;
    }

    await this._s3Client.send(
      new DeleteObjectCommand({
        Bucket: this._bucketName,
        Key: key,
      }),
    );
  }
}
