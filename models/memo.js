const mongoose = require('mongoose')

const memoSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    memos: [
        {
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
    ]
}, {
    timestamps: true
});

memoSchema.statics.create = function (payload) {
    const memo = new this(payload);
    return memo.save();
};

memoSchema.statics.findAll = function () {
    return this.find({});
};

module.exports = mongoose.model('Memo', memoSchema);