import Hapi from 'hapi';
import itemsTable from './db/items';

const sampleItem = {
    itemName: 'New Item',
    itemRank: 1
};

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/ensure-table',
    handler: async (request, h) => {

        return await itemsTable.ensureTable();
    }
});

server.route({
    method: 'GET',
    path: '/add-item/{item?}',
    handler: async (request, h) => {
        const item = request.params.item || sampleItem;

        return await itemsTable.create(item);
    }
});

server.route({
    method: 'GET',
    path: '/get-item/{name?}',
    handler: async (request, h) => {

        return await itemsTable.getByName(request.params.name);
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

