import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const bucketName = process.env.ATTACHMENT_S3_BUCKET

// TODO: Implement the fileStogare logic

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

export function AttachmentUtils(todoId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: parseInt(urlExpiration)
    })
  }