/**
 * CloudCode 管理后台页面（Material Design 3 · 蓝紫渐变 · 无 emoji）
 */
export function adminPageHtml() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CloudCode 控制台</title>
<style>
:root{
  --primary:#7c4dff; --primary-light:#a18bff; --primary-dark:#5a2bd6;
  --secondary:#448aff; --surface:#ffffff; --bg:#f4f5fb;
  --on-surface:#1c1b20; --muted:#67676f; --outline:#dedee3;
  --error:#b3261e; --radius:16px;
  --shadow:0 2px 8px rgba(70,50,140,.12);
  --shadow-lg:0 12px 40px rgba(70,50,140,.2);
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Roboto","Segoe UI","PingFang SC","Microsoft YaHei",system-ui,sans-serif;color:var(--on-surface);background:var(--bg);min-height:100vh}
.gradient-bar{position:fixed;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#448aff 0%,#7c4dff 50%,#b388ff 100%);z-index:100}
.app{max-width:1100px;margin:0 auto;padding:24px 20px 60px}
.topbar{display:flex;align-items:center;justify-content:space-between;padding:20px 0 28px}
.brand{display:flex;align-items:center;gap:14px}
.brand-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#448aff,#7c4dff,#b388ff);display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:700;box-shadow:var(--shadow-lg)}
.brand-title{font-size:24px;font-weight:600}
.brand-sub{font-size:13px;color:var(--muted);margin-top:2px}
.top-actions{display:flex;gap:10px;align-items:center}
button{font-family:inherit;border:none;border-radius:24px;padding:10px 22px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s ease}
.btn-primary{background:linear-gradient(135deg,#448aff,#7c4dff);color:#fff;box-shadow:0 4px 16px rgba(124,77,255,.4)}
.btn-primary:hover{box-shadow:0 6px 22px rgba(124,77,255,.55);transform:translateY(-1px)}
.btn-secondary{background:var(--surface);color:var(--primary);border:1px solid var(--outline)}
.btn-secondary:hover{background:#f1edff}
.btn-danger{background:#fdeceb;color:var(--error)}
.btn-danger:hover{background:#fbd9d7}
.btn-ghost{background:transparent;color:var(--primary)}
.btn-ghost:hover{background:#f1edff}
.btn-sm{padding:6px 14px;font-size:12.5px;border-radius:20px}
.card{background:var(--surface);border-radius:var(--radius);box-shadow:var(--shadow);padding:24px;margin-bottom:24px;border:1px solid #efeff5}
.card-title{font-size:18px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.card-title .dot{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#448aff,#7c4dff);display:inline-block}
.upload-zone{border:2px dashed #c9c3ec;border-radius:14px;padding:28px;text-align:center;background:#faf9ff;transition:all .2s;cursor:pointer}
.upload-zone:hover,.upload-zone.dragging{border-color:var(--primary);background:#f3f0ff}
.upload-icon{font-size:40px;color:var(--primary);margin-bottom:8px;font-weight:300}
.upload-text{color:var(--muted);font-size:14px}
.upload-text strong{color:var(--primary)}
.upload-form{margin-top:20px;text-align:left}
.field{margin-bottom:16px}
.field label{display:block;font-size:13px;color:var(--muted);margin-bottom:6px;font-weight:500}
input[type="text"],textarea,select{width:100%;padding:12px 14px;border:1px solid var(--outline);border-radius:12px;font-size:14px;font-family:inherit;background:var(--surface);color:var(--on-surface);transition:border-color .2s;outline:none}
input[type="text"]:focus,textarea:focus,select:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(124,77,255,.15)}
textarea{min-height:140px;resize:vertical;font-family:"SF Mono",Consolas,"Courier New",monospace;font-size:13px;line-height:1.5}
.form-row{display:flex;gap:14px}
.form-row .field{flex:1}
.actions{display:flex;gap:12px;justify-content:flex-end}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.stat-card{background:linear-gradient(135deg,#eef4ff,#f3eeff);border-radius:14px;padding:18px;text-align:center}
.stat-value{font-size:30px;font-weight:700;background:linear-gradient(135deg,#448aff,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.stat-label{font-size:13px;color:var(--muted);margin-top:4px}
.file-list{list-style:none}
.file-item{display:flex;align-items:center;justify-content:space-between;padding:16px;border-bottom:1px solid #f0f0f6;gap:12px}
.file-item:last-child{border-bottom:none}
.file-info{flex:1;min-width:0}
.file-name{font-weight:600;font-size:15px;display:flex;align-items:center;gap:8px}
.file-badge{font-size:11px;background:linear-gradient(135deg,#448aff,#7c4dff);color:#fff;border-radius:6px;padding:2px 8px;font-weight:600}
.file-url{font-size:12.5px;color:var(--primary);margin-top:3px;word-break:break-all;cursor:pointer}
.file-meta{font-size:12px;color:var(--muted);margin-top:2px}
.file-actions{display:flex;gap:8px;flex-shrink:0}
.empty{text-align:center;padding:40px 20px;color:var(--muted)}
.empty .icon{font-size:44px;opacity:.3;margin-bottom:10px}
.modal-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);display:none;align-items:center;justify-content:center;z-index:200;padding:20px}
.modal-mask.show{display:flex}
.modal{background:var(--surface);border-radius:20px;box-shadow:var(--shadow-lg);padding:28px;width:100%;max-width:560px;max-height:85vh;overflow-y:auto}
.modal-title{font-size:20px;font-weight:600;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between}
.modal-close{cursor:pointer;color:var(--muted);font-size:24px;background:none;border:none}
.modal-body pre{background:#f5f5fa;border-radius:12px;padding:16px;overflow-x:auto;font-family:"SF Mono",Consolas,monospace;font-size:13px;max-height:360px;overflow-y:auto;line-height:1.5;white-space:pre-wrap;word-break:break-all}
.login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
.login-card{background:var(--surface);border-radius:24px;box-shadow:var(--shadow-lg);padding:40px;width:100%;max-width:400px}
.login-logo{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#448aff,#7c4dff,#b388ff);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:30px;font-weight:700;box-shadow:0 8px 24px rgba(124,77,255,.4)}
.login-title{text-align:center;font-size:22px;font-weight:600}
.login-sub{text-align:center;color:var(--muted);font-size:13px;margin:6px 0 28px}
.login-error{color:var(--error);font-size:13px;text-align:center;margin-bottom:14px;min-height:18px}
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:#32313a;color:#fff;padding:14px 24px;border-radius:12px;font-size:14px;box-shadow:var(--shadow-lg);opacity:0;transition:all .3s;z-index:300;pointer-events:none}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.toast.success{background:linear-gradient(135deg,#2e7d32,#388e3c)}
.toast.error{background:linear-gradient(135deg,#c62828,#e53935)}
.loading{text-align:center;padding:40px;color:var(--muted)}
.spinner{width:34px;height:34px;border:3px solid #e4e4ef;border-top-color:var(--primary);border-radius:50%;margin:0 auto 12px;animation:spin .9s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@media (max-width:720px){.stats-grid{grid-template-columns:1fr}.form-row{flex-direction:column;gap:0}.topbar{flex-direction:column;align-items:flex-start;gap:14px}.file-item{flex-direction:column;align-items:flex-start}.file-actions{width:100%;flex-wrap:wrap}}
</style>
</head>
<body>
<div class="gradient-bar"></div>

<div id="loginView" class="login-wrap" style="display:none;">
  <div class="login-card">
    <div class="login-logo">CC</div>
    <div class="login-title">CloudCode 控制台</div>
    <div class="login-sub">代码托管管理后台</div>
    <div class="login-error" id="loginError"></div>
    <div class="field">
      <label>管理员密码</label>
      <input type="password" id="loginPw" placeholder="请输入管理密码" autocomplete="current-password">
    </div>
    <button class="btn-primary" style="width:100%;margin-top:8px;padding:12px" onclick="doLogin()">登 录</button>
  </div>
</div>

<div id="mainView" class="app" style="display:none;">
  <div class="topbar">
    <div class="brand">
      <div class="brand-icon">CC</div>
      <div>
        <div class="brand-title">CloudCode 控制台</div>
        <div class="brand-sub">代码托管与远程执行平台</div>
      </div>
    </div>
    <div class="top-actions">
      <button class="btn-secondary btn-sm" onclick="refreshAll()">刷新</button>
      <button class="btn-danger btn-sm" onclick="doLogout()">退出</button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:24px;">
    <div class="stat-card"><div class="stat-value" id="statFiles">-</div><div class="stat-label">文件总数</div></div>
    <div class="stat-card"><div class="stat-value" id="statMaxId">-</div><div class="stat-label">最大 ID</div></div>
    <div class="stat-card"><div class="stat-value" id="statReleased">-</div><div class="stat-label">已释放 ID</div></div>
  </div>

  <div class="card">
    <div class="card-title"><span class="dot"></span>上传代码文件</div>
    <div class="upload-zone" id="uploadZone">
      <div class="upload-icon">+</div>
      <div class="upload-text">点击选择文件，或拖拽文件到此处<br><strong>上传后将自动生成专属访问 URL</strong></div>
      <input type="file" id="fileInput" style="display:none;">
    </div>
    <div class="upload-form" id="uploadForm" style="display:none;">
      <div class="form-row">
        <div class="field"><label>文件名</label><input type="text" id="upFilename" placeholder="例如 script.js"></div>
        <div class="field"><label>备注说明</label><input type="text" id="upNote" placeholder="可选，用途说明"></div>
      </div>
      <div class="field"><label>代码内容</label><textarea id="upContent" placeholder="在此粘贴或编辑代码内容"></textarea></div>
      <div class="actions">
        <button class="btn-secondary" onclick="cancelUpload()">取 消</button>
        <button class="btn-primary" onclick="doUpload()">确认上传</button>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><span class="dot"></span>已托管文件</div>
    <div id="loadingBox" class="loading"><div class="spinner"></div>正在加载...</div>
    <ul class="file-list" id="fileList" style="display:none;"></ul>
    <div class="empty" id="emptyBox" style="display:none;"><div class="icon">-</div><div>暂无托管文件，请先上传</div></div>
  </div>
</div>

<!-- 详情 / 编辑对话框 -->
<div class="modal-mask" id="modalMask">
  <div class="modal">
    <div class="modal-title">
      <span id="modalTitle">文件详情</span>
      <button class="modal-close" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body" id="modalBody"></div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
var TOKEN = localStorage.getItem("cc_token") || "";
var API = "/admin/api";

function $(id){ return document.getElementById(id); }
function esc(s){
  var q = String.fromCharCode(34);
  var ent = "&" + "#34;";
  return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(new RegExp(q,"g"),ent);
}
function fmtSize(n){
  if(n < 1024) return n + " B";
  if(n < 1048576) return (n/1024).toFixed(1) + " KB";
  return (n/1048576).toFixed(2) + " MB";
}
function fmtTime(iso){
  try { var d = new Date(iso); return d.toLocaleString("zh-CN",{hour12:false}); } catch(e){ return iso; }
}
var toastTimer = null;
function toast(msg, type){
  var t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + (type||"");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function(){ t.className = "toast"; }, 2600);
}

function apiFetch(url, opts){
  opts = opts || {};
  opts.headers = opts.headers || {};
  opts.headers["Authorization"] = "Bearer " + TOKEN;
  if(opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)){
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  return fetch(API + url, opts).then(function(r){
    return r.json().catch(function(){ return {ok:false, message:"响应解析失败"}; });
  });
}

// 登录
function doLogin(){
  var pw = $("loginPw").value;
  $("loginError").textContent = "";
  if(!pw){ $("loginError").textContent = "请输入密码"; return; }
  fetch(API + "/login", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({password: pw})
  }).then(function(r){ return r.json(); }).then(function(res){
    if(res.ok){
      TOKEN = res.token;
      localStorage.setItem("cc_token", TOKEN);
      showMain();
    } else {
      $("loginError").textContent = res.message || "登录失败";
    }
  }).catch(function(){ $("loginError").textContent = "网络错误"; });
}

function doLogout(){
  apiFetch("/logout",{method:"POST"});
  TOKEN = "";
  localStorage.removeItem("cc_token");
  showLogin();
}

function showLogin(){
  $("loginView").style.display = "flex";
  $("mainView").style.display = "none";
  $("loginPw").value = "";
}
function showMain(){
  $("loginView").style.display = "none";
  $("mainView").style.display = "block";
  refreshAll();
}

// 上传文件选择
function setupUpload(){
  var zone = $("uploadZone");
  var input = $("fileInput");
  zone.addEventListener("click", function(){ input.click(); });
  input.addEventListener("change", function(){
    if(input.files && input.files[0]){
      var f = input.files[0];
      $("upFilename").value = f.name;
      var reader = new FileReader();
      reader.onload = function(){ $("upContent").value = reader.result; };
      reader.readAsText(f);
      $("uploadZone").style.display = "none";
      $("uploadForm").style.display = "block";
      input.value = "";
    }
  });
  // 拖拽
  zone.addEventListener("dragover", function(e){ e.preventDefault(); zone.classList.add("dragging"); });
  zone.addEventListener("dragleave", function(){ zone.classList.remove("dragging"); });
  zone.addEventListener("drop", function(e){
    e.preventDefault();
    zone.classList.remove("dragging");
    if(e.dataTransfer.files && e.dataTransfer.files[0]){
      var f = e.dataTransfer.files[0];
      $("upFilename").value = f.name;
      var reader = new FileReader();
      reader.onload = function(){ $("upContent").value = reader.result; };
      reader.readAsText(f);
      $("uploadZone").style.display = "none";
      $("uploadForm").style.display = "block";
    }
  });
}
function cancelUpload(){
  $("uploadForm").style.display = "none";
  $("uploadZone").style.display = "block";
  $("upContent").value = "";
  $("upNote").value = "";
}
function doUpload(){
  var filename = $("upFilename").value.trim() || "script.js";
  var content = $("upContent").value;
  var note = $("upNote").value.trim();
  if(!content || !content.trim()){ toast("代码内容不能为空","error"); return; }
  apiFetch("/upload", {
    method: "POST",
    body: { filename: filename, content: content, note: note }
  }).then(function(res){
    if(res.ok){
      toast("上传成功，专属 ID: " + res.id, "success");
      cancelUpload();
      refreshAll();
    } else {
      toast(res.message || "上传失败", "error");
    }
  });
}

// 刷新列表与统计
function refreshAll(){
  loadFiles();
  loadStats();
}
function loadStats(){
  apiFetch("/stats").then(function(res){
    if(res.ok){
      $("statFiles").textContent = res.stats.totalFiles;
      $("statMaxId").textContent = res.stats.maxId;
      $("statReleased").textContent = res.stats.released;
    }
  });
}
function loadFiles(){
  $("loadingBox").style.display = "block";
  $("fileList").style.display = "none";
  $("emptyBox").style.display = "none";
  apiFetch("/files").then(function(res){
    $("loadingBox").style.display = "none";
    if(!res.ok){ toast(res.message || "加载失败","error"); return; }
    var files = res.files || [];
    if(files.length === 0){
      $("emptyBox").style.display = "block";
      return;
    }
    $("fileList").style.display = "block";
    $("fileList").innerHTML = files.map(renderFile).join("");
  });
}
function renderFile(f){
  var base = location.origin + location.pathname.replace(/\/admin\/?$/,"");
  var url = base + "/" + f.id;
  var noteHtml = f.note ? '<div class="file-meta">备注: ' + esc(f.note) + '</div>' : "";
  return '<li class="file-item">' +
    '<div class="file-info">' +
      '<div class="file-name"><span class="file-badge">ID ' + esc(f.id) + '</span>' + esc(f.filename) + '</div>' +
      '<div class="file-url" title="点击复制" onclick="copyUrl(\'' + f.id + '\')">' + esc(url) + '</div>' +
      '<div class="file-meta">大小 ' + fmtSize(f.size) + ' · 创建 ' + fmtTime(f.created) + ' · 更新 ' + fmtTime(f.updated) + '</div>' +
      noteHtml +
    '</div>' +
    '<div class="file-actions">' +
      '<button class="btn-secondary btn-sm" onclick="viewFile(' + f.id + ')">查看</button>' +
      '<button class="btn-secondary btn-sm" onclick="editFile(' + f.id + ')">编辑</button>' +
      '<button class="btn-ghost btn-sm" onclick="copyUrl(' + f.id + ')">复制链接</button>' +
      '<button class="btn-danger btn-sm" onclick="deleteFile(' + f.id + ')">删除</button>' +
    '</div>' +
  '</li>';
}
function copyUrl(id){
  var base = location.origin + location.pathname.replace(/\/admin\/?$/,"");
  var url = base + "/" + id;
  if(navigator.clipboard){
    navigator.clipboard.writeText(url).then(function(){ toast("链接已复制","success"); }, function(){ prompt("复制链接:", url); });
  } else {
    prompt("复制链接:", url);
  }
}

// 查看详情
function viewFile(id){
  apiFetch("/files/" + id).then(function(res){
    if(!res.ok){ toast(res.message||"加载失败","error"); return; }
    var m = res.meta;
    var base = location.origin + location.pathname.replace(/\/admin\/?$/,"");
    var url = base + "/" + m.id;
    $("modalTitle").textContent = "文件详情 · ID " + m.id;
    $("modalBody").innerHTML =
      '<div class="field"><label>文件名</label><input type="text" value="' + esc(m.filename) + '" readonly></div>' +
      '<div class="field"><label>访问 URL（点击复制）</label><input type="text" value="' + esc(url) + '" readonly onclick="this.select();document.execCommand(\'copy\');toast(\'已复制\',\'success\')"></div>' +
      '<div class="field"><label>备注</label><input type="text" value="' + esc(m.note||"") + '" readonly></div>' +
      '<div class="field"><label>元信息</label><input type="text" value="大小 ' + fmtSize(m.size) + ' · 创建 ' + fmtTime(m.created) + ' · 更新 ' + fmtTime(m.updated) + '" readonly></div>';
    openModal();
  });
}

// 编辑
function editFile(id){
  apiFetch("/files/" + id).then(function(res){
    if(!res.ok){ toast(res.message||"加载失败","error"); return; }
    var m = res.meta;
    $("modalTitle").textContent = "编辑文件 · ID " + m.id;
    $("modalBody").innerHTML =
      '<div class="field"><label>文件名</label><input type="text" id="editFilename" value="' + esc(m.filename) + '"></div>' +
      '<div class="field"><label>备注说明</label><input type="text" id="editNote" value="' + esc(m.note||"") + '"></div>' +
      '<div class="field"><label>代码内容</label><textarea id="editContent" style="min-height:220px">' + esc(m.rawContent || "") + '</textarea></div>' +
      '<div class="actions"><button class="btn-secondary" onclick="closeModal()">取消</button><button class="btn-primary" onclick="saveEdit(' + id + ')">保存</button></div>';
    openModal();
    // 拉取原始内容填充
    fetch("/" + id).then(function(r){ return r.text(); }).then(function(txt){
      var ta = document.getElementById("editContent");
      if(ta) ta.value = txt;
    });
  });
}
function saveEdit(id){
  var filename = document.getElementById("editFilename").value.trim();
  var content = document.getElementById("editContent").value;
  var note = document.getElementById("editNote").value.trim();
  if(!content || !content.trim()){ toast("代码内容不能为空","error"); return; }
  apiFetch("/files/" + id, { method: "PUT", body: { filename: filename, content: content, note: note } })
    .then(function(res){
      if(res.ok){ toast("保存成功","success"); closeModal(); refreshAll(); }
      else { toast(res.message||"保存失败","error"); }
    });
}

// 删除（不释放 ID）
function deleteFile(id){
  if(!confirm("确认删除文件 ID " + id + "？\n删除后该 ID 将被保留，需手动释放才能复用。")) return;
  apiFetch("/files/" + id, { method: "DELETE" }).then(function(res){
    if(res.ok){ toast("已删除，ID " + id + " 已保留","success"); refreshAll(); }
    else { toast(res.message||"删除失败","error"); }
  });
}

// 释放 ID
function releaseId(id){
  if(!confirm("确认释放 ID " + id + "？\n释放后该 ID 将可被新文件复用。")) return;
  apiFetch("/release/" + id, { method: "POST" }).then(function(res){
    if(res.ok){ toast(res.message,"success"); refreshAll(); }
    else { toast(res.message||"释放失败","error"); }
  });
}

function openModal(){ $("modalMask").classList.add("show"); }
function closeModal(){ $("modalMask").classList.remove("show"); }
document.addEventListener("keydown", function(e){ if(e.key === "Escape") closeModal(); });
$("modalMask").addEventListener("click", function(e){ if(e.target === $("modalMask")) closeModal(); });

// 回车登录
$("loginPw").addEventListener("keydown", function(e){ if(e.key === "Enter") doLogin(); });

// 初始化
setupUpload();
if(TOKEN){ showMain(); } else { showLogin(); }
</script>
</body>
</html>
`;
}