// app.js - Student Workspace (trimmed down to requested pages)
// Pages: home, minecraft-wasm, minecraft-js, documents, code, ai, settings
// Persistent storage prefix
const LS_PREFIX = "student_ws_v1_";

// defaults & settings
const defaults = {
  title: "Student",
  icon: "https://assets.clever.com/resource-icons/apps/519ee42d58b876b018002125/icon_7efecfb.png",
  presets: {}
};
let settings = lsGet("settings", null) || defaults;
lsSet("settings", settings);

// quick DOM helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const content = $("#content");
function setActive(page){ $$(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.page === page)); }

// ---------- RENDERERS ----------
function renderHome(){
  document.title = settings.title || defaults.title;
  $("#brand-title").textContent = settings.title || defaults.title;
  $("#brand-icon").src = settings.icon || defaults.icon;
  return `
    <div class="card">
      <h2>Welcome, ${escapeHtml(settings.title || "Student")}</h2>
      <p class="small">This is your offline-first workspace. Use Documents for writing, Code for programming, AI for assistance, and Minecraft tabs to preview local pages.</p>
    </div>
    <div class="card">
      <h3>Quick Info</h3>
      <p><b>Date:</b> ${new Date().toLocaleDateString()}</p>
      <p><b>Time:</b> <span id="clock"></span></p>
    </div>
  `;
}

function renderMinecraftWasm() {
  return `
    <div class="card embed-window">
      <h3>Minecraft WASM-GC</h3>
      <button class="embed-fullscreen" id="fs-mc-wasm">Fullscreen</button>
      <iframe class="embed-frame" id="mc-wasm-iframe" src="eaglercraft.html"></iframe>
    </div>
  `;
}

function renderMinecraftJs() {
  return `
    <div class="card embed-window">
      <h3>Minecraft JS</h3>
      <button class="embed-fullscreen" id="fs-mc-js">Fullscreen</button>
      <iframe class="embed-frame" id="mc-js-iframe" src="eaglercraft-js.html"></iframe>
    </div>
  `;
}


function renderDocuments(){
  const docs = lsGet("docs", []);
  const listHtml = docs.map(d => `
    <div class="doc-item" data-id="${d.id}">
      <div>
        <div style="font-weight:700">${escapeHtml(d.title || "Untitled")}</div>
        <div class="doc-meta">${new Date(d.updated).toLocaleString()}</div>
      </div>
      <div class="doc-actions">
        <button data-action="rename">✎</button>
        <button data-action="delete">🗑</button>
      </div>
    </div>
  `).join("");
  return `
    <div class="docs-shell">
      <div class="docs-list card">
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <input id="newDocTitle" class="input" placeholder="New document title">
          <button class="btn" id="createDocBtn">Create</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px">
          <button class="btn secondary" id="importDocsBtn">Import</button>
          <button class="btn" id="exportDocsBtn">Export</button>
        </div>
        <div id="docsContainer">${listHtml || '<div class="small">No documents yet.</div>'}</div>
      </div>

      <div>
        <div class="card doc-editor" style="height:100%">
          <div class="editor-toolbar">
            <button class="toolbar-btn" data-cmd="bold">Bold</button>
            <button class="toolbar-btn" data-cmd="italic">Italic</button>
            <button class="toolbar-btn" data-cmd="underline">Underline</button>
            <button class="toolbar-btn" id="saveDocBtn">Save</button>
            <div style="margin-left:auto;color:#aaa;font-size:12px" id="editorStatus">No document selected</div>
          </div>

          <input id="editorTitle" class="input" placeholder="Document title" style="margin-bottom:8px">
          <div id="editor" class="editor-area" contenteditable="true" spellcheck="true" ></div>
        </div>
      </div>
    </div>
  `;
}

function renderCode(){
  const files = lsGet("code_files", []) || [];
  const fileListHtml = files.map(f => `<div class="file-item" data-path="${escapeHtml(f.path)}">${escapeHtml(f.path)}</div>`).join("");
  return `
    <div class="code-shell">
      <div class="file-tree card">
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <input id="newFilePath" class="input" placeholder="path/to/file.js"/>
          <button class="btn" id="createFileBtn">New</button>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:8px">
          <button class="btn secondary" id="importCodeBtn">Import</button>
          <button class="btn" id="exportCodeBtn">Export</button>
        </div>
        <div id="fileList">${fileListHtml || '<div class="small">No files</div>'}</div>
      </div>

      <div class="editor-wrapper card">
        <div class="editor-toolbar">
          <select id="langSelect" class="input" style="width:180px">
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="markdown">Markdown</option>
            <option value="plaintext">Plain Text</option>
          </select>
          <button class="btn" id="saveCodeBtn">Save</button>
          <button class="btn secondary" id="runCodeBtn">Run (eval)</button>
          <div style="margin-left:auto" class="small mono" id="currentFile">No file</div>
        </div>
        <div id="monaco-editor" style="height:calc(100% - 46px)"></div>
      </div>
    </div>
  `;
}

function renderAI(){
  return `
    <div class="card">
      <h3>AI Assistant</h3>
      <p class="small">Embedded AI chat (third-party embed).</p>
      <iframe class="ai-frame" src="https://www.chattide.ai/ai-chat/" sandbox="allow-scripts allow-forms allow-same-origin"></iframe>
    </div>
  `;
}

function renderSettings(){
  const presets = settings.presets || {};
  const presetHtml = Object.keys(presets).map(k => `<button class="btn secondary apply-preset" data-name="${escapeHtml(k)}">${escapeHtml(k)}</button>`).join("");
  return `
    <div class="card">
      <h3>Settings</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div class="row"><label style="width:140px">Site Title</label><input id="settingTitle" class="input" value="${escapeHtml(settings.title||'Student')}" /></div>
        <div class="row"><label style="width:140px">Favicon</label><input id="settingIconUrl" class="input" placeholder="Paste image URL" value="${escapeHtml(settings.icon||'')}" /></div>
        <div class="row"><label style="width:140px">Presets</label><div style="flex:1"><div class="preset-list">${presetHtml || '<span class="small">No presets</span>'}</div><div style="display:flex;gap:8px;margin-top:8px"><input id="presetName" class="input" placeholder="Preset name"/><button class="btn" id="savePresetBtn">Save Preset</button></div></div></div>
        <div style="display:flex;gap:8px"><button class="btn" id="applySettingsBtn">Apply & Save</button><button class="btn secondary" id="resetSettingsBtn">Reset</button></div>
      </div>
    </div>
  `;
}

// ---------- PAGE MANAGEMENT ----------
function loadPage(page){
  setActive(page);
  if(page === "home") content.innerHTML = renderHome();
  if(page === "minecraft-wasm") content.innerHTML = renderMinecraftWasm();
  if(page === "minecraft-js") content.innerHTML = renderMinecraftJs();
  if(page === "documents") content.innerHTML = renderDocuments();
  if(page === "code") content.innerHTML = renderCode();
  if(page === "ai") content.innerHTML = renderAI();
  if(page === "settings") content.innerHTML = renderSettings();

  // wire page-specific features
  if(page === "home") startClock();
  if(page === "minecraft-wasm") wireMinecraft('mc-wasm-iframe','fs-mc-wasm');
  if(page === "minecraft-js") wireMinecraft('mc-js-iframe','fs-mc-js');
  if(page === "documents") wireDocuments();
  if(page === "code") wireCode();
  if(page === "settings") wireSettings();
}

// nav wiring
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".nav-btn");
  if(btn){
    loadPage(btn.dataset.page);
  }
});

// init
loadPage("home");

// ---------- Utilities ----------
function lsGet(key, fallback = null){
  try { const v = localStorage.getItem(LS_PREFIX + key); return v ? JSON.parse(v) : fallback; } catch(e){ return fallback; }
}
function lsSet(key, val){
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(val)); } catch(e){}
}
function escapeHtml(s){ return (s||"").toString().replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" }[m])); }

// ---------- Clock ----------
function startClock(){
  const el = document.getElementById("clock");
  if(!el) return;
  el.textContent = new Date().toLocaleTimeString();
  clearInterval(el._t);
  el._t = setInterval(()=> el.textContent = new Date().toLocaleTimeString(), 1000);
}

// ---------- Minecraft fullscreen wiring ----------
function wireMinecraft(iframeId, fsBtnId){
  const iframe = document.getElementById(iframeId);
  const btn = document.getElementById(fsBtnId);
  if(btn && iframe){
    btn.onclick = () => {
      // request fullscreen for the iframe element
      if (!document.fullscreenElement) {
        if (iframe.requestFullscreen) iframe.requestFullscreen();
        else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
        else if (iframe.msRequestFullscreen) iframe.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    };
  }
}

// ---------- Documents (multi-doc) ----------
function wireDocuments(){
  let docs = lsGet("docs", []);
  const docsContainer = document.getElementById("docsContainer");
  const editor = document.getElementById("editor");
  const editorTitle = document.getElementById("editorTitle");
  const editorStatus = document.getElementById("editorStatus");
  let currentId = null;
  let autosaveTimer = null;

  function refreshList(){
    docs = lsGet("docs", []);
    const html = docs.map(d => `
      <div class="doc-item ${d.id===currentId?'active':''}" data-id="${d.id}">
        <div>
          <div style="font-weight:700">${escapeHtml(d.title||'Untitled')}</div>
          <div class="doc-meta">${new Date(d.updated).toLocaleString()}</div>
        </div>
        <div class="doc-actions">
          <button data-action="rename">✎</button>
          <button data-action="delete">🗑</button>
        </div>
      </div>
    `).join("") || '<div class="small">No documents yet.</div>';
    docsContainer.innerHTML = html;
    $$(".doc-item").forEach(it => {
      it.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button");
        if(btn) return;
        openDoc(it.dataset.id);
      });
      it.querySelectorAll("button").forEach(b => {
        b.addEventListener("click", (e) => {
          const act = b.dataset.action;
          const id = it.dataset.id;
          if(act === "delete"){ if(confirm("Delete this document?")){ docs = docs.filter(d=>d.id!==id); lsSet("docs", docs); if(id===currentId){ clearEditor(); currentId=null } refreshList(); } }
          if(act === "rename"){ const newName = prompt("New title"); if(newName!==null){ docs = docs.map(d=> d.id===id? {...d, title:newName, updated:Date.now()} : d); lsSet("docs", docs); if(id===currentId) editorTitle.value=newName; refreshList(); } }
        });
      });
    });
  }

  function createDoc(title){
    const id = "doc_"+Date.now()+"_"+Math.floor(Math.random()*9999);
    const doc = { id, title: title||"Untitled", content: "<p></p>", created: Date.now(), updated: Date.now() };
    docs.unshift(doc);
    lsSet("docs", docs);
    refreshList();
    openDoc(id);
  }

  function openDoc(id){
    const doc = docs.find(d=>d.id===id);
    if(!doc) return;
    currentId = id;
    editor.innerHTML = doc.content || "";
    editorTitle.value = doc.title || "Untitled";
    editorStatus.textContent = "Editing (autosave on)";
    lsSet("lastOpenDoc", currentId);
    refreshList();
  }

  function clearEditor(){
    editor.innerHTML = "";
    editorTitle.value = "";
    editorStatus.textContent = "No document selected";
  }

  // controls
  document.getElementById("createDocBtn").addEventListener("click", ()=>{
    const t = document.getElementById("newDocTitle").value.trim();
    createDoc(t || "Untitled");
    document.getElementById("newDocTitle").value = "";
  });

  document.getElementById("exportDocsBtn").addEventListener("click", ()=>{
    const payload = { docs: lsGet("docs", []), settings: settings };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "student_backup.json"; a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById("importDocsBtn").addEventListener("click", ()=>{
    const inp = document.createElement("input"); inp.type="file"; inp.accept="application/json";
    inp.onchange = e=>{
      const f = e.target.files[0]; if(!f) return;
      const r = new FileReader();
      r.onload = ev=>{
        try{
          const parsed = JSON.parse(ev.target.result);
          if(parsed.docs) lsSet("docs", parsed.docs);
          if(parsed.settings) { settings = Object.assign({}, settings, parsed.settings); lsSet("settings", settings); }
          alert("Import complete");
          refreshList();
        }catch(err){ alert("Invalid file") }
      }; r.readAsText(f);
    }; inp.click();
  });

  // toolbar commands (bold/italic/underline)
  $$(".toolbar-btn").forEach(btn=>{
    btn.addEventListener("click", ()=> {
      const cmd = btn.dataset.cmd;
      if(cmd) document.execCommand(cmd, false, null);
    });
  });

  document.getElementById("saveDocBtn").addEventListener("click", ()=> {
    if(!currentId) return alert("Open or create a document first");
    const docs = lsGet("docs", []);
    const idx = docs.findIndex(d=>d.id===currentId);
    if(idx===-1) return;
    docs[idx].title = document.getElementById("editorTitle").value || "Untitled";
    docs[idx].content = document.getElementById("editor").innerHTML;
    docs[idx].updated = Date.now();
    lsSet("docs", docs);
    lsSet("lastOpenDoc", currentId);
    document.getElementById("editorStatus").textContent = "Saved";
    setTimeout(()=> document.getElementById("editorStatus").textContent = "Editing (autosave on)", 1200);
    refreshList();
  });

  // autosave
  editor.addEventListener("input", ()=>{
    if(!currentId) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(()=> {
      const docs = lsGet("docs", []);
      const idx = docs.findIndex(d=>d.id===currentId);
      if(idx!==-1){
        docs[idx].content = editor.innerHTML;
        docs[idx].updated = Date.now();
        docs[idx].title = document.getElementById("editorTitle").value || docs[idx].title;
        lsSet("docs", docs);
      }
    }, 900);
  });

  editorTitle.addEventListener("input", ()=>{
    if(!currentId) return;
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(()=> {
      const docs = lsGet("docs", []);
      const idx = docs.findIndex(d=>d.id===currentId);
      if(idx!==-1){
        docs[idx].title = document.getElementById("editorTitle").value || docs[idx].title;
        docs[idx].updated = Date.now();
        lsSet("docs", docs);
        refreshList();
      }
    }, 900);
  });

  // open last
  const lastOpen = lsGet("lastOpenDoc", null);
  if(lastOpen) currentId = lastOpen;
  if(currentId){
    const all = lsGet("docs", []);
    if(all.some(d=>d.id===currentId)) openDoc(currentId);
  }

  refreshList();
}

// ---------- CODE (Monaco) ----------
let monacoEditor = null;
let monacoReady = false;

function loadMonaco(){
  if(monacoReady) return;
  const loaderScript = document.createElement("script");
  loaderScript.src = "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js";
  document.body.appendChild(loaderScript);
  loaderScript.onload = () => {
    // configure require base
    if (window.require) {
      window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" } });
      window.require(["vs/editor/editor.main"], () => {
        monacoReady = true;
        initMonacoIfVisible();
      });
    }
  };
}

function initMonacoIfVisible(){
  const container = document.getElementById("monaco-editor");
  if(!container) return;
  if(monacoEditor) return;
  monacoEditor = monaco.editor.create(container, {
    value: "// New file\n",
    language: "javascript",
    theme: "vs-dark",
    automaticLayout: true,
    minimap: { enabled: false }
  });
}

function wireCode(){
  loadMonaco();
  // ensure editor is initialized when container is available
  setTimeout(()=> initMonacoIfVisible(), 300);

  let files = lsGet("code_files", []) || [];
  const fileList = document.getElementById("fileList");
  const currentFileLabel = document.getElementById("currentFile");

  function refreshFileList(){
    files = lsGet("code_files", []) || [];
    fileList.innerHTML = files.map(f=>`<div class="file-item" data-path="${escapeHtml(f.path)}">${escapeHtml(f.path)}</div>`).join("") || '<div class="small">No files</div>';
    $$(".file-item").forEach(it => it.addEventListener("click", ()=> openFile(it.dataset.path) ));
  }

  function openFile(path){
    const file = (lsGet("code_files",[])||[]).find(x=>x.path===path);
    if(!file) return alert("File not found");
    lsSet("lastCodeFile", path);
    currentFileLabel.textContent = path;
    currentFileLabel.dataset.path = path;

    const loadContent = () => {
      if (!monacoReady || !monacoEditor) {
        // keep trying until monaco is ready (monacoReady will be set after loader)
        setTimeout(loadContent, 200);
        return;
      }
      monacoEditor.setValue(file.content || "");
      const lang = detectLanguageFromPath(path) || "plaintext";
      try { monaco.editor.setModelLanguage(monacoEditor.getModel(), lang); } catch(e){}
      const sel = document.getElementById("langSelect"); if(sel) sel.value = lang;
    };
    loadContent();
  }

  function saveCurrentFile(){
    const path = currentFileLabel.dataset.path;
    if(!path) return alert("No file open");
    const files = lsGet("code_files", []) || [];
    const idx = files.findIndex(f=>f.path===path);
    if(idx===-1) return;
    if(!monacoEditor) return alert("Editor not ready yet");
    files[idx].content = monacoEditor.getValue();
    files[idx].updated = Date.now();
    lsSet("code_files", files);
    refreshFileList();
    alert("Saved");
  }

  document.getElementById("createFileBtn").addEventListener("click", ()=>{
    const p = document.getElementById("newFilePath").value.trim();
    if(!p) return alert("Enter path");
    const files = lsGet("code_files", []) || [];
    if(files.some(f=>f.path===p)) return alert("File exists");
    const newf = { path: p, content: "", created: Date.now(), updated: Date.now() };
    files.unshift(newf); lsSet("code_files", files); refreshFileList(); document.getElementById("newFilePath").value="";
    openFile(p);
  });

  document.getElementById("saveCodeBtn").addEventListener("click", saveCurrentFile);

  document.getElementById("langSelect").addEventListener("change", (e)=>{
    const lang = e.target.value;
    if(monacoEditor) try { monaco.editor.setModelLanguage(monacoEditor.getModel(), lang); } catch(e){}
  });

  document.getElementById("exportCodeBtn").addEventListener("click", ()=>{
    const payload = lsGet("code_files", []) || [];
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download="code_files.json"; a.click(); URL.revokeObjectURL(url);
  });

  document.getElementById("importCodeBtn").addEventListener("click", ()=>{
    const inp = document.createElement("input"); inp.type="file"; inp.accept="application/json";
    inp.onchange = e=>{ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = ev => {
      try{ const parsed = JSON.parse(ev.target.result); if(Array.isArray(parsed)) lsSet("code_files", parsed); alert("Imported"); refreshFileList(); }catch(err){ alert("Invalid file"); } }; r.readAsText(f); }; inp.click();
  });

  document.getElementById("runCodeBtn").addEventListener("click", ()=>{
    try{
      const lang = document.getElementById("langSelect").value;
      const code = monacoEditor ? monacoEditor.getValue() : "";
      if(lang === "javascript" || lang === "typescript"){
        const res = eval(code);
        alert("Result: " + String(res));
      } else {
        alert("Run: only JS/TS eval is available locally.");
      }
    }catch(e){ alert("Error: "+e); }
  });

  // open last file if exists
  const last = lsGet("lastCodeFile", null);
  if(last) setTimeout(()=> openFile(last), 700);
  refreshFileList();
}

function detectLanguageFromPath(path){
  const ext = (path || "").split('.').pop().toLowerCase();
  const map = {
    js: "javascript", jsx:"javascript", ts:"typescript", tsx:"typescript",
    html:"html", css:"css", json:"json", py:"python", java:"java",
    cs:"csharp", cpp:"cpp", c:"cpp", md:"markdown", txt:"plaintext"
  };
  return map[ext] || "plaintext";
}

// ---------- SETTINGS ----------
function wireSettings(){
  document.querySelectorAll(".apply-preset").forEach(b=>{
    b.addEventListener("click", ()=> {
      const name = b.dataset.name; const p = settings.presets && settings.presets[name];
      if(!p) return alert("Preset not found");
      settings = Object.assign({}, settings, p); lsSet("settings", settings); alert("Preset applied"); loadPage("settings");
    });
  });

  document.getElementById("applySettingsBtn")?.addEventListener("click", ()=>{
    settings.title = document.getElementById("settingTitle").value || "Student";
    settings.icon = document.getElementById("settingIconUrl").value || settings.icon;
    lsSet("settings", settings);
    document.title = settings.title;
    $("#brand-title").textContent = settings.title;
    $("#brand-icon").src = settings.icon;
    const favicon = document.getElementById("favicon"); if(favicon) favicon.href = settings.icon;
    alert("Saved");
    loadPage("home");
  });

  document.getElementById("resetSettingsBtn")?.addEventListener("click", ()=>{
    if(!confirm("Reset to defaults?")) return;
    settings = Object.assign({}, defaults); lsSet("settings", settings); applySettingsToUI(); loadPage("settings");
  });

  document.getElementById("savePresetBtn")?.addEventListener("click", ()=>{
    const name = document.getElementById("presetName").value.trim(); if(!name) return alert("Name required");
    settings.presets = settings.presets || {}; settings.presets[name] = { title: settings.title, icon: settings.icon }; lsSet("settings", settings);
    alert("Preset saved"); loadPage("settings");
  });
}

function applySettingsToUI(){
  document.title = settings.title || defaults.title;
  $("#brand-title").textContent = settings.title || defaults.title;
  $("#brand-icon").src = settings.icon || defaults.icon;
  const fav = document.getElementById("favicon"); if(fav) fav.href = settings.icon || defaults.icon;
}
applySettingsToUI();

// persist last page
(function restoreLastPage(){
  const lastPage = lsGet("lastPage", null);
  if(lastPage) { setTimeout(()=> loadPage(lastPage), 120); }
  document.addEventListener("click", e=>{
    const btn = e.target.closest(".nav-btn");
    if(btn){ lsSet("lastPage", btn.dataset.page); }
  });
})();
