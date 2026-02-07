/**
 * Create initial admin user in DynamoDB.
 * Run: npx tsx scripts/seed-db.ts [email] [password]
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);

async function seed() {
  const email = process.argv[2] || 'admin@tarot.dev';
  const password = process.argv[3] || 'admin123';
  const table = process.env.DYNAMODB_USERS_TABLE || 'devzone-users';

  const passwordHash = await bcrypt.hash(password, 10);

  await ddb.send(new PutCommand({
    TableName: table,
    Item: {
      userId: 'admin-001',
      email,
      passwordHash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  }));

  console.log(`Created admin user: ${email} (password: ${password})`);
  console.log(`Table: ${table}`);
}

seed().catch(console.error);
