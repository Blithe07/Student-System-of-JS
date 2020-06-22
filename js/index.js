var tableData = [];
var nowPage = 1;
var pageSize = 5;
var allPage =1;
var modal = document.getElementsByClassName('modal')[0];
var editForm = document.getElementById('student-edit-form');
	var tBody = document.getElementById('tBody');
// 为页面添加事件
function bindEvent() {
	var menuList = document.getElementsByClassName('menu')[0];
	menuList.onclick = function(e) {
		if (e.target.tagName === 'DD') {
			// 循环菜单栏  使所有含有active的元素的class 去掉
			changeStyle(e.target)
			var id = e.target.getAttribute('data-id');
			// 对应的右侧内容显示出来并且让其他内容隐藏
			var showContent = document.getElementById(id);
			changeStyle(showContent);
		}
	}
	var studentAddBtn = document.getElementById('student-add-submit');
	studentAddBtn.onclick = function() {
		// 获取新增表单数据
		var form = document.getElementById('student-add-form');
		var data = getFormData(form);
		if (data) {
			transferData('/api/student/addStudent', data, function() {
				alert('新增学生成功');
				var form = document.getElementById('student-add-form');
				form.reset();
				getTableData();
				var studentListDom = menuList.getElementsByTagName('dd')[0];
				studentListDom.click();
			})
		}
		return false;
	}
	//编辑或者删除功能
	tBody.onclick = function(e) {
		if (e.target.classList.contains('edit')) {
			modal.style.display = 'block';
			var index = e.target.dataset.index;
			renderForm(tableData[index]);
		} else if (e.target.classList.contains('del')) {
			var isDel = confirm("确定要删除吗？");
			if(isDel){
				var index = e.target.dataset.index;
				transferData("/api/student/delBySno",{
					sNo : tableData[index].sNo
				},function(){
					alert("删除成功");
					getTableData();
				})
			}
		}
	}
	var studentEditBtn = document.getElementById('student-edit-submit');
	studentEditBtn.onclick = function(e) {
		var data = getFormData(editForm);
		e.preventDefault();
		if (data) {
			transferData("/api/student/updateStudent", data, function() {
				alert("修改成功");
				modal.style.display = 'none';
				getTableData();
			})
		}
	}
	modal.onclick = function(e){
		if(e.target == this){
			modal.style.display = "none";
		}
	}
	var turnPage = document.getElementsByClassName('turn-page')[0];
	turnPage.onclick = function(e){
		if(e.target.id == 'next-btn'){
			nowPage++;
			getTableData();
		}else if(e.target.id == 'prev-btn'){
			nowPage--;
			getTableData();
		}
	}
}
// 获取所有的兄弟节点
function getSiblings(node) {
	var parent = node.parentNode;
	var children = parent.children;
	var result = [];
	for (var i = 0; i < children.length; i++) {
		if (children[i] != node) {
			result.push(children[i]);
		}
	}
	return result;
}
// 左右两边切换样式功能
function changeStyle(node) {
	var siblingsMenu = getSiblings(node);
	for (var i = 0; i < siblingsMenu.length; i++) {
		siblingsMenu[i].classList.remove('active');
	}
	node.classList.add('active');
}

// 获取表单数据  
function getFormData(form) {

	var name = form.name.value;
	var sex = form.sex.value;
	var number = form.sNo.value;
	var birth = form.birth.value;
	var phone = form.phone.value;
	var address = form.address.value;
	var email = form.email.value;
	if (!name || !number || !birth || !phone || !address || !email) {
		alert('信息填写不完全请检查后提交');
		return false;
	}
	
	return {
		sNo: number,
		name: name,
		sex: sex,
		birth: birth,
		phone: phone,
		email: email,
		address: address
	}
}

// 数据交互函数
function transferData(url, data, success) {
	data.appkey = "a1302268_1586566328857";
	var result = saveData('http://open.duyiedu.com' + url, data);
	if (result.status == 'success') {
		success(result.data)
	} else {
		alert(result.msg)
	}
}

// 获取学生列表数据
function getTableData() {
	transferData('/api/student/findByPage', {
		page: nowPage,
		size: pageSize
	}, function(data) {
		allPage = Math.ceil(data.cont/pageSize);
		tableData = data.findByPage;
		renderTable(data.findByPage);
	})
}
// 渲染表格数据
function renderTable(data) {
	var str = "";
	data.forEach(function(item, index) {
		str +=
			`<tr>
        <td>${item.sNo}</td>
        <td>${item.name}</td>
        <td>${item.sex == 0 ? '男' : '女'}</td>
        <td>${item.email}</td>
        <td>${(new Date().getFullYear() - item.birth)}</td>
        <td>${item.phone}</td>
        <td>${item.address}</td>
        <td>
            <button class="edit btn" data-index=${index}>编辑</button>
            <button class="del btn" data-index=${index}>删除</button>
        </td>
    </tr>`
	});
	tBody.innerHTML = str;
	var nextPage = document.getElementById('next-btn');
	var prevPage = document.getElementById('prev-btn');
	if(allPage > nowPage){
		nextPage.style.display = 'inline-block';
	}else{
		nextPage.style.display = 'none';
	}
	if(nowPage > 1){
		prevPage.style.display = 'inline-block'; 
	}else{
		prevPage.style.display = 'none';
	}
}
//数据回填编辑表格中
function renderForm(data) {
	for (var prop in data) {
		if (editForm[prop]) {
			editForm[prop].value = data[prop];
		}
	}
}
// 向后端存储数据
function saveData(url, param) {
	var result = null;
	var xhr = null;
	if (window.XMLHttpRequest) {
		xhr = new XMLHttpRequest();
	} else {
		xhr = new ActiveXObject('Microsoft.XMLHTTP');
	}
	if (typeof param == 'string') {
		xhr.open('GET', url + '?' + param, false);
	} else if (typeof param == 'object') {
		var str = "";
		for (var prop in param) {
			str += prop + '=' + param[prop] + '&';
		}
		xhr.open('GET', url + '?' + str, false);
	} else {
		xhr.open('GET', url + '?' + param.toString(), false);
	}
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				result = JSON.parse(xhr.responseText);
			}
		}
	}
	xhr.send();
	return result;
}

bindEvent();
document.getElementsByClassName('active')[0].click()
getTableData()
