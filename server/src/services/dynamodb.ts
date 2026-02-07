import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'devzone-users';
const VERSIONS_TABLE = process.env.DYNAMODB_VERSIONS_TABLE || 'devzone-versions';

export async function getUserByEmail(email: string) {
  const res = await ddb.send(new ScanCommand({
    TableName: USERS_TABLE,
    FilterExpression: 'email = :e',
    ExpressionAttributeValues: { ':e': email },
  }));
  return res.Items?.[0] || null;
}

export async function getUserById(userId: string) {
  const res = await ddb.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId },
  }));
  return res.Item || null;
}

export async function createUser(user: { userId: string; email: string; passwordHash: string; role: string; createdAt: string }) {
  await ddb.send(new PutCommand({ TableName: USERS_TABLE, Item: user }));
}

export async function listUsers() {
  const res = await ddb.send(new ScanCommand({ TableName: USERS_TABLE }));
  return (res.Items || []).map(({ passwordHash, ...u }) => u);
}

export async function createVersion(version: { versionId: string; timestamp: string; author: string; description: string; isLive: boolean }) {
  await ddb.send(new PutCommand({ TableName: VERSIONS_TABLE, Item: version }));
}

export async function getVersion(versionId: string) {
  const res = await ddb.send(new GetCommand({
    TableName: VERSIONS_TABLE,
    Key: { versionId },
  }));
  return res.Item || null;
}

export async function listVersions() {
  const res = await ddb.send(new ScanCommand({ TableName: VERSIONS_TABLE }));
  return (res.Items || []).sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
}

export async function setVersionLive(versionId: string) {
  const versions = await listVersions();
  for (const v of versions) {
    if (v.isLive) {
      await ddb.send(new UpdateCommand({
        TableName: VERSIONS_TABLE,
        Key: { versionId: v.versionId },
        UpdateExpression: 'SET isLive = :f',
        ExpressionAttributeValues: { ':f': false },
      }));
    }
  }
  await ddb.send(new UpdateCommand({
    TableName: VERSIONS_TABLE,
    Key: { versionId },
    UpdateExpression: 'SET isLive = :t',
    ExpressionAttributeValues: { ':t': true },
  }));
}
