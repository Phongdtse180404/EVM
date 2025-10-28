const fs = require("fs");

// Đọc font gốc (.ttf)
const font = fs.readFileSync("./src/assets/fonts/Roboto-Regular.ttf");

// Chuyển sang Base64
const base64 = font.toString("base64");

// Xuất ra file JS chứa chuỗi base64
fs.writeFileSync(
    "./src/assets/fonts/Roboto-Regular.js",
    `export const roboto = "${base64}";`
);

console.log(" Đã tạo file Roboto-Regular.js thành công!");
