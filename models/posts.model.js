module.exports = mongoose => {
    const Posts = mongoose.model(
        "posts",
        mongoose.Schema({
            ownerID: {
                type: String
            },
            name: {
                type: String,
                default: "My post!"
            },
            private: {
                type: Boolean,
                default: false
            },
            description: {
                type: String,
                default: "This is my memory!"
            },
            diaryID: {
                type: mongoose.ObjectId,
                required: true
            },
            likes: [mongoose.ObjectId],
            comments: [mongoose.ObjectId],
            picture: {
                type: String
            }
        }, {
            timestamps: true
        })
    );

    return Posts;
};