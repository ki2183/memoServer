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
                    ]
                }
        ]},
    {
        timestamps: true
    }
);

memoSchema.statics.create = async function (payload) {
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
/////////////////////////////
memoSchema.statics.delByMemo = function(user_id, memo_id) {
    return this.findOneAndUpdate(
        {_id:user_id},
        { $pull:{ memos: {_id:memo_id} } },
        {new:true}
    )
};
/////////////////////////////
memoSchema.statics.findByMemos = function (userId, memoId){
    return this.find(
        {user_id:userId},
        {memos:{_id:memoId}}
    )
};

memoSchema.statics.pushByMemo = function (user_id,payload){
    return this.find(
        { _id:user_id},
        { $push: {memos: payload} },
        {new:true}
    )
};

memoSchema.statics.findByMemoList = function (_id){
    return this.findById(_id)
    .select('memos')
    .exec()
}
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

memoSchema.statics.loginMemos = async function (userId,password_){
    const userdto = await this.find({user_id:userId})
    const limit = await check_passwords(password_,userdto[0].password)

    if(userdto && limit){
        const user = userdto[0]        
        try{
            const token = jwt.sign({ userId:user.user_id },secret_key)
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