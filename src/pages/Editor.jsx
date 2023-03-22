import React, { useEffect, useState } from 'react';
import 'codemirror/lib/codemirror.css';

import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import "codemirror/mode/python/python.js";


import 'codemirror/theme/dracula.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/mdn-like.css';
import 'codemirror/theme/the-matrix.css';
import 'codemirror/theme/night.css';

//搜索和跳转功能
import 'codemirror/addon/search/match-highlighter.js'
import 'codemirror/addon/search/jump-to-line.js'

import 'codemirror/addon/dialog/dialog.js'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/search/searchcursor.js'
import 'codemirror/addon/search/search.js'

//代码高亮
import 'codemirror/addon/selection/active-line';
import { Controlled as ControlledEditorComponent } from 'react-codemirror2';
import { Form, Button, Layout, Tree, Row, Col } from 'antd';
import { reqcontent,getFile,pushcontent,pullcontent } from '../api';
import InputDemo from '../components/input';

const { DirectoryTree } = Tree;

const Editor = ({ language, value, setEditorState }) => {
  const [submitinfo,setSubmitinfo] = useState();
  const [theme, setTheme] = useState('dracula');
  const [cloneName, setCloneName] = useState();
  const [treeData, setTreeData] = useState([]);
  const [cursor, setCursor] = useState({line: 0, ch: 0})
  const [key, setKey] = useState(1)
  const themeArray = ['dracula', 'material', 'mdn-like', 'the-matrix', 'night'];
  const handleChange = (editor, data, value) => {
    setEditorState(value);
    localStorage.setItem('content',value)
    // localStorage.setItem('content',JSON.stringify(value))
  };

  
  window.onIframeCallback = function({ index, tagName }) {
    document.getElementById('iframe').blur()
    const htmlstr = value
    let arr = htmlstr.split('<'+ tagName)
    arr = arr.slice(0, index)
    const frontStr = arr.join('<' + tagName)
    let line = 0
    if(frontStr.length > 0) {
      line = frontStr.match(/\n/g).length //行数
    }
    
    console.log(line)
    const ch = frontStr.split('\n').reverse()[0].length
    console.log(ch)

    setCursor({
      line,
      ch,
      sticky: 'before'
    })
    setKey(key + 1)
  }

  //获取上传文件
  // const openFile = event => {
  //   var input = event.target;
  //   var reader = new FileReader();
  //   reader.onload = function () {
  //     if (reader.result) {
  //       //显示文件内容
  //       //console.log(reader.result);
  //       value = reader.result;
  //       handleChange(this.editor, this.data, value);
  //     }
  //   };
  //   reader.readAsText(input.files[0]);
  // };


  //submit编辑框内容
  const onFinish = async () => {
    console.log('传给后端的编辑框数据content: ', value);
    console.log('传给后端的编辑框数据reponame: ', cloneName);
    console.log('传给后端的编辑框数据rel_path: ', submitinfo);
    reqcontent({
      file_content:value,
      file_rel_path:submitinfo,
      reponame:cloneName
    }).then(res=>{
      console.log('result :',res.data)
    })
    // let result = await reqcontent(value);
    // console.log('result: ', result);
    // if (result.status === 200) {
    //   message.success('编辑框内容发送成功');
    //   console.log('finish');
    // } else {
    //   message.error('编辑框发送出了一点问题');
    // }
  };

  //Push到git仓库
  const onPush = async () => {
    console.log('传给后端的编辑框数据reponame: ', cloneName);
    pushcontent({
      reponame:cloneName
    }).then(res=>{
      console.log('result :',res.data)
    })
    // let result = await reqcontent(value);
    // console.log('result: ', result);
    // if (result.status === 200) {
    //   message.success('编辑框内容发送成功');
    //   console.log('finish');
    // } else {
    //   message.error('编辑框发送出了一点问题');
    // }
  };
  const onPull = async () => {
    console.log('传给后端的编辑框数据reponame: ', cloneName);
    pullcontent({
      reponame:cloneName
    }).then(res=>{
      console.log('result :',res.data)
    })
    // let result = await reqcontent(value);
    // console.log('result: ', result);
    // if (result.status === 200) {
    //   message.success('编辑框内容发送成功');
    //   console.log('finish');
    // } else {
    //   message.error('编辑框发送出了一点问题');
    // }
  };


  const onSelect = (keys, info) => {
    console.log('infoinfo',info)
    console.log('Trigger Select', keys, info);
    console.log('info',  info.node.key);
    setSubmitinfo(info.node.key);
    //localStorage.setItem('result.data: ', JSON.stringify(info.node))
   //console.log("submit",submitinfo)
    getFile({
      file_rel_path:info.node.key,
      reponame:cloneName
    }).then(res=>{
      if(info.node.title.includes('html')){
        res&& setEditorState(res.data)
      }
      if(info.node.title.includes('json')){
        res&& setEditorState(JSON.stringify(res.data))
      }
      else{
      res&& setEditorState(JSON.parse(JSON.stringify(res.data)))
      }
      // if(info.node.title.includes('json')){
      //   res&& setEditorState(JSON.stringify(res.data))
      // }
      // else{
      // res&& setEditorState(res.data)
      // }
    })
    
  };

  const onExpand = (keys, info) => {
    console.log('Trigger Expand', keys, info);
  };


  const getTreeData = (name,data) => {
    setCloneName(name)
    setTreeData(data)
  }

  return (
    <Layout>
      <Form>
        <InputDemo getTreeData={getTreeData} />
      </Form>
      <br />
      <Row>
        <Col span={6}>
          <DirectoryTree
            multiple
            onSelect={onSelect}
            onExpand={onExpand}
            treeData={treeData}
          />
        </Col>
        <Col span={18} style={{height:'100vh'}}>
          <Form onFinish={onFinish}>
            <Form.Item name="content">
              <div>
                {/* 上传文件
                <div>
                  <input
                    type="file"
                    id="testJsonFile"
                    onChange={event => {
                      openFile(event);
                    }}
                  ></input>
                </div> */}

                <div style={{ marginBottom: '10px' }}>
                  <label htmlFor="cars">选择主题: </label>
                  <select
                    name="theme"
                    onChange={el => {
                      setTheme(el.target.value);
                    }}
                  >
                    {themeArray.map(theme => (
                      <option value={theme}>{theme}</option>
                    ))}
                  </select>
                </div>
            
                
              </div>

              <div className='editor-container'>
                {/* 代码编辑框和显示 */}
                <ControlledEditorComponent
                key={key}
                  cursor={cursor}
                  onCursor={(editor, data) => {
                    console.log(data)
                    setCursor(data)
                  }}
                  onBeforeChange={handleChange}
                  value={value}
                  autoScroll="true"
                  //className="code-mirror-wrapper"
                  options={{
                    lineWrapping: true, // 代码自动换行
                    lint: true,
                    mode: language,// 语言
                    lineNumbers: true, // 显示行号,
                    theme: theme,//主题
                    autoCloseTags: true,
                    autoCloseBrackets: true,//标签自动闭合
                    autofocus: true, // 自动获取焦点
                    focus: true,
                    styleActiveLine: true, // 光标代码高亮
                    styleActiveSelected: true,
                    showCursorWhenSelecting: true
                  }}
                />
                </div>
            </Form.Item>

            <Form onFinish={onPull}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Pull
              </Button>
              </Form.Item>
            </Form>

            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save & Submit
              </Button>
            </Form.Item>
          </Form>

          <Form onFinish={onPush}>
        <Form.Item>
              <Button type="primary" htmlType="submit">
                Push
              </Button>
              </Form.Item>
        </Form>

      
        </Col>

      </Row>
    </Layout>
  );
};
export default Editor;
