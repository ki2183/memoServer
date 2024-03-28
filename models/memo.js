const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

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
memoSchema.statics.loginMemos = function (userId,password){

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