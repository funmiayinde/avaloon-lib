import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { Storage } from '@google-cloud/storage';

/**
 * The FileService class
 * */
@Injectable()
export class FileUploadService {
  constructor(private config: ConfigService) {}

  /**
   * @param {Object} payload The payload object
   * @param {Object} options The payload object
   * @return {Promise<Object>}
   * */
  async uploadToS3(payload, options: any = {}) {
    try {
      const bucketName = this.config.get('service.aws.s3.bucket');
      const s3Filename = `${Date.now()}-${payload.name}`;
      console.log('bucketName:::', bucketName);
      const s3 = new S3({
        accessKeyId: this.config.get('service.aws.s3.key'),
        secretAccessKey: this.config.get('service.aws.s3.secret'),
      });
      const params = {
        Bucket: bucketName,
        Key: String(s3Filename),
        Body: payload.body,
        ...options,
      };
      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            Logger.error(`AWS-S3-Error: ${err}`);
            reject(err.message);
          }
          resolve(data);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  /**
   * @param {Object} payload The payload object
   * @param {Object} options The payload object
   * @return {Promise<Object>}
   * */
  async uploadToGCS(payload, options: any = {}) {
    try {
      const bucketName = this.config.get('service.google.gcs.bucket');
      const storage = new Storage({
        projectId: this.config.get('service.google.gcs.projectId'),
        keyFilename: this.config.get('service.google.gcs.keyFile'),
        ...options,
      });
      const bucket = storage.bucket(bucketName);
      const gcsFileName = `${Date.now()}-${payload.name}`;
      const file = bucket.file(gcsFileName);
      return new Promise((resolve, reject) => {
        const stream = file.createWriteStream({
          metadata: {
            contentType: payload.contentType,
          },
        });
        stream.on('error', (err) => {
          reject(err);
        });
        stream.on('finish', async () => {
          await file.makePublic();
          const url = this.getPublicUrl(bucketName, gcsFileName);
          resolve(url);
          stream.end(payload.body);
        });
      });
    } catch (e) {
      throw e;
    }
  }

  getPublicUrl = (bucketName, fileName) =>
    `https://storage.googleapis.com/${bucketName}/${fileName}`;
}
