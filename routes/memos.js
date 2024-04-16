const router = require('express').Router()
const { errorMonitor } = require('stream')
const Memo = require('../models/memo')
const jwt = require('jsonwebtoken')
const memo = require('../models/memo')
require('dotenv').config()

const secret_key = process.env.secretKey

////////////////////////user//////////////////////////////
router.get('/test',(req,res)=>{
    res.json('testx')
})

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
    secureRouteWithTimeout(res,Memo.findByMemo(user_id,memo_id),token,10000)
   
}) //R_byOne

router.post('/updateMemo',(req,res)=>{
    const {user_id,memo_id,memo,token} = req.body
    secureRouteWithTimeout(res,Memo.updateByMemo(user_id,memo_id,memo),token,10000)
}) //U

router.post('/delMemo',(req,res)=>{
    const {user_id,memo_id,token} = req.body
    secureRouteWithTimeout(res,Memo.delByMemo(user_id,memo_id),token,10000)
}) //D

router.post('/getPageLength',(req,res)=>{
    const {_id,token} = req.body
    secureRouteWithTimeout(res,Memo.findByMemosLength(_id),token,10000)
})
router.post('/listPaging/:page',(req,res)=>{
    const {_id} = req.body
    const page = req.params.page
    Memo.findByMemoList_test(_id,page)
        .then(result => res.json(result))
        .catch(err => res.json(false))
})
///////////////////////token fnc////////////////////////

router.post('/checkToken',(req,res)=>{
    const {_id,token} = req.body 
    validateToken(token)
        .then(result => console.log(result))
        .catch(err => console.log(false))

    return res.send('')
    // const timeLimitPromise = new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         reject(new Error('Request timeout'));
    //     }, 3000);
    // });

    // const verifyTokenPromise = new Promise((resolve, reject) => {
    //     verifyToken(token, secret_key)
    //         .then(decodedToken => {
    //             resolve(true);
    //         })
    //         .catch(err => {
    //             reject(false);
    //         });
    // });

    // Promise.race([verifyTokenPromise, timeLimitPromise])
    //     .catch(err => {
    //         res.send(false);
    // });

    
    
})

module.exports = router;

function validateToken(token){
    try {
        jwt.parserBuilder().setSigningKey(secret_key).build().parseClaimsJws(token)
        return true
    } catch (en) {
        // 토큰 파싱에 실패하면 false를 반환합니다.
        return false
    }
}

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
