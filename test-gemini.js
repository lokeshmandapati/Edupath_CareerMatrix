const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=AIzaSyA-pObWRCPdTmuv4FqDiCp5Jt-ekGpA0bQ';

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'test' }] }] })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
