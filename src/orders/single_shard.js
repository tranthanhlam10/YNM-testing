function getShardFromDate(dateStr) {
    // Parse date string to Date object
    const date = new Date(dateStr);
    
    // Get year
    const year = date.getFullYear();
    
    // Get first date of year
    const yearStart = new Date(date.getFullYear(), 0, 1);
    
    // Calculate days passed
    const days = Math.floor((date - yearStart) / (24 * 60 * 60 * 1000));
    
    // Calculate week number (adding 1 because weeks start from 1)
    const weekNumber = Math.ceil((days + yearStart.getDay() + 1) / 7);
    
    // Format week number to ensure it has 2 digits
    const formattedWeek = weekNumber.toString().padStart(2, '0');
    
    // Return combined year and week
    return `${year}${formattedWeek}`;
}

// Test
const date = "2024-09-29";
const shard = getShardFromDate(date);
console.log(shard); 



function checkRankChange(total_gmv, created_at, time_filter) {
    // Chuyển đổi các tham số thành Date để so sánh
    const createdDate = new Date(created_at);
    const filterDate = new Date(time_filter);
    
    // Nếu được tạo trong thời gian filter
    if (createdDate >= filterDate) {
        return "new";
    }
    
    // Nếu được tạo trước thời gian filter
    if (createdDate < filterDate) {
        // Trường hợp không có data ở khoảng thời gian trước đó
        if (total_gmv === 0 || total_gmv === null || total_gmv === undefined) {
            return "not_available";
        }
        
        // Trường hợp có data
        return "normal";
    }
    
    // Trường hợp mặc định
    return "not_available";
}

// Ví dụ sử dụng:
const testCases = [
    {
        total_gmv: 1000000,
        created_at: "2024-09-30",
        time_filter: "2024-09-29",
        expected: "new"
    },
    {
        total_gmv: 0,
        created_at: "2024-09-20",
        time_filter: "2024-09-29",
        expected: "not_available"
    },
    {
        total_gmv: 1000000,
        created_at: "2024-09-20",
        time_filter: "2024-09-29",
        expected: "normal"
    }
];

// Test
testCases.forEach((test, index) => {
    const result = checkRankChange(test.total_gmv, test.created_at, test.time_filter);
    console.log(`Test case ${index + 1}:`, result);
});