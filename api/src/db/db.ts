import * as AWS from 'aws-sdk';

const db = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

export const get = async <T>(args: {
  table: string;
  keyName: string;
  keyValue: string;
}): Promise<T | undefined> => {
  const { table, keyName, keyValue } = args;
  let params = {
    TableName: table,
    Key: {
      [keyName]: AWS.DynamoDB.Converter.input(keyValue),
    },
  };

  const item = await db.getItem(params).promise();

  const responseData = item.$response.data
    ? item.$response.data.Item
    : undefined;

  return responseData
    ? (AWS.DynamoDB.Converter.unmarshall(responseData) as T)
    : undefined;
};

export const put = async <T>(args: {
  table: string;
  object: T;
}): Promise<T> => {
  const { table, object } = args;
  let params = {
    TableName: table,
    ReturnConsumedCapacity: 'TOTAL',
    Item: AWS.DynamoDB.Converter.marshall(object),
  };

  const item = await db.putItem(params).promise();

  return item.$response.data as T;
};
