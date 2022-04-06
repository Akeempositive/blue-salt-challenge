require('dotenv').config({path : __dirname + '/../.env'})
const createHookReceiver = require('npm-hook-receiver')
const kafka = require('./kafka')
const express = require('express')
const app = express()
app.use(express.json())
const port = 3002
const producer = kafka.producer({
  allowAutoTopicCreation: true
})
const consumer = kafka.consumer({
  groupId: 'worker-id'
})

app.listen(port, async () => {
   await consumer.connect()
     await producer.connect()
     await consumer.subscribe({
     topic: 'transaction-processing',
     fromBeginning: true
   })
   var i=0;
   await consumer.run({
     eachMessage: async ({ topic, partition, message }) => {
       console.log('Thank God' + i++)
       var transaction = JSON.parse(message.value.toString())
       setTimeout(()=>applyCharge(transaction), 100)
       producer.send({
         topic: 'transaction-completed',
         messages : [{key: transaction.transactionId, value: transaction.transactionId}]
       })
     }
   })
     console.log(`Server Worker listening on port ${process.env.PORT || 3002}`)
   })

   var applyCharge = (transaction)=> {
     console.log('I m charging transaction as a debit here to credit company account');
   }