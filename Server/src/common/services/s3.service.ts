import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  ObjectCannedACL,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { storageApproach } from "../enums";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.config";
import { BadRequestError } from "../utils/error.utils";
import { createReadStream } from "node:fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class S3Service {
  private client: S3Client;
  constructor() {
    this.client = new S3Client({
      region: env.AWS_S3_REGION,
      credentials: {
        accessKeyId: env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile({
    storage = storageApproach.memory,
    file,
    Bucket = env.AWS_S3_BUCKET_NAME,
    ACL = ObjectCannedACL.public_read,
    ContentType,
    path = "general",
    fileName,
  }: {
    storage?: storageApproach;
    file: Express.Multer.File;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    ContentType?: string;
    path?: string;
    fileName?: string;
  }) {
    const Body =
      storage === storageApproach.memory || !file.path
        ? file.buffer
        : createReadStream(file.path);
    const keyName = fileName ? fileName : `${randomUUID()}__${file.originalname}`;
    const command = new PutObjectCommand({
      Body,
      ACL,
      Bucket,
      Key: `${env.APP_NAME}/${path}/${keyName}`,
      ContentType: file.mimetype || ContentType,
    });
    if (!command.input?.Key) {
      throw new BadRequestError("Failed to generate file key for S3 upload");
    }

    await this.client.send(command);
    return command.input?.Key;
  }

  async uploadLargeFiles({
    storage = storageApproach.disk,
    file,
    Bucket = env.AWS_S3_BUCKET_NAME,
    ACL = ObjectCannedACL.public_read,
    ContentType,
    path = "general",
  }: {
    storage?: storageApproach;
    file: Express.Multer.File;
    Bucket?: string;
    ACL?: ObjectCannedACL;
    ContentType?: string;
    path?: string;
  }) {
    const upload = new Upload({
      client: this.client,
      params: {
        Body:
          storage === storageApproach.memory || !file.path
            ? file.buffer
            : createReadStream(file.path),
        ACL,
        Bucket,
        Key: `${env.APP_NAME}/${path}/${randomUUID()}__${file.originalname}`,
        ContentType: file.mimetype || ContentType,
      },
    });
    upload.on("httpUploadProgress", (progress) => {
      console.log(progress);
      console.log(
        `Upload progress: ${((progress.loaded as number) / (progress.total as number)) * 100} %`,
      );
    });
    return await upload.done();
  }

  async createPresignedUploadLink({
    Bucket = env.AWS_S3_BUCKET_NAME,
    path = "general",
    ContentType,
    originalName,
  }: {
    Bucket?: string;
    path?: string;
    ContentType?: string;
    originalName: string;
  }): Promise<{ url: string; key: string }> {
    const key = `${env.APP_NAME}/${path}/${randomUUID()}__${originalName}`;
    const command = new PutObjectCommand({
      Bucket,
      Key: key,
      ContentType,
    });
    const url = await getSignedUrl(this.client, command, {
      expiresIn: 120,
    });
    return { url, key };
  }

  async getFile({
    Bucket = env.AWS_S3_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });
    return await this.client.send(command);
  }

  async deleteFile({
    Bucket = env.AWS_S3_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<void> {
    console.log(`S3 deleteFile called for bucket: ${Bucket}, key: ${Key}`);
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });
    const result = await this.client.send(command);
    console.log(`S3 deleteFile completed for key: ${Key}`, result);
  }
  async ensureBucketPublicRead   () {
    try {
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${env.AWS_S3_BUCKET_NAME}/*`,
          },
        ],
      };
  
      const command = new PutBucketPolicyCommand({
        Bucket: env.AWS_S3_BUCKET_NAME,
        Policy: JSON.stringify(policy),
      });
  
      await this.client.send(command);
      console.log("✅ S3 bucket public-read policy applied");
    } catch (error: any) {
      if (error.name === "MalformedPolicy" || error.name === "AccessDenied") {
        console.warn("⚠️  Cannot set S3 bucket policy — you may need to set it manually in AWS Console:");
        console.warn(`   Bucket: ${env.AWS_S3_BUCKET_NAME}`);
        console.warn("   Policy: { Version: '2012-10-17', Statement: [{ Sid: 'PublicReadGetObject', Effect: 'Allow', Principal: '*', Action: 's3:GetObject', Resource: 'arn:aws:s3:::<bucket>/*' }] }");
      } else {
        console.warn(`⚠️  S3 bucket policy error: ${error.message}`);
      }
    }
  };
}
export const s3Service = new S3Service();
