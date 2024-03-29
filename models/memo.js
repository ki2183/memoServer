const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()

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
                        url: { type: String, required: true },
                        idx: { type: Number, required: true },
                        sort: { type: String, required: true },
                        rate: { type: [String, Number], required: true },
                    }
                ]
            }
    ]}, {
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

memoSchema.statics.delByMemos = function (userId, memoId){
    return this.findOneAndUpdate(
        { user_id: userId },
        { $pull : { memos: { _id: memoId } } },
        { new: true }
    );
};

memoSchema.statics.findByMemos = function (userId, memoId){
    return this.find(
        {user_id:userId},
        {memos:{_id:memoId}}
    )
};

memoSchema.statics.loginMemos = async function (userId,password_){
    const userdto = await this.find({user_id:userId})
    const limit = await check_passwords(password_,userdto[0].password)

    if(userdto && limit){
        const user = userdto[0]        
        try{
            const token = jwt.sign({ userId:user.user_id }, process.env.secretKey)
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