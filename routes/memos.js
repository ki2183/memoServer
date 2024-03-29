const router = require('express').Router()
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

router.post('/newUser',(req,res)=>{
    Memo.create(req.body)
        .then(memo => res.send(memo))
        .catch(err => res.status(500).send(err))
})


router.post('/inputMemo/:userId',(req,res)=>{
    const userId = req.params.userId;
    
    Memo.updateByMemos(userId,req.body)
        .then(memo => res.send(memo))
        .catch(err => res.status(500).send(err));
})

router.post('/delMemo',(req,res)=>{
    const {userId,memoId} = req.body;
   
    Memo.delByMemos(userId,memoId)
        .then(memo => res.send(memo))
        .catch(err => res.status(500).send(err));
})

router.post('/findMemo',(req,res)=>{
    const {userId,memoId} = req.body;
   
    Memo.findByMemos(userId,memoId)
        .then(memo => res.send(memo))
        .catch(err => res.status(500).send(err));
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

    // Memo.getUserInfo(_id)
    // .then(userInfo => {
    //     delete userInfo.password
    //     res.send(userInfo)
    // })
    // .catch(err=> res.send('정보를 찾을 수가 없음'))
})

router.get('/test',(req,res)=>{
    const test = "test"
    res.send(test)
})

router.post('/tokenTest',(req,res) => {
    const token = jwt.sign({ userId:"test" }, 'secret_key');
    res.json({ token });
})

router.post('/login',(req,res)=>{
    const {userId,password} = req.body
    console.log(password,userId)
    Memo.loginMemos(userId,password)
    .then(info => res.json(info))
    .catch(err => res.status(500).send(err))
}) // 토큰 아이디 줌

router.post('/checkId',(req,res)=>{
    const {userId} = req.body
    console.log(req.body)
    Memo.userId_check(req.body.userId)
    .then(userId => res.send(!(userId.length > 0)))
    .catch(err => res.send(true));
}) // 아이디가 있으면 false 없으면 true


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