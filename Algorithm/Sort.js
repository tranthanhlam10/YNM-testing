// Selection sort 

/*
 * 1. Tìm phần tử nhỏ nhất trong mảng
 * 2. Đưa nó về đầu mảng
 * 3. Lặp lại bước 1 và 2 với phần còn lại của mảng -> Chỗ này còn phải phân giải ra nhiều lắm
 * 
 * 
 * 
 * Input: Array
 * Output: SORT ASC
 * 
 * Mình sẽ chia thành 2 phần, chia mảng ra thành phần đã sắp xếp và phần chưa sawxp xếp
 * Phần đã sắp xếp thì mình sẽ không động vào nữa
 * Phần chưa sắp xếp thì mình sẽ tìm phần tử nhỏ nhất trong mảng
 * Sau đó push vào giá trị sau của mảng đã sắp xếp
 * 
 * 
 */

function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
      let minIndex = i;
      
      // Find minimum element in the unsorted part
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }
      }
      
      // Swap the found minimum element with the first element
      // This should be OUTSIDE the inner loop
      let temp = arr[i];
      arr[i] = arr[minIndex];
      arr[minIndex] = temp;
    }
    
    return arr;
  }
  
  // Example usage
  const arr = [64, 25, 12, 22, 11];
  console.log(selectionSort(arr)); // [11, 12, 22, 25, 64]



// Bubble sort 
    /*
    * 1. So sánh 2 phần tử liên tiếp
    * 2. Nếu phần tử đầu lớn hơn thì đổi chỗ
    * 3. Lặp lại cho đến khi không còn phần tử nào lớn hơn -> Cách implement cũng giống giống như selection sort
    * 
    * 
    * Input: Array
    * Output: SORT ASC
    * 
    * 
    */
function bubbleSort(arr){
    for(let i = 0 ; i < arr.length-1; i++){
        for(let j = 0; j < arr.length - i -1; j ++){
            if(arr[j] > arr[j+1]){
                let temp= arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = temp;    
            }
        }
    }
    return arr;
}
const arr1 = [64, 25, 12, 22, 11];
console.log(bubbleSort(arr1)); 

