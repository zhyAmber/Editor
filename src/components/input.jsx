import React from 'react';
import { message, Input, Button } from 'antd';
import { reqInput } from '../api';

export const getJsonToTree=(data) => {
  // 此处返回json结构
  // 在DirectoryTree使用时加【】
  let obj={
    title: data.name,
    key: data.rel_path
  }
  // console.log(data, 'data');

  if (data.type === "folder") {
    obj['children']=[]
    data.folders.forEach(i => {
      obj.children.push(getJsonToTree(i))
    })
    data.files.forEach(i => {
      obj.children.push(getJsonToTree(i))
    })
  }
  if(obj.children&&obj.children.length===0){
    delete obj.children
  }

  return obj
}

class InputDemo extends React.Component {
  state = {
    InputValue: "git@github.com:zhyAmber/FYP.git",//输入框默认输入值
    content: '',
  };

  componentDidMount() {


  }

  handleGetInputValue = (event) => {
    this.setState({
      InputValue: event.target.value,
    });
    //let Storagedata=JSON.parse(this.localStorage.getItem('result.data: '))
    //  console.log("Storagedata",Storagedata)
    // this.props.getTreeData(Storagedata.reponame,this.getData([Storagedata.foldertree]))
  };


  getData = (data)=>{
    return getJsonToTree(data)
  }

  InputSubmit = async () => {
    const { InputValue } = this.state;
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
      const foldertreejson=this.getData(result.data.foldertree)
      console.log("文档树结构2",foldertreejson)
      this.props.getTreeData(result.data.reponame, foldertreejson)

      // localStorage.setItem('result.data: ', JSON.stringify(result.data))
      //this.props.getTreeData(Storagedata.reponame,this.getData(Storagedata.foldertree))
      this.setState({
        content: result.data.foldertree.files,
        localStorage: result,
      })
      this.props.setCommitHis(result.data.logs)
    } else {
      message.destroy()
      message.error('Error when clone');
    }
    //console.log('localstorage',localStorage)
  };

  render() {
    return (
      <div >
        Target Repository:
        <Input
          style={{ width: "50%" }}
          value={this.state.InputValue}
          onChange={this.handleGetInputValue}
        />
        <Button type="primary" onClick={this.InputSubmit}>Clone</Button>

        {/* <div>
          <input
          value={this.state.content}
          onChange={this.handleGetInputValue}
        />
        </div> */}


      </div>
    )
  }
}

export default InputDemo;