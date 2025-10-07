// DOM 요소 선택
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const themeToggle = document.getElementById('theme-toggle');

// 통계 요소 선택
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const progressFillEl = document.getElementById('progress-fill');
const progressTextEl = document.getElementById('progress-text');

// 필터링 요소 선택
const filterButtons = document.querySelectorAll('.filter-btn');
let currentFilter = 'all';

// 작업 목록을 로컬스토리지에 저장하기 위한 키
const STORAGE_KEY = 'todoTasks';

// 고유 ID 생성을 위한 카운터
let taskIdCounter = 0;

// 테마 기능 초기화
function initTheme() {
    // 저장된 테마 설정 가져오기
    const savedTheme = localStorage.getItem('theme');
    // 시스템 다크모드 설정 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 다크모드 적용 조건: 저장된 설정이 'dark'이거나, 저장된 설정이 없고 시스템이 다크모드인 경우
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️'; // 다크모드일 때는 태양 아이콘
    } else {
        themeToggle.textContent = '🌙'; // 라이트모드일 때는 달 아이콘
    }
}

// 테마 토글 기능
function toggleTheme() {
    // 다크모드 클래스 토글하고 현재 상태 확인
    const isDark = document.body.classList.toggle('dark-mode');
    // 테마에 따라 버튼 아이콘 변경
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    // 선택한 테마를 로컬스토리지에 저장
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// 로컬스토리지에서 작업 목록 불러오기
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        const tasks = savedTasks ? JSON.parse(savedTasks) : [];

        // 레거시 호환성: 문자열 형태의 작업을 객체로 변환
        return tasks.map((task, index) => {
            if (typeof task === 'string') {
                return { id: index + 1, text: task, completed: false };
            }
            // ID가 없는 경우 추가
            if (!task.id) {
                task.id = index + 1;
            }
            return task;
        });
    } catch (error) {
        console.error('작업 목록 불러오기 실패:', error);
        return [];
    }
}

// 로컬스토리지에 작업 목록 저장하기
function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('작업 목록 저장 실패:', error);
    }
}

// ID 카운터 초기화 함수
function initTaskIdCounter() {
    const tasks = loadTasks();
    if (tasks.length > 0) {
        // 기존 작업 중 가장 큰 ID를 찾아서 카운터 설정
        taskIdCounter = Math.max(...tasks.map(task => task.id || 0));
    } else {
        taskIdCounter = 0;
    }
}

// 통계 업데이트 함수
function updateStats() {
    const tasks = loadTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    // 통계 숫자 업데이트
    totalTasksEl.textContent = totalTasks;
    completedTasksEl.textContent = completedTasks;
    pendingTasksEl.textContent = pendingTasks;

    // 진행률 바 및 텍스트 업데이트
    progressFillEl.style.width = `${progressPercentage}%`;
    progressTextEl.textContent = `${progressPercentage}%`;
}

// 저장된 작업들을 화면에 렌더링
function renderTasks() {
    const tasks = loadTasks();
    taskList.innerHTML = ''; // 기존 목록 초기화

    tasks.forEach((task) => {
        // 현재 필터에 맞는 작업만 표시
        if (shouldShowTask(task)) {
            createTaskElement(task.text, task.id, task.completed);
        }
    });

    // 통계 업데이트
    updateStats();
}

// 필터 조건에 맞는 작업인지 확인
function shouldShowTask(task) {
    switch (currentFilter) {
        case 'completed':
            return task.completed;
        case 'pending':
            return !task.completed;
        case 'all':
        default:
            return true;
    }
}

// 새로운 작업 요소 생성
function createTaskElement(taskText, taskId, completed = false) {
    const li = document.createElement('li');
    li.dataset.taskId = taskId; // 고유 ID를 data 속성으로 저장

    // 완료 상태에 따라 클래스 추가
    if (completed) {
        li.classList.add('completed');
    }

    li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
            <span>${taskText}</span>
        </div>
        <button class="delete-btn">삭제</button>
    `;

    // 애니메이션을 위한 초기 스타일 설정
    li.style.opacity = '0';
    li.style.transform = 'translateY(20px)';
    taskList.appendChild(li);

    // 페이드인 애니메이션 적용
    setTimeout(() => {
        li.style.opacity = '1';
        li.style.transform = 'translateY(0)';
    }, 10);

    // 체크박스 이벤트 리스너 추가
    li.querySelector('.task-checkbox').addEventListener('change', (e) => {
        toggleTaskCompletion(taskId, li, e.target.checked);
    });

    // 삭제 버튼 이벤트 리스너 추가
    li.querySelector('.delete-btn').addEventListener('click', () => {
        deleteTask(taskId, li);
    });
}

// 새로운 작업 추가 기능
function addTask() {
    const taskText = taskInput.value.trim(); // 입력값의 앞뒤 공백 제거

    if (taskText) {
        // 현재 저장된 작업 목록 가져오기
        const tasks = loadTasks();
        // 고유 ID 생성
        const newTaskId = ++taskIdCounter;
        // 새 작업 추가 (객체 형태로 저장)
        const newTask = { id: newTaskId, text: taskText, completed: false };
        tasks.push(newTask);
        // 로컬스토리지에 저장
        saveTasks(tasks);

        // 화면에 새 작업 요소 추가 (현재 필터에 맞는 경우만)
        if (shouldShowTask(newTask)) {
            createTaskElement(taskText, newTaskId, false);
        }

        // 통계 업데이트
        updateStats();

        // 입력 필드 초기화
        taskInput.value = '';
    }
}

// 작업 완료 상태 토글 기능
function toggleTaskCompletion(taskId, element, isCompleted) {
    // 현재 저장된 작업 목록 가져오기
    const tasks = loadTasks();

    // 해당 작업의 완료 상태 업데이트
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = isCompleted;

        // 로컬스토리지에 저장
        saveTasks(tasks);

        // UI 업데이트
        if (isCompleted) {
            element.classList.add('completed');
        } else {
            element.classList.remove('completed');
        }

        // 통계 업데이트
        updateStats();
    }
}

// 작업 삭제 기능
function deleteTask(taskId, element) {
    // 페이드아웃 애니메이션 적용
    element.style.opacity = '0';
    element.style.transform = 'translateX(100%)';

    // 애니메이션 완료 후 DOM에서 제거 및 로컬스토리지 업데이트
    setTimeout(() => {
        if (element.parentNode) {
            taskList.removeChild(element);
        }

        // 로컬스토리지에서 해당 작업 제거
        const tasks = loadTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks.splice(taskIndex, 1);
            saveTasks(tasks);
        }

        // 통계 업데이트
        updateStats();
    }, 300);
}

// 필터 변경 함수
function changeFilter(filter) {
    currentFilter = filter;

    // 모든 필터 버튼에서 active 클래스 제거
    filterButtons.forEach(btn => btn.classList.remove('active'));

    // 선택된 필터 버튼에 active 클래스 추가
    const activeButton = document.querySelector(`[data-filter="${filter}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // 작업 목록 다시 렌더링
    renderTasks();
}

// 이벤트 리스너 등록
themeToggle.addEventListener('click', toggleTheme);
addTaskBtn.addEventListener('click', addTask);

// Enter 키로 작업 추가 기능
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// 필터 버튼 이벤트 리스너
filterButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const filter = e.target.getAttribute('data-filter');
        changeFilter(filter);
    });
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    initTheme(); // 테마 초기화
    initTaskIdCounter(); // ID 카운터 초기화
    renderTasks(); // 저장된 작업 목록 렌더링
});