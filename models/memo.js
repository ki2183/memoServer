const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const secret_key = process.env.secretKey

const memoSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        name: { type: String, required: true },
        memos: [
            {
                    memo_id: { type: mongoose.Schema.Types.ObjectId, required: true, default: mongoose.Types.ObjectId },
                    title: { type: String, required: true },
                    text: [{ type: String }],
                    imgs: [
                        {
                            _id:false,
                            url: { type: String, required: true },
                            idx: { type: Number, required: true },
                            sort: { type: String, required: true },
                            rate: { type: [String, Number], required: true },
                        }
                    ],
                    createdAt: { type: Date, default: Date.now }
            }
        ]},
);

memoSchema.statics.createUser = async function (payload) {
    const memo = new this(payload);
    memo.password = await hash_pwd(payload.password)
    return memo.save();
}

memoSchema.statics.findAll = function () {
    return this.find({});
}

memoSchema.statics.userId_check = function(userId){
    return this.find({user_id:userId})
}

memoSchema.statics.updateByMemos = function (userId, payload){
    return this.findOneAndUpdate({ user_id: userId }, { $push: { memos: payload } }, { new: true })
}
////////////////////////  CRUD ////////////////////////////

memoSchema.statics.pushByMemo = function (user_id,payload){
    return this.findOneAndUpdate(
        { _id:user_id},
        { $push: {memos: payload} },
        {new:true}
    )
} //C

memoSchema.statics.findByMemoList = function (_id){
    return this.findById(_id)
    .select('memos')
    .exec()
} //R _list

memoSchema.statics.findByMemosLength = async function (_id){
    try{
        const result = await this.findById(_id).select('memos').exec()
        return result.memos.length
    }catch(err){
        return err
    }
}

memoSchema.statics.findByMemoList_test = async function(_id,page){
    const page_num = 5

    try{
        const result = await this.findById(_id).select('memos').exec()
        if (!result) {
            throw new Error("No memo list found for the given ID");
        }
        const result_reverse =  result.memos.reverse().slice(page*page_num,page*page_num+page_num)
        return result_reverse
    }catch{
        return result_reverse
    }
}

memoSchema.statics.findByMemo = function (user_id,memo_id){
    return this.findOne({
        _id:user_id,
        "memos._id":memo_id
    },{
        "memos.$":1
    })
    .exec()
} //R

memoSchema.statics.updateByMemo = async function(user_id,memo_id,payload){

    return this.findOneAndUpdate(
        {
            _id:user_id,
            "memos._id":memo_id
        },
        {
            $set:{
                'memos.$.title': payload.title,
                'memos.$.text': payload.text,
                'memos.$.imgs': payload.imgs
            } 
        },
        {
            new:true
        }
    )
} // U

memoSchema.statics.delByMemo = function(user_id, memo_id) {
    return this.findOneAndUpdate(
        {_id:user_id},
        { $pull:{ memos: {_id:memo_id} } },
        {new:true}
    )
} //D


memoSchema.statics.updateByMemo = async function(user_id,memo_id,payload){

    return this.findOneAndUpdate(
        {
            _id:user_id,
            "memos._id":memo_id
        },
        {
            $set:{
                'memos.$.title': payload.title,
                'memos.$.text': payload.text,
                'memos.$.imgs': payload.imgs
            }
        },
        {
            new:true
        }
    )
}
////////////////////////////////////////////////////
memoSchema.statics.loginMemos = async function (userId,password_){
    const userdto = await this.find({user_id:userId})
    const limit = await check_passwords(password_,userdto[0].password)

    if(userdto && limit){
        const user = userdto[0]        
        try{
            const token = jwt.sign({ userId:user.user_id },secret_key,{ expiresIn: '1h' })
            const dto = {
                token:token,
                _id:user._id.toString()
            }
            return(dto)
        }catch(err){
            console.log(err)
            return null
        }
    } 

    return null
}

memoSchema.statics.getUserInfo = function (_id){
    return this.find({_id:_id})
}

module.exports = mongoose.model('Memo', memoSchema)

const hash_pwd = (pwd) =>{
    return new Promise((resolve, reject) => {
        bcrypt.hash(pwd, 10, (err, hash) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

const check_passwords = (password, hashedPassword) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashedPassword, (err, result) => {
            if (err) {
                console.error('비밀번호 확인 오류:', err);
                reject(err);
            } else {
                resolve(result); // 일치하면 true, 불일치하면 false 반환
            }
        });
    });
};