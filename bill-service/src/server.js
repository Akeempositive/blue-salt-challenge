console.log(__dirname)
require('dotenv').config({path : __dirname + '/../.env'})
console.log(process.env.KAFKA_TOPIC_PROCESSING)
const kafka = require('./kafka')
const database = require('./db')
const db_bootstrap = require('./db/bootstrap-db')
const producer = kafka.producer({
  allowAutoTopicCreation: true
})
const consumer = kafka.consumer({
  groupId: 'service-id'
})
const express = require('express')
const app = express()
app.use(express.json())
const port = 3001

app.post('/transaction', (req, res) => {
  var transaction = req.body
    transaction = save(transaction)
    console.log('Another')
    console.log(transaction)
})

var save = async (transaction) =>{
  await database.getUsersByUserName(`${transaction.username}`)
  .then(data => {
    user = data[0]
  }).error(error => console.log(error))
  console.log(user)
  console.log(user + ' this is ')
  if(user == null){
    user = {accountNumber: '1234567890', amount:1000}
  }else {
    console.log('You are doing well')
  }
  transaction.initiatingAccountNumber = user.accountNumber;
  transaction.transactionType = 'FUND-ACCOUNT'
  var date = new Date()
  transaction.narration=  `${transaction.transactionType} with ${transaction.amount} by ${transaction.username} by ${new Date().toDateString()}`
  transaction.status = 'pending'
  transaction.transactionId =''+date.getTime()
  await database.executeQuerry('insert into transactions (transaction_id, transaction_type,initiating_account_number, amount, narration, status, created) values ($1, $2, $3, $4, $5, $6, $7)', 
  [transaction.transactionId, transaction.transactionType, user.accountNumber,transaction.amount, transaction.narration, transaction.status, new Date()])
  producer.send({
    topic: process.env.KAFKA_TOPIC_PROCESSING,
    messages : [{value: JSON.stringify(transaction), key: transaction.transactionId}]
  })
  return transaction;
}

app.listen(port, async () => {
  await consumer.connect()
  await producer.connect()
  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC_SUCCESS,
    fromBeginning: false
  })
  var i=0;
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      var transaction = JSON.parse(message.value.toString())
      database.executeQuerry('update transactions set status = $1 where transaction_id = $2', ['success',transaction] )
      console.log('updated successfully');
    }
  })
  if(process.env.FIRST_TIME === 'true'){
    db_bootstrap.runFirstTimeDbScript()
  }else {
    console.log('Not bootstrapping db');
  }
  console.log(`Bill Service running on port ${port}`)
})