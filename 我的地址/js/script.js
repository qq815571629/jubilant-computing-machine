       // 资源加载检测
        window.addEventListener('error', function(e) {
            if (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT') {
                console.warn('资源加载失败，但系统仍可运行:', e.target.src || e.target.href);
            }
        }, true);
        
        // 如果XLSX库加载失败，显示提示但允许基本功能
        setTimeout(function() {
            if (typeof XLSX === 'undefined') {
                console.warn('XLSX库加载失败,文件上传功能将不可用');
                document.getElementById('fileInput').disabled = true;
                document.getElementById('fileInput').title = 'XLSX库加载失败,请检查网络连接';
            }
        }, 2000);
        // 密码验证和加密相关功能
        let userPassword = "123456"; // 默认用户密码
        let adminPassword = "123456.."; // 默认管理员密码
        let isAdmin = false;
        
        // 检查本地存储中是否有保存的密码
        if (localStorage.getItem('userPassword')) {
            userPassword = localStorage.getItem('userPassword');
        }
        
        if (localStorage.getItem('adminPassword')) {
            adminPassword = localStorage.getItem('adminPassword');
        }
        
        // 文件管理相关变量
        let uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
        let currentFilesData = JSON.parse(localStorage.getItem('currentFilesData') || '{}');
        
        // 检查用户密码
        function checkPassword() {
            const input = document.getElementById('loginPassword').value;
            if (input === userPassword) {
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('mainSystem').style.display = 'block';
                
                // 加载已保存的文件数据
                loadSavedFilesData();
            } else {
                alert('密码错误，请重试！');
            }
        }
        
        // 检查管理员密码
        function checkAdminPassword() {
            const input = document.getElementById('adminPassword').value;
            if (input === adminPassword) {
                document.getElementById('adminLoginContainer').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'flex';
                isAdmin = true;
                
                // 更新文件列表显示
                updateFileList();
            } else {
                alert('管理员密码错误，请重试！');
            }
        }
        
        // 显示管理员登录
        function showAdminLogin() {
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('adminLoginContainer').style.display = 'flex';
        }
        
        // 显示用户登录
        function showUserLogin() {
            document.getElementById('adminLoginContainer').style.display = 'none';
            document.getElementById('loginContainer').style.display = 'flex';
        }
        
        // 关闭管理员面板
        function closeAdminPanel() {
            document.getElementById('adminPanel').style.display = 'none';
            isAdmin = false;
        }
        
        // 修改用户密码
        function changeUserPassword() {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            const newPassword = prompt('请输入新的用户密码：');
            if (newPassword && newPassword.length >= 4) {
                userPassword = newPassword;
                localStorage.setItem('userPassword', newPassword);
                alert('用户密码修改成功！');
            } else {
                alert('密码长度不能少于4位！');
            }
        }
        
        // 修改管理员密码
        function changeAdminPassword() {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            const newPassword = prompt('请输入新的管理员密码：');
            if (newPassword && newPassword.length >= 4) {
                adminPassword = newPassword;
                localStorage.setItem('adminPassword', newPassword);
                alert('管理员密码修改成功！');
            } else {
                alert('密码长度不能少于4位！');
            }
        }
        
        // 导出数据
        function exportData() {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            // 这里可以实现数据导出功能
            alert('数据导出功能开发中...');
        }
        
        // 清除所有数据
        function clearAllData() {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
                localStorage.clear();
                scheduleData = [];
                classes = [];
                teachers = [];
                uploadedFiles = [];
                currentFilesData = {};
                document.getElementById('dataStatus').textContent = '数据已清除';
                updateFileList();
                alert('所有数据已清除！');
            }
        }
        
        // 查看源代码（需要密码）
        function viewCode() {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            const codePassword = prompt('请输入查看源代码的密码：');
            // 这里可以设置一个特殊的密码来查看源代码
            if (codePassword === '123456..') {
                // 在实际应用中，这里应该显示源代码
                // 但出于安全考虑，我们只显示一个提示
                alert('出于安全考虑，源代码查看功能已禁用。');
            } else {
                alert('密码错误！');
            }
        }
        
        // 文件管理功能
        function updateFileList() {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = '';
            
            if (uploadedFiles.length === 0) {
                fileList.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px;">暂无已保存的文件</div>';
                return;
            }
            
            uploadedFiles.forEach((fileInfo, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                fileItem.innerHTML = `
                    <div class="file-name">${fileInfo.name}</div>
                    <div class="file-actions">
                        <button class="file-action-btn load" onclick="loadFileData(${index})" title="加载此文件">
                            <i class="fas fa-folder-open"></i>
                        </button>
                        <button class="file-action-btn delete" onclick="deleteFile(${index})" title="删除此文件">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                fileList.appendChild(fileItem);
            });
        }
        
        function deleteFile(index) {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            if (confirm(`确定要删除文件 "${uploadedFiles[index].name}" 吗？`)) {
                // 从上传文件列表中删除
                uploadedFiles.splice(index, 1);
                
                // 从当前文件数据中删除
                delete currentFilesData[uploadedFiles[index]?.name];
                
                // 更新本地存储
                localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
                localStorage.setItem('currentFilesData', JSON.stringify(currentFilesData));
                
                // 更新文件列表显示
                updateFileList();
                
                alert('文件已删除！');
            }
        }
        
        function loadFileData(index) {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            const fileName = uploadedFiles[index].name;
            const fileData = currentFilesData[fileName];
            
            if (fileData) {
                // 使用文件数据初始化系统
                scheduleData = fileData.scheduleData || [];
                classes = fileData.classes || [];
                teachers = fileData.teachers || [];
                
                // 更新界面
                document.getElementById('fileName').textContent = fileName;
                document.getElementById('dataStatus').textContent = `已加载文件: ${fileName} (共${classes.length}个班级)`;
                populateClassSelect();
                
                alert(`文件 "${fileName}" 已加载！`);
            } else {
                alert('文件数据不存在！');
            }
        }
        
        function loadAllFiles() {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            // 合并所有文件的数据
            scheduleData = [];
            classes = [];
            teachers = [];
            
            uploadedFiles.forEach(fileInfo => {
                const fileData = currentFilesData[fileInfo.name];
                if (fileData) {
                    // 合并数据（这里简单合并，实际可能需要更复杂的逻辑）
                    scheduleData = scheduleData.concat(fileData.scheduleData || []);
                    classes = classes.concat(fileData.classes || []);
                    teachers = [...new Set([...teachers, ...(fileData.teachers || [])])];
                }
            });
            
            // 更新界面
            document.getElementById('fileName').textContent = `已加载 ${uploadedFiles.length} 个文件`;
            document.getElementById('dataStatus').textContent = `已加载 ${uploadedFiles.length} 个文件，共${classes.length}个班级`;
            populateClassSelect();
            
            alert(`已加载所有 ${uploadedFiles.length} 个文件！`);
        }
        
        function clearAllFiles() {
            if (!isAdmin) {
                alert('请先登录管理员账户！');
                return;
            }
            
            if (confirm('确定要清除所有已保存的文件吗？此操作不可恢复！')) {
                uploadedFiles = [];
                currentFilesData = {};
                
                // 更新本地存储
                localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
                localStorage.setItem('currentFilesData', JSON.stringify(currentFilesData));
                
                // 更新文件列表显示
                updateFileList();
                
                alert('所有文件已清除！');
            }
        }
        
        function loadSavedFilesData() {
            // 如果有保存的文件数据，加载第一个文件
            if (uploadedFiles.length > 0) {
                const firstFile = uploadedFiles[0];
                const fileData = currentFilesData[firstFile.name];
                
                if (fileData) {
                    scheduleData = fileData.scheduleData || [];
                    classes = fileData.classes || [];
                    teachers = fileData.teachers || [];
                    
                    document.getElementById('fileName').textContent = firstFile.name;
                    document.getElementById('dataStatus').textContent = `已加载文件: ${firstFile.name} (共${classes.length}个班级)`;
                    populateClassSelect();
                }
            }
        }
        
        // 支持按Enter键登录
        document.getElementById('loginPassword').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                checkPassword();
            }
        });
        
        document.getElementById('adminPassword').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                checkAdminPassword();
            }
        });
        
        // 以下是原系统的功能代码
        // 全局变量
        let scheduleData = []; // 存储解析后的课表数据
        let classes = []; // 存储班级列表
        let teachers = []; // 存储教师列表
        
        // 模式切换
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                document.querySelectorAll('.mode-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                document.getElementById(this.dataset.mode + 'Section').classList.add('active');
            });
        });
        
        // 文件上传处理
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            document.getElementById('fileName').textContent = file.name;
            document.getElementById('dataStatus').textContent = '正在解析数据...';
            
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, {type: 'array'});
                    
                    // 获取第一个工作表
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    // 将工作表转换为JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                    
                    // 解析数据
                    parseScheduleData(jsonData, file.name);
                    
                    document.getElementById('dataStatus').textContent = `数据加载成功！共解析 ${classes.length} 个班级的课表`;
                    
                    // 填充班级下拉框
                    populateClassSelect();
                    
                    // 保存文件数据
                    saveFileData(file.name);
                    
                } catch (error) {
                    console.error('解析Excel文件时出错:', error);
                    document.getElementById('dataStatus').textContent = '解析文件出错，请检查文件格式';
                }
            };
            reader.readAsArrayBuffer(file);
        });
        
        // 保存文件数据到本地存储
        function saveFileData(fileName) {
            // 检查是否已存在同名文件
            const existingFileIndex = uploadedFiles.findIndex(f => f.name === fileName);
            
            if (existingFileIndex === -1) {
                // 新文件，添加到列表
                uploadedFiles.push({
                    name: fileName,
                    uploadTime: new Date().toLocaleString()
                });
            } else {
                // 更新现有文件的上传时间
                uploadedFiles[existingFileIndex].uploadTime = new Date().toLocaleString();
            }
            
            // 保存文件数据
            currentFilesData[fileName] = {
                scheduleData: scheduleData,
                classes: classes,
                teachers: teachers,
                uploadTime: new Date().toLocaleString()
            };
            
            // 更新本地存储
            localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
            localStorage.setItem('currentFilesData', JSON.stringify(currentFilesData));
            
            // 如果是管理员界面打开，更新文件列表
            if (isAdmin) {
                updateFileList();
            }
        }
        
        // 解析课程安排数据
        function parseScheduleData(data, fileName) {
            // 清空现有数据
            scheduleData = [];
            classes = [];
            teachers = new Set();
            
            // 从第3行开始是数据（跳过标题行）
            for (let i = 3; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length === 0) continue;
                
                const className = row[0];
                if (!className) continue;
                
                classes.push(className);
                
                // 创建班级课表对象
                const classSchedule = {
                    "周一": {}, "周二": {}, "周三": {}, "周四": {}, "周五": {}
                };
                
                // 列索引映射
                // 周一: 1-9, 周二: 10-18, 周三: 19-27, 周四: 28-36, 周五: 37-45
                const dayMap = {
                    "周一": {start: 1, end: 9},
                    "周二": {start: 10, end: 18},
                    "周三": {start: 19, end: 27},
                    "周四": {start: 28, end: 36},
                    "周五": {start: 37, end: 45}
                };
                
                // 节次映射
                const periodMap = {
                    1: "上午_1", 2: "上午_2", 3: "上午_3", 4: "上午_4", 5: "上午_5",
                    6: "下午_6", 7: "下午_7", 8: "下午_8", 9: "下午_9"
                };
                
                // 填充课表数据
                for (const day in dayMap) {
                    const {start, end} = dayMap[day];
                    
                    for (let j = start; j <= end; j++) {
                        const periodIndex = j - start + 1;
                        const teacher = row[j] || "";
                        
                        if (teacher) {
                            classSchedule[day][periodMap[periodIndex]] = teacher;
                            teachers.add(teacher);
                        }
                    }
                }
                
                scheduleData.push(classSchedule);
            }
            
            // 将Set转换为数组
            teachers = Array.from(teachers).sort();
        }
        
        // 填充班级下拉框
        function populateClassSelect() {
            const classSelect = document.getElementById('className');
            classSelect.innerHTML = '<option value="">请选择班级</option>';
            
            classes.forEach(className => {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                classSelect.appendChild(option);
            });
        }
        
        // 查询班级课表
        function searchSchedule() {
            const className = document.getElementById('className').value;
            const resultDiv = document.getElementById('result');
            const printBtn = document.getElementById('printBtn');
            resultDiv.innerHTML = '';
            
            if (!className) {
                resultDiv.innerHTML = '<div class="no-result">请选择班级</div>';
                printBtn.disabled = true;
                return;
            }
            
            // 获取班级索引
            const classIndex = classes.indexOf(className);
            if (classIndex === -1) {
                resultDiv.innerHTML = '<div class="no-result">未找到该班级</div>';
                printBtn.disabled = true;
                return;
            }
            
            // 获取该班级的课表数据
            const classSchedule = scheduleData[classIndex];
            
            // 创建课表数据结构：9节课x5天
            const scheduleMatrix = Array(9).fill().map(() => Array(5).fill(null));
            
            // 映射星期几到索引
            const dayMap = {'周一': 0, '周二': 1, '周三': 2, '周四': 3, '周五': 4};
            
            // 映射节次到索引
            const periodMap = {
                '上午_1': 0, '上午_2': 1, '上午_3': 2, '上午_4': 3, '上午_5': 4,
                '下午_6': 5, '下午_7': 6, '下午_8': 7, '下午_9': 8
            };
            
            // 填充课表数据
            for (const day in classSchedule) {
                const dayIndex = dayMap[day];
                
                for (const period in classSchedule[day]) {
                    const teacher = classSchedule[day][period];
                    const periodIndex = periodMap[period];
                    
                    if (periodIndex !== undefined && dayIndex !== undefined) {
                        scheduleMatrix[periodIndex][dayIndex] = teacher;
                    }
                }
            }
            
            // 创建表格
            const table = document.createElement('table');
            table.className = 'schedule-table';
            
            // 创建表头
            const thead = document.createElement('thead');
            let headerRow = document.createElement('tr');
            
            const timeHeader = document.createElement('th');
            timeHeader.className = 'period-header';
            timeHeader.textContent = '时间';
            headerRow.appendChild(timeHeader);
            
            ['星期一', '星期二', '星期三', '星期四', '星期五'].forEach(day => {
                const th = document.createElement('th');
                th.textContent = day;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // 创建表格主体
            const tbody = document.createElement('tbody');
            const periodLabels = [
                '上午第1节', '上午第2节', '上午第3节', '上午第4节', '上午第5节',
                '下午第6节', '下午第7节', '下午第8节', '下午第9节'
            ];
            
            for (let i = 0; i < scheduleMatrix.length; i++) {
                const row = document.createElement('tr');
                
                // 时间段标题
                const periodCell = document.createElement('td');
                periodCell.className = 'time-header';
                periodCell.textContent = periodLabels[i];
                row.appendChild(periodCell);
                
                // 课程单元格
                for (let j = 0; j < scheduleMatrix[i].length; j++) {
                    const cell = document.createElement('td');
                    if (scheduleMatrix[i][j] && scheduleMatrix[i][j] !== "NaN") {
                        cell.className = 'teacher-cell';
                        cell.textContent = scheduleMatrix[i][j];
                    } else {
                        cell.className = 'no-class';
                        cell.textContent = '-';
                    }
                    row.appendChild(cell);
                }
                
                tbody.appendChild(row);
            }
            
            table.appendChild(tbody);
            
            const heading = document.createElement('h2');
            heading.innerHTML = `<span class="class-name">${className}</span> 的课表`;
            resultDiv.appendChild(heading);
            
            const printNote = document.createElement('div');
            printNote.className = 'print-only';
            printNote.textContent = `班级: ${className} | 生成时间: ${new Date().toLocaleString()}`;
            resultDiv.appendChild(printNote);
            
            resultDiv.appendChild(table);
            printBtn.disabled = false;
        }
        
        // 查询教师任课安排
        function searchTeacherSchedule() {
            const teacherName = document.getElementById('teacherName').value.trim();
            const resultDiv = document.getElementById('teacherResult');
            const printBtn = document.getElementById('printTeacherBtn');
            resultDiv.innerHTML = '';
            
            if (!teacherName) {
                resultDiv.innerHTML = '<div class="no-result">请输入教师姓名</div>';
                printBtn.disabled = true;
                return;
            }
            
            // 查找教师任课安排
            const teacherSchedule = {};
            
            // 初始化教师课表结构
            const days = ['周一', '周二', '周三', '周四', '周五'];
            const periods = ['上午_1', '上午_2', '上午_3', '上午_4', '上午_5', '下午_6', '下午_7', '下午_8', '下午_9'];
            
            days.forEach(day => {
                teacherSchedule[day] = {};
                periods.forEach(period => {
                    teacherSchedule[day][period] = [];
                });
            });
            
            // 遍历所有班级的课表，查找该教师的任课
            for (let i = 0; i < classes.length; i++) {
                const className = classes[i];
                const classSchedule = scheduleData[i];
                
                for (const day in classSchedule) {
                    for (const period in classSchedule[day]) {
                        if (classSchedule[day][period] === teacherName) {
                            teacherSchedule[day][period].push(className);
                        }
                    }
                }
            }
            
            // 创建教师任课表格
            const table = document.createElement('table');
            table.className = 'schedule-table';
            
            // 创建表头
            const thead = document.createElement('thead');
            let headerRow = document.createElement('tr');
            
            const timeHeader = document.createElement('th');
            timeHeader.className = 'period-header';
            timeHeader.textContent = '时间';
            headerRow.appendChild(timeHeader);
            
            ['星期一', '星期二', '星期三', '星期四', '星期五'].forEach(day => {
                const th = document.createElement('th');
                th.textContent = day;
                headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // 创建表格主体
            const tbody = document.createElement('tbody');
            const periodLabels = [
                '上午第1节', '上午第2节', '上午第3节', '上午第4节', '上午第5节',
                '下午第6节', '下午第7节', '下午第8节', '下午第9节'
            ];
            
            const periodMap = {
                '上午_1': 0, '上午_2': 1, '上午_3': 2, '上午_4': 3, '上午_5': 4,
                '下午_6': 5, '下午_7': 6, '下午_8': 7, '下午_9': 8
            };
            
            const dayMap = {'周一': 0, '周二': 1, '周三': 2, '周四': 3, '周五': 4};
            
            for (let i = 0; i < periods.length; i++) {
                const row = document.createElement('tr');
                
                // 时间段标题
                const periodCell = document.createElement('td');
                periodCell.className = 'time-header';
                periodCell.textContent = periodLabels[i];
                row.appendChild(periodCell);
                
                // 课程单元格
                for (let j = 0; j < days.length; j++) {
                    const cell = document.createElement('td');
                    const classesForPeriod = teacherSchedule[days[j]][periods[i]];
                    
                    if (classesForPeriod.length > 0) {
                        cell.className = 'class-cell';
                        cell.textContent = classesForPeriod.join(', ');
                    } else {
                        cell.className = 'no-class';
                        cell.textContent = '-';
                    }
                    row.appendChild(cell);
                }
                
                tbody.appendChild(row);
            }
            
            table.appendChild(tbody);
            
            const heading = document.createElement('h2');
            heading.innerHTML = `<span class="teacher-name">${teacherName}</span> 的任课安排`;
            resultDiv.appendChild(heading);
            
            const printNote = document.createElement('div');
            printNote.className = 'print-only';
            printNote.textContent = `教师: ${teacherName} | 生成时间: ${new Date().toLocaleString()}`;
            resultDiv.appendChild(printNote);
            
            resultDiv.appendChild(table);
            printBtn.disabled = false;
        }
        
        // 清除班级搜索
        function clearSearch() {
            document.getElementById('className').value = '';
            document.getElementById('result').innerHTML = '';
            document.getElementById('printBtn').disabled = true;
        }
        
        // 清除教师搜索
        function clearTeacherSearch() {
            document.getElementById('teacherName').value = '';
            document.getElementById('teacherResult').innerHTML = '';
            document.getElementById('printTeacherBtn').disabled = true;
        }
        
        // 打印班级课表
        function printSchedule() {
            window.print();
        }
        
        // 打印教师课表
        function printTeacherSchedule() {
            window.print();
        }
        
        // 支持按Enter键搜索
        document.getElementById('className').addEventListener('change', searchSchedule);
        document.getElementById('teacherName').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchTeacherSchedule();
            }
        });
        
        // 初始化示例数据（如果没有上传文件时使用）
        function initSampleData() {
            // 这里可以添加示例数据，但为了简洁，我们留空
            // 用户需要上传Excel文件才能使用系统
        }
        
        // 页面加载时初始化
        window.onload = initSampleData;