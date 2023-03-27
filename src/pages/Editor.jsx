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
import { message, Form, Button, Layout, Tree, Row, Col, Input, Tabs, List, Radio, Dropdown, Empty, Modal } from 'antd';
import { DeleteOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { reqcontent, getFile, pushcontent, pullcontent, getCommitLogs, checkOutto } from '../api';
import InputDemo, { getJsonToTree } from '../components/input';

const { DirectoryTree } = Tree;

const getInitialTree = () => {
  // 从localstorage获取文件树json，使用时包裹【】
  let Storagedata = JSON.parse(localStorage.getItem('result.data: '))
  if (Storagedata) {
    const foldertreejson = getJsonToTree(Storagedata.foldertree)
    return foldertreejson
  }
  return null
}

const Editor = ({ language, value, setEditorState }) => {
  // 是否选中冲突文件
  const [isConflictfile,setIsConflictfile]=useState(false)
  const [choosewhich,setChoosewhich]=useState({"local":"","remote":""})
  // 被选中文件的路径
  const [submitinfo, setSubmitinfo] = useLocalStorage("selectitem", null);
  const [theme, setTheme] = useState('dracula');
  const [cloneName, setCloneName] = useLocalStorage("lastposiname", "");
  const [treeData, setTreeData] = useState(getInitialTree());
  const [cursor, setCursor] = useState({ line: 0, ch: 0 })
  const [key, setKey] = useState(1)
  // git commit时附带的message
  const [commitmsg, setCommitmsg] = useState("chore: Commit by Editor")
  // 看代码还是看commits
  const [viewmode, setViewmode] = useState("code") // 'code' or 'commit'
  // 设置左侧代码区宽度
  const [leftwidth, setLeftwidth] = useState(8)
  // commit历史信息列表
  const [commithistory, setCommithistory] = useLocalStorage("commithis", false)
  // 现在所处commit id
  const [commitid,setCommitid]=useState("")
  const themeArray = ['dracula', 'material', 'mdn-like', 'the-matrix', 'night'];
  const handleChange = (editor, data, value) => {
    setEditorState(value);
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
    }).catch((err)=>{
      message.destroy()
      message.error(err.response.data.msg)
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

  const onPull = async (cloneName) => {
    console.log('传给后端的编辑框数据reponame: ', cloneName);
    message.destroy()
    message.loading("send pull request")
    pullcontent({
      reponame: cloneName
    }).then(res => {
      if (res.status === 200) {
        // 设置树结构
        setTreeData(getJsonToTree(res.data.foldertree))
        // 当前commit
        setCommitid(res.data.commitid)
        // 编辑框清空
        setEditorState("")
        // 当前选中文件清空
        setSubmitinfo("")
        message.destroy()
        message.success("successful pull")
      }
      console.log('result :', res.data)
    }).catch((err)=>{
      message.destroy()
      message.error(err.response.data.msg)
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
    message.loading("send push request",0)
    pushcontent({
      reponame: cloneName
    }).then(res => {
      console.log("respush",res)
      message.destroy()
      if (res.status === 200) {
        message.success("successful push",1,()=>{
          message.loading("build docker images...",6,()=>{
            message.success("successful build",1.5,()=>{
              message.loading("deploying on kubernetes...",3,()=>{
                message.success("Successful build and deploy",2)
                document.querySelector("#iframe").contentWindow.location.reload()
              })
            })
          })
        })
      }
    }).catch((error)=>{
      message.destroy()
      message.error(error.response.data.msg)
    })

  };


  /**
   * 点击左侧文件树中的一个文件
   */
  const onSelect = (keys, info) => {
    console.log('infoinfo', info)
    console.log('Trigger Select', keys);
    console.log('info', info.node.key);
    setSubmitinfo(info.node.key);
    //localStorage.setItem('result.data: ', JSON.stringify(info.node))
    //console.log("submit",submitinfo)
    // 如果是页子，请求内容
    if (info.node.isLeaf) {
      getFile({
        file_rel_path: info.node.key,
        reponame: cloneName
      }).then(res => {
        // if (info.node.title+"".includes('html')) {
        // res && setEditorState(res.data)
        // }
        // if (info.node.title.includes('json')) {
        //   res && setEditorState(JSON.stringify(res.data))
        // }
        // else {
        //   res && setEditorState(JSON.parse(JSON.stringify(res.data)))
        // }

        setEditorState(res.data)

        // if(info.node.title.includes('json')){
        //   res&& setEditorState(JSON.stringify(res.data))
        // }
        // else{
        // res&& setEditorState(res.data)
        // }
      }).catch(err=>{
        if(err.response.status===400){
          setIsConflictfile(true)
          setChoosewhich(err.response.data)
          setEditorState("")
        }
      })
    } else {
      // 文件夹直接默认展开
    }


  };


  const getTreeData = (name, data) => {
    setCloneName(name)
    setTreeData(data)
  }

  return (
    <Layout>
      <div style={{ textAlign: 'center', fontSize: 20, position: 'relative' }}>
        <h1>AIDevOps</h1>
        <div style={{ position: 'absolute', right: 5, top: 0, fontSize: 20, zIndex: 999, cursor: 'pointer' }}
          className='hoverbox'
          onClick={() => {
            const res = window.confirm("This will delete all localstorage of this site")
            if (res) {
              localStorage.clear()
              window.location.reload()
            }
          }}
        ><DeleteOutlined /></div>
      </div>

      <Form>
        <div style={{ textAlign: 'center' }}>
          <InputDemo getTreeData={getTreeData} setCommitHis={setCommithistory} />
        </div>
      </Form>

      <Row>
        <div style={{ margin: '10px auto' }}>
          <Radio.Group
            value={viewmode}
            size={'large'}
            onChange={(e) => {
              setViewmode(e.target.value)
              if(e.target.value==="commit"){
                getCommitLogs({reponame:cloneName}).then((res)=>{
                  setCommithistory(res.data.logs)
                  setCommitid(res.data.commitid)
                })
              }
            }}>
            <Radio.Button value="code">Codes</Radio.Button>
            <Radio.Button value="commit">Commits</Radio.Button>
          </Radio.Group>
        </div>
      </Row>
      {viewmode === "code"?(<div style={{ position: 'relative' }}>
        <div style={{ position:'absolute',left:5,top:-35, fontSize: 20, zIndex: 999, cursor: 'pointer' }}
          className='hoverbox'
          onClick={()=>{
            if(leftwidth>0){
              setLeftwidth(0)
            }else{
              setLeftwidth(8)
            }
          }}
        >
          {leftwidth > 0 ? <LeftOutlined /> : <RightOutlined />}
        </div>
      </div>):(<></>)}
      
      {viewmode === "code" ? (
        <div>
          <Row>
          <div style={{ marginBottom: '10px' }}>
                    Playground Style:
                    <Dropdown
                    trigger={['click']}
                      menu={{
                        'items': themeArray.map(thistheme => {
                          return {
                            'label': <div onClick={()=>{
                              setTheme(thistheme)
                            }}>{thistheme}</div>,
                            'key': thistheme,
                            
                          }
                        })
                      }}
                    ><a style={{ paddingLeft: 10 }}>{theme}</a></Dropdown>
                  </div>
          </Row>
        <Row>
          <Col span={leftwidth} style={{height:'560px',overflow:'scroll'}}>
            <DirectoryTree
              showIcon={false}
              defaultExpandedKeys={submitinfo ? [submitinfo] : []}
              defaultSelectedKeys={submitinfo ? [submitinfo] : []}
              blockNode={true}
              onSelect={onSelect}
              treeData={treeData ? [treeData] : []}
            />
          </Col>
          <Col span={24 - leftwidth} style={{height:'560px',overflow:'scroll'}}>
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
            </Form>

          </Col>

        </Row>

        <Row justify={"space-around"}>
        <Form.Item>
          <Button type="primary" onClick={()=>{onPull(cloneName)}}>
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
                Save & Commit
              </Button>
            </Col>
          </Row>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={onPush}>
            Push
          </Button>
        </Form.Item>
        </Row>
        </div>
      ) : (
        <CommitTab commithistory={commithistory} reponame={cloneName} setTreeData={setTreeData} commitid={commitid} setCommitid={setCommitid} setEditorState={setEditorState} setSubmitinfo={setSubmitinfo}/>
      )}
      <Modal 
      width={1100}
      title="Conflict file" open={isConflictfile} onOk={()=>setIsConflictfile(false)} onCancel={()=>setIsConflictfile(false)}>
        <SolveConflict 
        choosewhich={choosewhich} 
        setEditorState={setEditorState}
        theme={theme}
        setIsConflictfile={setIsConflictfile}
        ></SolveConflict>
      </Modal>
    </Layout>
  );
};
export default Editor;


/**
 * 包含历史commit信息
 */
const CommitTab = ({ commithistory,reponame,setTreeData,commitid,setCommitid,setEditorState,setSubmitinfo }) => {

  console.log(commitid)

  return (
    <div style={{ maxHeight: '700px', overflow: 'auto', paddingLeft: '30px' }}>{commithistory ? <List
      itemLayout="horizontal"
      dataSource={commithistory}
      renderItem={(item, index) => (
        <List.Item>
          <List.Item.Meta
            title={<a
              style={{ fontSize: '16px' }}
              onClick={() => {
                checkOutto({
                  'reponame':reponame,
                  'hash':item.hash
                }).then((res)=>{
                  if(res.status===200){
                    // 设置树结构
                    setTreeData(getJsonToTree(res.data.foldertree))
                    // 当前commit
                    setCommitid(res.data.commitid)
                    // 编辑框清空
                    setEditorState("")
                    // 当前选中文件清空
                    setSubmitinfo("")
                    message.destroy()
                    message.success("checkout to "+res.data.commitid)
                  }
                }).catch((err)=>{
                  message.destroy()
                  message.error(err.response.data.msg)
                })

              }
              }>
              <div style={item.hash===commitid?{color:'green'}:{}}>{item.hash===commitid?"=>":""}{item.title}</div>
            </a>}
            description={item.time}
          />
          {item.name}
          <br />
          {item.hash}
        </List.Item>
      )}
    /> : <Empty />}</div>
  )
}

const SolveConflict=({choosewhich,theme,setEditorState,setIsConflictfile})=>{

  const editboxcss={
    overflow:"scroll",
    height:"700px"
  }

  return (<div>
    <Row justify={"space-around"}>
    <ControlledEditorComponent
      style={editboxcss}
      value={choosewhich.local}
      options={{
        lineWrapping: true, // 代码自动换行
        lint: true,
        // lineNumbers: true, // 显示行号,
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
    <ControlledEditorComponent
      style={editboxcss}
      value={choosewhich.remote}
      options={{
        lineWrapping: true, // 代码自动换行
        lint: true,
        // lineNumbers: true, // 显示行号,
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
    </Row>
    <Row ><br /></Row>
    <Row justify={"space-around"}>
      <Button type='primary' onClick={()=>{
        setEditorState(choosewhich.local)
        setIsConflictfile(false)
      }}>choose Local</Button>
      <Button type='primary' onClick={()=>{
        setEditorState(choosewhich.remote)
        setIsConflictfile(false)
      }}>choose Remote</Button>
    </Row>
  </div>)
}