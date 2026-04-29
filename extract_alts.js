const fs = require('fs');
const html = fs.readFileSync('./special events html/Special_Events_Page_V1_9_.html','utf8');
const matches = html.match(/alt="([^"]+)"/g);
if(matches) matches.forEach(m => console.log(m));
