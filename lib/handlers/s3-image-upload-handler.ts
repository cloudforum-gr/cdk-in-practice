import { S3Event, S3EventRecord, SQSEvent } from "aws-lambda";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({});
export const handler = async (event: SQSEvent): Promise<void> => {
  for (const sqsRecord of event.Records ?? []) {
    const body = JSON.parse(sqsRecord.body) as S3Event;
    for (const s3Record of body.Records ?? []) {
      const img = await getImageBuffer(s3Record);
      const thumbnail = await sharp(img).resize(200).toBuffer();
      await saveImage(thumbnail, s3Record);
    }
  }
};

const saveImage = async (buffer: Buffer, record: S3EventRecord) => {
  const fileName = record.s3.object.key.split("/").pop();
  await s3.send(
    new PutObjectCommand({
      Bucket: record.s3.bucket.name,
      Key: `thumbnails/${fileName}`,
      Body: buffer,
    })
  );
};

const getImageBuffer = async (record: S3EventRecord): Promise<Buffer> => {
  const obj = await s3.send(
    new GetObjectCommand({
      Bucket: record.s3.bucket.name,
      Key: record.s3.object.key,
    })
  );
  if (!obj.Body) {
    throw new Error(
      `S3 object has undefined body [Bucket='${record.s3.bucket.name}'Key='${record.s3.object.key}']`
    );
  }
  const bytes = await obj.Body.transformToByteArray();
  return Buffer.from(bytes.buffer);
};
