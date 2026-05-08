const url = 'https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyA-pObWRCPdTmuv4FqDiCp5Jt-ekGpA0bQ';
fetch(url)
  .then(res => res.json())
  .then(data => {
    if(data.models) {
      console.log(data.models.map(m => m.name).join('\n'));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  })
  .catch(console.error);
