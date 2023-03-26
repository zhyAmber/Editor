import React,{useState} from 'react';
import { message, Input, Button, notification } from 'antd';
import { reqInput } from '../api';
import useLocalStorage from '../hooks/useLocalStorage';
import { FolderOutlined,FileOutlined } from '@ant-design/icons';

export const getJsonToTree = (data) => {
  // 此处返回json结构
  // 在DirectoryTree使用时加【】
  let obj = {
    title: <div style={{
      display:'inline-block',
      whiteSpace:'nowrap',
      overflow:'hidden',
      textOverflow:'ellipsis'
    }}>{data.type==="folder"?<FolderOutlined />:<FileOutlined />}{" "+data.name}</div>,
    key: data.rel_path
  }
  // console.log(data, 'data');

  if (data.type === "folder") {
    obj['children'] = []
    data.folders.forEach(i => {
      obj.children.push(getJsonToTree(i))
    })
    data.files.forEach(i => {
      obj.children.push(getJsonToTree(i))
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
    let result = await reqInput(InputValue);
    console.log('result: ', result);
    console.log('result.data: ', result.data)
    //let Storagedata=this.state.Storagedata
    //let Storagedata=JSON.parse(localStorage.getItem('result.data: '))
    // console.log('Storagedata',Storagedata)
    if (result.status === 200) {
      message.destroy()
      notification.open({
        message: <div style={{color:'green'}}>Clone successfully</div>,
        description:<div><div>You have successfully cloned the repository:</div><div style={{fontWeight:'bolder'}}>{result.data.reponame}</div></div>,
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
      setContent(result.data.foldertree.files)
      props.setCommitHis(result.data.logs)
    } else {
      message.destroy()
      message.error('Error when clone, please use ssh url');
    }
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