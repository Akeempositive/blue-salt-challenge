const res = require('express/lib/response')
const { AssignerProtocol } = require('kafkajs')

const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'banking_db',
  password: 'mypassword',
  port: 5432,
})

const createTable = async (sql, columnDefinitions)=>{
    sql = sql + '( ' + columnDefinitions.join(', ') + ' )'
    new Promise((resolve, reject)=>{
        pool.query(sql,[], (error, result)=>{
            if(error){
                reject(error.toString().split("\\n"))
            }else {
                resolve(result.rows)
            }
        })
    })
}
const executeQuerry =async (sql, params)=>{
    new Promise((resolve, reject) =>{
        pool.query(sql, params, (error, result)=>{
            if(error){
                reject(error)
            }else {
                resolve(result.rows)
            }
        })
    })
}


const getUsersByUserId = async (userId) => {
    new Promise((resolve, reject) =>{
        pool.query('select * from users where id = $1', [userId], (error, result)=>{
            if(error){
                reject(error)
            }else {
                resolve(result.rows)
            }
        })
    })

}

const getUsersByUserName = (username)=>{
          new Promise(async (resolve, reject)=>{
                await pool.query('select * from users where username = $1', [username], (error, result)=>{
                    if(error){
                        reject(error)
                    }else {
                        console.log('onthisnow');
                      resolve(result);
                    }
                })
        });
}

module.exports = {
    getUsersByUserId,
    executeQuerry,
    getUsersByUserName,
    createTable
}