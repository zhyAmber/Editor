import React, { useEffect, useState } from 'react';
import useLocalStorage from "../hooks/useLocalStorage"
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
import { message, Form, Button, Layout, Tree, Row, Col, Input, Tabs, List, Radio, Dropdown } from 'antd';
import { reqcontent, getFile, pushcontent, pullcontent } from '../api';
import InputDemo, { getJsonToTree } from '../components/input';

const { DirectoryTree } = Tree;

const getInitialTree = () => {
  // 从localstorage获取文件树json，使用时包裹【】
  let Storagedata = JSON.parse(localStorage.getItem('result.data: '))
  if (Storagedata) {
    const foldertreejson = getJsonToTree(Storagedata.foldertree)
    return foldertreejson
  }
  return {}
}

const Editor = ({ language, value, setEditorState }) => {
  const [submitinfo, setSubmitinfo] = useLocalStorage("selectitem", null);
  const [theme, setTheme] = useState('dracula');
  const [cloneName, setCloneName] = useLocalStorage("lastposiname", "");
  const [treeData, setTreeData] = useState(getInitialTree());
  const [cursor, setCursor] = useState({ line: 0, ch: 0 })
  const [key, setKey] = useState(1)
  const [commitmsg, setCommitmsg] = useState("chore: Commit by Editor")
  const [viewmode, setViewmode] = useState("code") // 'code' or 'commit'
  // commit历史信息
  const [commithistory, setCommithistory] = useLocalStorage("commithis", false)
  const themeArray = ['dracula', 'material', 'mdn-like', 'the-matrix', 'night'];
  const handleChange = (editor, data, value) => {
    setEditorState(value);
    localStorage.setItem('content', value)
    // localStorage.setItem('content',JSON.stringify(value))
  };

  useEffect(() => {
    const codemirrorDom = document.getElementsByClassName('CodeMirror')[0]
    codemirrorDom.setAttribute("style", "height: 100%")
  }, [])

  window.onIframeCallback = function ({ index, tagName }) {
    document.getElementById('iframe').blur()
    const htmlstr = value
    let arr = htmlstr.split('<' + tagName)
    arr = arr.slice(0, index)
    const frontStr = arr.join('<' + tagName)
    let line = 0
    if (frontStr.length > 0) {
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


  //submit commit编辑框内容
  const onFinish = async () => {
    console.log('传给后端的编辑框数据content: ', value);
    console.log('传给后端的编辑框数据reponame: ', cloneName);
    console.log('传给后端的编辑框数据rel_path: ', submitinfo);
    message.destroy()
    message.loading("send commit request")
    reqcontent({
      file_content: value,
      file_rel_path: submitinfo,
      reponame: cloneName,
      commit_message: commitmsg
    }).then(res => {
      if (res.status === 200) {
        message.destroy()
        message.success("success commit")
      }
      console.log('result :', res.data)
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
    message.destroy()
    message.loading("send push request")
    pushcontent({
      reponame: cloneName
    }).then(res => {
      if (res.status === 200) {
        message.destroy()
        message.success("successful push")
      }
      console.log('result :', res.data)
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
    message.destroy()
    message.loading("send pull request")
    pullcontent({
      reponame: cloneName
    }).then(res => {
      if (res.status === 200) {
        message.destroy()
        message.success("successful pull")
      }
      console.log('result :', res.data)
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
    console.log('infoinfo', info)
    console.log('Trigger Select', keys);
    console.log('info', info.node.key);
    setSubmitinfo(info.node.key);
    //localStorage.setItem('result.data: ', JSON.stringify(info.node))
    //console.log("submit",submitinfo)
    getFile({
      file_rel_path: info.node.key,
      reponame: cloneName
    }).then(res => {
      if (info.node.title.includes('html')) {
        res && setEditorState(res.data)
      }
      if (info.node.title.includes('json')) {
        res && setEditorState(JSON.stringify(res.data))
      }
      else {
        res && setEditorState(JSON.parse(JSON.stringify(res.data)))
      }
      // if(info.node.title.includes('json')){
      //   res&& setEditorState(JSON.stringify(res.data))
      // }
      // else{
      // res&& setEditorState(res.data)
      // }
    })

  };


  const getTreeData = (name, data) => {
    setCloneName(name)
    setTreeData(data)
  }

  return (
    <Layout>
      <div style={{ textAlign: 'center', fontSize:20 }}>
        <h1>AIDevOps</h1>
      </div>

      <Form>
        <div style={{textAlign:'center'}}>
        <InputDemo getTreeData={getTreeData} setCommitHis={setCommithistory} />
        </div>
      </Form>
      
      <Row>
        <div style={{margin:'10px auto'}}>
        <Radio.Group 
        value={viewmode} 
        size={'large'}
        onChange={(e) => {
          setViewmode(e.target.value)
        }}>
          <Radio.Button value="code">Codes</Radio.Button>
          <Radio.Button value="commit">Commits</Radio.Button>
        </Radio.Group>
        </div>
      </Row>
      {viewmode === "code" ? (
        <Row>
          <Col span={6}>
            <DirectoryTree
              defaultExpandedKeys={submitinfo ? [submitinfo] : []}
              defaultSelectedKeys={submitinfo ? [submitinfo] : []}
              blockNode={true}
              onSelect={onSelect}
              treeData={[treeData]}
            />
          </Col>
          <Col span={18}>
            <Form>
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
                    Playground Style:
                    <Dropdown
                    menu={{'items':themeArray.map(theme=>{
                      return {
                        'label':theme,
                        'key':theme
                      }
                    })}}
                    ><a style={{paddingLeft:10}}>{theme}</a></Dropdown>
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

              <Form.Item>
                <Button type="primary" onClick={onPull}>
                  Pull
                </Button>
              </Form.Item>

              <Form.Item>
                <Row>
                  <Col>
                    <Input
                      value={commitmsg}
                      onChange={(e) => {
                        e.persist()
                        setCommitmsg(e.target.value)
                      }} />
                  </Col>
                  <Col>
                    <Button type="primary" onClick={onFinish}>
                      Save & Submit
                    </Button>
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button type="primary" onClick={onPush}>
                  Push
                </Button>
              </Form.Item>
            </Form>


          </Col>

        </Row>
      ) : (
        <CommitTab commithistory={commithistory} />
      )}

    </Layout>
  );
};
export default Editor;


/**
 * 包含历史commit信息
 */
const CommitTab = ({ commithistory }) => {
  return (
    <div style={{ maxHeight: '700px', overflow: 'auto', paddingLeft: '30px' }}>{commithistory ? <List
      itemLayout="horizontal"
      dataSource={commithistory}
      renderItem={(item, index) => (
        <List.Item>
          <List.Item.Meta
            title={<a 
              style={{fontSize:'16px'}}
              onClick={() => {
              message.destroy()
              message.warn("点击标题check out还没写完")
            }
            }>
              {item.title}
            </a>}
            description={item.time}
          />
          {item.name}
          <br />
          {item.hash}
        </List.Item>
      )}
    /> : "no history commits"}</div>
  )
}