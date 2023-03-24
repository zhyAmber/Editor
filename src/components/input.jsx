import React from 'react';
import { message,Input,Button } from 'antd';
import { reqInput } from '../api';


class InputDemo extends React.Component {
  state = {
    InputValue: "git@github.com:zhyAmber/FYP.git",//输入框默认输入值
    content: '',
  };

  componentDidMount() {
    let Storagedata = JSON.parse(localStorage.getItem('result.data: '))
    if (Storagedata) {
      this.props.getTreeData(Storagedata.reponame, this.getData([Storagedata.foldertree]));
    }

  }

  handleGetInputValue = (event) => {
    this.setState({
      InputValue: event.target.value,
    });
    //let Storagedata=JSON.parse(this.localStorage.getItem('result.data: '))
    //  console.log("Storagedata",Storagedata)
    // this.props.getTreeData(Storagedata.reponame,this.getData([Storagedata.foldertree]))
  };


  getData = (data) => {
    let obj = []
    console.log(data, 'data');
    data.forEach(v => {

      //文件
      if (v.files && v.files.length > 0) {
        v.files.forEach(v => {
          obj.push({
            title: v.name,
            key: v.rel_path
          })
        })
      }
      if (v.folders && v.folders.length > 0) {
        const thisfoldercontent={
          title: v.name,
          key: v.rel_path
        }
        thisfoldercontent['children']=[]
        v.folders.forEach(i => {
          thisfoldercontent['children'].push({
            title: i.name,
            key: i.rel_path,
            children: this.getData([i])
          })
        })
        obj.push(thisfoldercontent)
      }
    })
    console.log("文件树",obj)
    return obj
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
      this.props.getTreeData(result.data.reponame, this.getData([result.data.foldertree]))
      // localStorage.setItem('result.data: ', JSON.stringify(result.data))
      //this.props.getTreeData(Storagedata.reponame,this.getData([Storagedata.foldertree]))
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
          style={{width:"50%"}}
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