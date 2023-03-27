import React,{useState} from 'react';
import { message, Input, Button, notification } from 'antd';
import { reqInput } from '../api';
import useLocalStorage from '../hooks/useLocalStorage';
import { FolderOutlined,FileOutlined } from '@ant-design/icons';

export const getJsonToTree = (data,highlights=[]) => {
  // 此处返回json结构
  // 在DirectoryTree使用时加【】
  let obj = {
    title: <div style={{
      display:'inline-block',
      whiteSpace:'nowrap',
      width:'100%',
      overflow:'hidden',
      textOverflow:'ellipsis',
      color:data&&highlights.includes(data.rel_path)?"red":"black"
    }}>{data.type==="folder"?<FolderOutlined />:<FileOutlined />}{" "+data.name}</div>,
    key: data.rel_path
  }
  // console.log(data, 'data');

  if (data.type === "folder") {
    obj['children'] = []
    data.folders.forEach(i => {
      obj.children.push(getJsonToTree(i,highlights))
    })
    data.files.forEach(i => {
      obj.children.push(getJsonToTree(i,highlights))
    })
  }else{
    obj['isLeaf']=true
    obj['icon']=<div></div>
  }
  if (obj.children && obj.children.length === 0) {
    delete obj.children
  }
  return obj
}

const InputDemo = (props) => {
  const [InputValue, setInputValue] = useLocalStorage("clonedir", "git@github.com:zhyAmber/FYP.git")
  const [content, setContent] = useState("")

  const handleGetInputValue = (event) => {
    setInputValue(event.target.value)
    //let Storagedata=JSON.parse(this.localStorage.getItem('result.data: '))
    //  console.log("Storagedata",Storagedata)
    // this.props.getTreeData(Storagedata.reponame,this.getData([Storagedata.foldertree]))
  };


  const getData = (data) => {
    return getJsonToTree(data)
  }

  const InputSubmit = async () => {
    console.log('传给后端的输入框数据value: ', InputValue);
    message.destroy()
    message.loading("Send Clone Request",0)
    reqInput(InputValue).then(result=>{
      console.log('clone result: ', result);
      //let Storagedata=this.state.Storagedata
      //let Storagedata=JSON.parse(localStorage.getItem('result.data: '))
      // console.log('Storagedata',Storagedata)
      if (result.status === 200) {
        message.destroy()
        notification.config({
          placement: 'topLeft',
          duration:3
        });
        notification.open({
          message: <div style={{color:'green'}}>Clone successfully</div>,
          description:(<div>
            <div>You have successfully cloned the repository:</div>
            <div style={{fontWeight:'bolder'}}>{result.data.reponame}</div>
            <div>id of current commit:</div>
            <div>{result.data.commitid}</div>
          </div>),
          onClick: () => {
            console.log('Notification Clicked!');
          },
        })
        localStorage.setItem('result.data: ', JSON.stringify(result.data))
        const foldertreejson = getData(result.data.foldertree)
        console.log("文档树结构2", foldertreejson)
        props.getTreeData(result.data.reponame, foldertreejson)
  
        // localStorage.setItem('result.data: ', JSON.stringify(result.data))
        //this.props.getTreeData(Storagedata.reponame,this.getData(Storagedata.foldertree))
        // setContent(result.data.foldertree.files)
        props.setCommitHis(result.data.logs)
      }
    }).catch((err)=>{
      message.destroy()
      message.error('Error when clone');
    })
    
    //console.log('localstorage',localStorage)
  };


  return (
    <div >
      <Input
        style={{ width: "50%" }}
        value={InputValue}
        onChange={handleGetInputValue}
      />
      <Button type="primary" onClick={InputSubmit}>Clone</Button>

      {/* <div>
          <input
          value={this.state.content}
          onChange={this.handleGetInputValue}
        />
        </div> */}


    </div>
  )

}

export default InputDemo;