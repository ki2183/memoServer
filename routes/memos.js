const router = require('express').Router()
const Memo = require('../models/memo')

router.get('/users',(req,res)=>{
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

module.exports = router;