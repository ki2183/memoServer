const router = require('express').Router()
const Memo = require('../models/memo')
const jwt = require('jsonwebtoken')

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

router.get('/test',(req,res)=>{
    const test = "test"
    res.send(test)
})

router.post('/tokenTest',(req,res) => {
    const token = jwt.sign({ userId:"test" }, 'secret_key');
    res.json({ token });
})

router.get('login',(req,res)=>{
    const {userID,password} = req.body

})

router.post('/checkId',(req,res)=>{
    const {userId} = req.body
    console.log(req.body)
    Memo.userId_check(req.body.userId)
    .then(userId => res.send(!(userId.length > 0)))
    .catch(err => res.send(true));
}) // 아이디가 있으면 false 없으면 true


module.exports = router;

