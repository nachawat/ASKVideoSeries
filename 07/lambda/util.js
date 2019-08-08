const AWS = require('aws-sdk');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});

module.exports = {
    /**
     * Generates an S3 Pre-Signed URL to ensure given private S3 object is 
     * publicly available for a given amount of time.
     * @param {*} s3ObjectKey S3 Object to be made publicly available
     */
    getS3PreSignedUrl(s3ObjectKey) {

        const bucketName = process.env.S3_PERSISTENCE_BUCKET;
        const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
            Bucket: bucketName,
            Key: s3ObjectKey,
            Expires: 60*1 // the Expires is capped for 1 minute
        });
        console.log(`Util.s3PreSignedUrl: ${s3ObjectKey} URL ${s3PreSignedUrl}`);
        return s3PreSignedUrl;
    
    },
    /**
     * Returns the Persistence Layer depending on hosting environment.
     * Alexa-Hosted Skill mode: use S3
     * Otherwise (assuming AWS mode): use DynamoDB
     * @param {*} tableName DynamoDB Table Name
     */
    getPersistenceAdapter(tableName) {
        // This function is an indirect way to detect if this is part of an Alexa-Hosted skill
        function isAlexaHosted() {
            return process.env.S3_PERSISTENCE_BUCKET;
        }
        if(isAlexaHosted()) {
            const {S3PersistenceAdapter} = require('ask-sdk-s3-persistence-adapter');
            return new S3PersistenceAdapter({ 
                bucketName: process.env.S3_PERSISTENCE_BUCKET
            });
        } else {
            // IMPORTANT: don't forget to give DynamoDB access to the role you're to run this lambda (IAM)
            const {DynamoDbPersistenceAdapter} = require('ask-sdk-dynamodb-persistence-adapter');
            return new DynamoDbPersistenceAdapter({ 
                tableName: tableName,
                createTable: true
            });
        }
    }
}