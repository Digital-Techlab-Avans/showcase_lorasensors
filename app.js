//@ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient

const config = require('./config')
const url = require('url')

const endpoint = config.endpoint
const key = config.key

const databaseId = config.database.id
const containerId = config.container.id

const options = {
      endpoint: endpoint,
      key: key,
      userAgentSuffix: 'CosmosDBJavascriptDemoLora'
    };

const client = new CosmosClient(options)

/**
 * Query the container using SQL
 */
async function queryContainer() {
  console.log(`Querying container:\n${config.container.id}`)

  const querySpec = {
    query: 'SELECT r.end_device_ids.device_id, r.uplink_message.decoded_payload.temperature,r.uplink_message.decoded_payload.humidity,r.received_at,r.uplink_message.decoded_payload.vdd as Voltage FROM root r WHERE r.received_at >= @fromtime and r.end_device_ids.device_id = @device_id',
     parameters: [
       {
         name: '@fromtime',
         value: '2022-06-10T08:16:11'
       },
       {
        name: '@device_id',
        value: 'og102'
      }
     ]
  }

  const { resources: results } = await client
    .database(databaseId)
    .container(containerId)
    .items.query(querySpec)
    .fetchAll()
  for (var queryResult of results) {
    let resultString = JSON.stringify(queryResult)
    console.log(`\tQuery returned ${resultString}\n`)
  }
}

/**
 * Exit the app with a prompt
 * @param {string} message - The message to display
 */
function exit(message) {
  console.log(message)
  console.log('Press any key to exit')
  process.stdin.setRawMode(true)
  process.stdin.resume()
  process.stdin.on('data', process.exit.bind(process, 0))
}

queryContainer()
  .then(() => {
    exit(`Completed successfully`)
  })
  .catch(error => {
    exit(`Completed with error ${JSON.stringify(error)}`)
  })
