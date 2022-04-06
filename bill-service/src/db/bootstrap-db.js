var database = require('./index')
var runFirstTimeDbScript = async  () =>{
    database.createTable('create table users ', [
      'ID SERIAL PRIMARY KEY',
      'name VARCHAR(30)',
      'username VARCHAR(30)',
      'email VARCHAR(70)',
      'account_number VARCHAR(10)',
      'account_status VARCHAR(20)',
      'created DATE NOT NULL',
      'CONSTRAINT unique_email UNIQUE(email)',
      'CONSTRAINT unique_username UNIQUE(username)',
      'CONSTRAINT unique_account_number UNIQUE(account_number)'
    ])
    database.createTable('create table transactions ', [
      'ID SERIAL PRIMARY KEY',
      'transaction_type VARCHAR(30)',
      'initiating_account_number VARCHAR(10)',
      'amount numeric(10, 2)',
      'narration VARCHAR(100)',
      'status varchar(20)',
      'created DATE not null',
      'transaction_id varchar(50) not null',
      'CONSTRAINT unique_tran_id UNIQUE(transaction_id)',
      'CONSTRAINT fk_account_number FOREIGN KEY(initiating_account_number) REFERENCES users(account_number)'
    ])
    if(checkUserNotExists('bot-user')){
      await database.executeQuerry('INSERT INTO users (name, username, email, account_number, account_status, created) VALUES ($1, $2, $3, $4, $5, $6)', ['Bot User','bot-user', 'bot-user@app.com', '1234567890', 'OPENED', new Date()]);
    }else {
      console.log('user exists by username');
    }
  }
  
  var checkUserNotExists = async (username)=> {
     var rowCount = await database.getUsersByUserName(username)
     console.log('rowCount==> ' + rowCount)
    return rowCount === 0
  }

  module.exports = {
      runFirstTimeDbScript
  }