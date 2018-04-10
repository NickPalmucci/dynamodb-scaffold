import '../.env';
import {DynamoDB} from 'aws-sdk';

const dynamoConfig = {
    apiVersion: '2012-08-10',
    region: process.env.SERVERLESS_REGION
};

if (process.env.IS_OFFLINE) {
    dynamoConfig.endpoint = process.env.LOCAL_DDB_ENDPOINT;
}

const service = new DynamoDB(dynamoConfig);
const docClient = new DynamoDB.DocumentClient({service});

export default async (method, params) => {
    return await docClient[method](params)
}