import table from './table';

const itemsSchema = {
    TableName: 'items',
    AttributeDefinitions: [
        {
            'AttributeName': 'itemName',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'itemRank',
            'AttributeType': 'N'
        }
    ],
    KeySchema: [
        {
            AttributeName: 'itemName',
            KeyType: 'HASH'
        },
        {
            AttributeName: 'itemRank',
            KeyType: 'RANGE'
        }
    ],
    GlobalSecondaryIndexes: [
        {
            IndexName: 'byItemName',
            KeySchema: [ /* required */
                {
                    AttributeName: 'itemName',
                    KeyType: 'HASH'
                },
                {
                    AttributeName: 'itemRank',
                    KeyType: 'RANGE'
                }
            ],
            Projection: {
                ProjectionType: 'ALL'
            },
            ProvisionedThroughput: {
                ReadCapacityUnits: 1,
                WriteCapacityUnits: 1
            }
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    }
};

const itemsTable = table(itemsSchema);

export default {
    ...itemsTable,
    getByName(itemName) {
        return itemsTable.query({
            KeyConditions: {
                itemName: {
                    ComparisonOperator: 'EQ',
                    AttributeValueList: [itemName]
                }
            },
            IndexName: 'byItemName'
        });
    },
    getByRank(itemRank) {
        return itemsTable.query({
            KeyConditions: {
                itemRank: {
                    ComparisonOperator: 'GE',
                    AttributeValueList: [itemRank]
                }
            },
            IndexName: 'byItemName'
        })
    }
};