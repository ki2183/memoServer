const router = require('express').Router()
const { errorMonitor } = require('stream')
const Memo = require('../models/memo')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const secret_key = process.env.secretKey

router.get('/',(req,res)=>{
    Memo.findAll()
    .then((memos)=>{
        if(!memos.length) return res.status(404).send({err:"users not found"})
        res.send(memos)
    })
    .catch(err => res.status(500).send(err))
})


router.post('/getUserInfo',(req,res)=>{
    const {_id,token} = req.body
    console.log(token)
    console.log(secret_key)
    verifyToken(token,secret_key).
    then(decodedToken=>{
        console.log('유효한')
        res.send('유효한')
    })
    .catch(err => {
        console.log(err)
        res.send('어려운')
    })
})

////////////////////////user//////////////////////////////

router.post('/join',(req,res)=>{
    Memo.createUser(req.body)
        .then(memo => res.send(memo))
        .catch(err => res.status(500).send(err))
})

router.post('/login',(req,res)=>{
    const {userId,password} = req.body

    Memo.loginMemos(userId,password)
    .then(info => res.json(info))
    .catch(err => res.status(500).send(err))
}) // 토큰 아이디 줌

router.post('/checkId',(req,res)=>{
    const {userId} = req.body

    Memo.userId_check(userId)
    .then(userId => res.send(!(userId.length > 0)))
    .catch(err => res.send(true));
}) // 아이디가 있으면 false 없으면 true

///////////////////////token router////////////////////////

router.post('/pushMemo',(req,res)=>{
    const {user_id,token,memo} = req.body
    secureRouteWithTimeout(res,Memo.pushByMemo(user_id,memo),token,10000)
}) //C

router.post('/MemoList',(req,res)=>{
    const {_id,token} = req.body
    const user_id = _id
    secureRouteWithTimeout(res,Memo.findByMemoList(user_id),token,10000)
}) //R _list

router.post('/viewMemo',(req,res)=>{
    const {user_id,memo_id,token} = req.body

    Memo.findByMemo(user_id,memo_id)
        .then(result => res.send(result))
        .catch(err => res.send(errorMonitor))
   
}) //R_byOne

router.post('/updateMemo',(req,res)=>{
    const {user_id,memo_id,memo,token} = req.body
    secureRouteWithTimeout(res,Memo.updateByMemo(user_id,memo_id,memo),token,10000)
}) //U

router.post('/delMemo',(req,res)=>{
    const {user_id,memo_id,token} = req.body
    secureRouteWithTimeout(res,Memo.delByMemo(user_id,memo_id),token,10000)
}) //D

///////////////////////token fnc////////////////////////

module.exports = router;

function verifyToken(token, secretKey) { //토큰 유효성 검사
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) { 
            } else {
                resolve(decoded);
            }
        });
    });
}
function secureRouteWithTimeout(res, router_FCN, token, requestTimeout) {
    const verifyTokenPromise = new Promise((resolve, reject) => {
        verifyToken(token, secret_key)
            .then(decodedToken => {
                resolve(decodedToken);
            })
            .catch(err => {
                reject(err);
            });
    });

    const timeLimitPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Request timeout'));
        }, requestTimeout);
    });

    Promise.all([verifyTokenPromise, router_FCN])
        .then(([decodedToken, result]) => {
            res.json(result);
        })
        .catch(err => {
            res.status(500).send(err);
        });

    Promise.race([verifyTokenPromise, timeLimitPromise])
        .catch(err => {
            res.status(500).send(err);
        });
}
