const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const WebDavHost = 'your webdav host';
const {
    createClient
} = require("@asun01/webdav");
// 设置一个路由，当访问'/'时，返回'Hello World!'
app.get('/', (req, res) => {
    res.send('Hello World!');
    let client = createClient(WebDavHost, {
        username: "",
        password: ""
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
