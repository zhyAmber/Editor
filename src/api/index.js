import instance from './ajax';
import qs from 'qs'



//传递输入框内git网址
export const reqInput = msg => {
  const data=qs.stringify({
    'repodir': msg
  })
  return instance({
    method: 'post',
    url: '/repo/clone',
   data : data
  });
};

// export const getTreeData = params => {
//   const data=qs.stringify(params)
//   return instance({
//     //url: '/reqcontent',
//     url: '/repo/clone',
//     method: 'POST',
//     data:data
//   });
// };

//点击某个文件后获取文件内容
export const getFile = params => {
  const data=qs.stringify(params)
  return instance({
    //url: '/reqcontent',
    url: '/get/file',
    method: 'POST',
    data:data
  });
};

//submit编辑框内容
// export const reqcontent = params => {
//   const data=qs.stringify(params)
//   return instance({
//     //url: '/reqcontent',
//     url: '/write/file',
//     method: 'POST',
//     data: data
//   });
// };


// export const reqcontent =(file_content,file_rel_path,reponame) => {
//   var FormData = require('form-data');
//   const fileContent = Buffer.from(""+file_content)
//   var data = new FormData();
//   data.append('data');
//   data.append('reponame', reponame);
//   data.append('file_rel_path', file_rel_path);
//   data.append('file_content', fileContent,{
//   filename:'abc.txt',
//  contentType: 'text/plain',
//  knownLength: fileContent.byteLength
// });

//   return instance({
//     //url: '/reqcontent',
//     url: '/write/file',
//     headers: {
//       // 必须要把 Content-Type 改为 multipart/form-data
//       'Content-Type': 'multipart/form-data'
//     },
//     method: 'POST',
//     data: data
//   });
// };

export const reqcontent =params => {
  console.log(params)
  const file_content=params["file_content"];
  const reponame=params["reponame"];
  const file_rel_path=params["file_rel_path"];
  console.log('接口里的编辑框数据file_content: ', file_content);
  console.log('接口里的编辑框数据reponame: ', reponame);
  console.log('接口里的编辑框数据rel_path: ', file_rel_path);
  const fileContent = new File([file_content],'fileToUpload.html', { type: '' })
  var data = new FormData();
  var myHeaders = new Headers();
	myHeaders.append("User-Agent", "Apifox/1.0.0 (https://www.apifox.cn)");
  data.append('reponame', reponame);
  data.append('file_rel_path', file_rel_path);
  data.append('file_content', fileContent);
	console.log(data)
  return instance({
    //url: '/write/file',
    url: '/commit/file',
    headers: myHeaders,
    method: 'POST',
    data: data
  });
};

export const pushcontent = params => {
    const data=qs.stringify(params)
    // var myHeaders = new Headers();
	  // myHeaders.append("User-Agent", "Apifox/1.0.0 (https://www.apifox.cn)");
    return instance({
      url: '/git/push',
      // headers: myHeaders,
      method: 'POST',
      data: data
    });
  };

  
export const pullcontent = params => {
  const data=qs.stringify(params)
  // var myHeaders = new Headers();
  // myHeaders.append("User-Agent", "Apifox/1.0.0 (https://www.apifox.cn)");
  return instance({
    url: '/git/pull',
    // headers: myHeaders,
    method: 'POST',
    data: data
  });
}



