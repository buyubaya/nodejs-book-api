exports.findRelativeChildren = function findRelativeChildren(data, _id, arr=[]){
    arr.push(_id);
    for(let i=0,len=data.length; i<len; i++){
        if(data[i].parent_id && data[i].parent_id.toString() === _id){
            arr.push(data[i]._id);
            arr = findRelativeChildren(data, data[i]._id, arr);
        }
    }
    return arr;
};

exports.findDeepest = function findDeepest(data){
    let parentList = [];
    for(let i=0,len=data.length; i<len; i++){
        if(data[i].parent_id){
            parentList.push(data[i].parent_id);
        }
    }
    const arr = data.filter(item => !parentList.includes(item._id));
    return arr;
};