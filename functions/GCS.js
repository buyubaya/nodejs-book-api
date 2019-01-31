// // FIREBASE & GOOGLE CLOUD
const Storage = require('@google-cloud/storage');
const storage = Storage({
    projectId: 'nodejs-book-api',
    keyFilename: './firebase/serviceAccountKey.json'
});
const CLOUD_BUCKET = 'nodejs-book-api.appspot.com';
const bucket = storage.bucket(CLOUD_BUCKET);
const uuid = require("uuid");


exports.uploadFile = function(file){
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No image file');
        }

        // ADD NEW IMAGE
        const downloadToken = uuid();
        bucket.upload(
            file.path,
            {
                destination: file.filename,
                metadata: {
                    contentType: file.mimetype,
                    metadata: {
                        firebaseStorageDownloadTokens: downloadToken
                    }
                }
            },
            function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    let img = data[0];
                    img = "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.filename) + "?alt=media&token=" + downloadToken;
                    resolve(img);
                }
            }
        );
    });
};


// DELETE IMAGE
exports.deleteFile = async function(filename) {
    const file = await storage.bucket(CLOUD_BUCKET).file(filename);
    if(file){
        file.delete();
    }
}