import React,{useState} from 'react';
import { message, Input, Button } from 'antd';
import { reqInput } from '../api';
import useLocalStorage from '../hooks/useLocalStorage';

export const getJsonToTree = (data) => {
  // 此处返回json结构
  // 在DirectoryTree使用时加【】
  let obj = {
    title: data.name,
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
    message.loading("Send Clone Request")
    let result = await reqInput(InputValue);
    console.log('result: ', result);
    console.log('result.data: ', result.data)
    //let Storagedata=this.state.Storagedata
    //let Storagedata=JSON.parse(localStorage.getItem('result.data: '))
    // console.log('Storagedata',Storagedata)
    if (result.status === 200) {
      message.destroy()
      message.success("Sucessful Clone")
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
      message.error('Error when clone');
    }
    //console.log('localstorage',localStorage)
  };


  return (
    <div >
      Target Repository:
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