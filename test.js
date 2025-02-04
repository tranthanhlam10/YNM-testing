function getWeekShards(dateString) {
    // Chuyển đổi chuỗi ngày thành đối tượng Date
    const date = new Date(dateString);
    
    // Tìm số thứ tự của ngày trong tuần (0-6, với 0 là Chủ nhật)
    const dayOfWeek = date.getDay();
    
    // Tính toán ngày đầu tuần (Chủ nhật của tuần hiện tại)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    // Tính toán ngày cuối tuần (Thứ bảy của tuần hiện tại)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    // Hàm để lấy tuần của năm
    function getWeekNumber(d) {
        // Sao chép ngày
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        
        // Tìm ngày đầu tiên của năm
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        
        // Tính toán số tuần
        const weekNumber = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
        
        return weekNumber;
    }
    
    // Tìm tuần của năm
    const weekNumber = getWeekNumber(date);
    
    // Tạo shard
    const shard = `${date.getFullYear()}${weekNumber.toString().padStart(2, '0')}`;
    
    // Trả về shard và ngày bắt đầu/kết thúc tuần
    return {
        shard: shard,
        startOfWeek: startOfWeek.toISOString().split('T')[0],
        endOfWeek: endOfWeek.toISOString().split('T')[0]
    };
}

// Ví dụ sử dụng
const dateStr = "2024-07-14";
const result = getWeekShards(dateStr);
console.log(result);
