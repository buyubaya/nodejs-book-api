// // FIREBASE & GOOGLE CLOUD
const Storage = require('@google-cloud/storage');
const storage = Storage({
    projectId: 'nodejs-book-api',
    keyFilename: './firebase/serviceAccountKey.json'
});
const CLOUD_BUCKET = 'nodejs-book-api.appspot.com';
const bucket = storage.bucket(CLOUD_BUCKET);
const uuid = require("uuid");


const uploadImageToStorage = (file) => {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject('No image file');
        }

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
            function(err, data) {
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

        // bucket.file(file.path).getSignedUrl({
        //     action: 'read',
        //     expires: '03-09-2491'
        // })
        // .then(signedUrls => {
        //     // signedUrls[0] contains the file's public URL
        //     resolve(signedUrls)
        // })
        // .catch(err => reject(err));
    });
};


module.exports = uploadImageToStorage;