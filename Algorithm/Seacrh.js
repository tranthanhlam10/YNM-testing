// Tìm phần tử thứ 2 trong mảng

/**Input: [1, 2, 3, 4, 5], 
 * Tìm max là bao nhiêu
 * Số thứ 2 của max nó phải bé hơn max
 * Và nó lớn hơn các phần tử còn lại 
 * Xác định được số nào là số cố định, số nào là biến chạy 
 * 
 * 
 * 
 * 
 *Output: Second max  */ 


function findMax(arr){
    let max = 0;

    for(let i = 0;i < arr.length; i++){
        if(arr[i] > max){
            max = arr[i];
        } 
    }
    return max;
}

const arr = [9, 2, 40, 1200, -5, 1200];
console.log(findMax(arr)); 


// Phải hiểu ở đây arr[i] mới là số chạy
function findSecondMax(arr){
    const max = findMax(arr);
    let secondMax = 0;  
    for(let i = 0; i < arr.length ; i++){
        if(arr[i] > secondMax &&  arr[i] < max){
                secondMax = arr[i];
            }
    }
    return secondMax;
}


console.log(findSecondMax(arr)); 