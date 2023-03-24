import React, { useState, useEffect } from 'react';
import './App.css';
import Button from './components/Button';
import Editor from './pages/Editor';
// import {reqInput} from './api'


function App() {
  const [html, setHtml] = useState(localStorage.getItem('content') || '');
  const [css, setCss] = useState(`
    .selected {
      background-color: #ccc
    }
  `);
  const [js, setJs] = useState(`
  $(document).on('click', function(e) {
    var el = e.target
    $(document).find('body *').removeClass('selected Iamflag')
    if(el.localName === 'html' || el.localName === 'body') { return }
    $(el).addClass('selected Iamflag')

    
    var htmlStr = $('body').html()
    // 标记字符查询结束位置
    var end = htmlStr.indexOf('Iamflag')
    // 查找html文本前面有多少个相同的标签
    var reg = new RegExp('<' + $(el)[0].tagName.toLowerCase(), 'g')
    var count = htmlStr.slice(0, end).match(reg)

    console.log(reg, count)

    window.parent.onIframeCallback({
      index: count.length, //第几个标签
      tagName: $(el)[0].tagName.toLowerCase() //标签名
    })
  })
  `);
  const [python, setPython] = useState('');
  const [openedEditor, setOpenedEditor] = useState('html');
  const [srcDoc, setSrcDoc] = useState('');
  const Conversion = "\\";



  //   <html>
  //   <body>${html}</body>
  //   <style>${css}</style>
  //   <script>${js}</script>
  //  </html>
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setSrcDoc(
        `
          <html>
          <body>${html}</body>
          <style>${css}</style>
          <script src="https://cdn.bootcdn.net/ajax/libs/jquery/3.6.4/jquery.min.js"></script>
          <script>${js}</script>
         </html>

           
        `
      )
    }, 250)
    // reqInput({
    //   repodir:''
    // }).then(res=>{
    //   console.log(res);
    // })
    return () => { clearTimeout(timeOut) }
  }, [html, css, js]);

  const onTabClick = editorName => {
    setOpenedEditor(editorName);
  };

  return (
    <div className="App">
      {/* <p>Welcome to Web Code Editor ！</p>
      <div className="tab-button-container">
        <Button
          title="HTML"
          onClick={() => {
            onTabClick('html');
          }}
        />
        <Button
          title="CSS"
          onClick={() => {
            onTabClick('css');
          }}
        />
        <Button
          title="JavaScript"
          onClick={() => {
            onTabClick('js');
          }}
        />
          <Button
          title="Python"
          onClick={() => {
            onTabClick('python');
          }}
        />
      </div>

      <br /> */}

      <div>
        <div className="pane_editor">
          <div style={{ width: '100vw', height: '100%' }}>
            {openedEditor === 'html' ? (
              <Editor language="xml" value={html} setEditorState={setHtml} />
            ) : openedEditor === 'css' ? (
              <Editor language="css" value={css} setEditorState={setCss} />
            ) : openedEditor === 'python' ? (
              <Editor language="python" value={python} setEditorState={setPython} />
            ) : (
              <Editor language="javascript" value={js} setEditorState={setJs} />
            )
            }
          </div>
          {/* <iframe
              srcDoc={srcDoc}
              title="output"
              sandbox="allow-scripts"
              
              // width="100%"
              // height="100%"
            /> */}

          <div className="pane_iframe">
            <iframe
              id="iframe"
              srcDoc={srcDoc}
              title="output"
              sandbox="allow-scripts allow-same-origin"
              frameBorder="0"
              width="100%"
              height="100%"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
export default App;
