import dynamo from './dynamodb';

export function ensureTable(schema) {
    return dynamo('describeTable', {TableName: schema.TableName})
        .catch(() => dynamo('createTable', schema))
        .catch(error => {
            return error.code === 'ResourceInUseException' ? Promise.resolve() : Promise.reject(error);
        });
}

function fixPrototypes(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function create(TableName, item, options = {}) {
    // DocumentClient doesn't handle objects created with Object.create(null)
    const fixed = fixPrototypes(item);

    return dynamo('put', {TableName, Item: item, ...options}).then(() => item);
}

export function get(TableName, Key, options = {}) {
    return dynamo('get', {TableName, Key, ...options}).then(reply => reply.Item);
}

export function scan(TableName, options = {}) {
    return dynamo('scan', {TableName, ...options});
}

export function query(TableName, options = {}) {
    return dynamo('query', {TableName, ...options});
}

export function batchWrite(TableName, Requests) {
    const params = {
        RequestItems: {
            [TableName]: Requests
        }
    };

    return dynamo('batchWrite', params);
}

export function remove(TableName, Key, options) {
    return dynamo('delete', {
        TableName,
        Key,
        ReturnValues: 'NONE',
        ...options
    }).then(() => true, () => false);
}

function getWrapKeys(schema) {
    const hashOnly = schema.KeySchema.length === 1;

    if (hashOnly) {
        const hashKey = schema.KeySchema[0].AttributeName;
        const wrapKey = key => (typeof key === 'object' ? key : {[hashKey]: key});
        return key => Array.isArray(key) ? key.map(wrapKey) : wrapKey(key);
    }

    return key => key;
}

export default function table(dynamoSchema, timestamps = true) {
    const tableName = dynamoSchema.TableName;
    const wrapKeys = getWrapKeys(dynamoSchema);

    return {
        tableName,
        ensureTable: ensureTable.bind(null, {...dynamoSchema, TableName: tableName}),
        create(obj, options) {
            const item = {...obj};

            if (timestamps) {
                const now = Date.now();
                if (!item.created) {
                    item.created = now;
                }

                if (!item.updated) {
                    item.updated = now;
                }
            }

            return create(tableName, item, options);
        },
        scan: scan.bind(null, tableName),
        query: query.bind(null, tableName),
        get(key, options) {
            return get(tableName, wrapKeys(key), options);
        },
        batchWrite(requests, options) {
            return batchWrite(tableName, requests, options)
        },
        remove(key, options) {
            return remove(tableName, wrapKeys(key), options);
        }
    };
}
