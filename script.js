let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = null;
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

const MAX_QUOTA_PER_ROOM = 5;
const rooms = {
  '診間 1': { doctor: '張醫師', time: '上午', currentQuota: 0 },
  '診間 2': { doctor: '李醫師', time: '下午', currentQuota: 0 }
};

let currentSlide = 0;
let autoSlideInterval;

document.getElementById('login-tab').addEventListener('click', () => {
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-tab').classList.add('bg-blue-500', 'text-white');
  document.getElementById('register-tab').classList.remove('bg-blue-500', 'text-white');
  document.getElementById('register-tab').classList.add('bg-gray-300', 'text-black');
});

document.getElementById('register-tab').addEventListener('click', () => {
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-tab').classList.add('bg-blue-500', 'text-white');
  document.getElementById('login-tab').classList.remove('bg-blue-500', 'text-white');
  document.getElementById('login-tab').classList.add('bg-gray-300', 'text-black');
});

function validateIdNumber(idNumber) {
  const idPattern = /^[A-Z][0-9]{9}$/;
  return idPattern.test(idNumber);
}

function validateHealthCard(healthCard) {
  const healthCardPattern = /^[0-9]{12}$/;
  return healthCardPattern.test(healthCard);
}

function validateHeight(height) {
  const h = parseFloat(height);
  return !isNaN(h) && h > 0 && h <= 300;
}

function validateWeight(weight) {
  const w = parseFloat(weight);
  return !isNaN(w) && w > 0 && w <= 500;
}

function validateBirthdate(birthdate) {
  const date = new Date(birthdate);
  const now = new Date();
  return date instanceof Date && !isNaN(date) && date <= now;
}

function handleRegister() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const phone = document.getElementById('register-phone').value;
  const idNumber = document.getElementById('register-idnumber').value;
  const healthCard = document.getElementById('register-healthcard').value;
  const height = document.getElementById('register-height').value;
  const weight = document.getElementById('register-weight').value;
  const birthdate = document.getElementById('register-birthdate').value;

  if (username && password && phone && idNumber && healthCard && height && weight && birthdate) {
    if (!validateIdNumber(idNumber)) {
      alert('身分證字號格式錯誤！請輸入正確格式（例如：A123456789）');
      return;
    }

    if (!validateHealthCard(healthCard)) {
      alert('健保卡號格式錯誤！請輸入12位數字。');
      return;
    }

    if (!validateHeight(height)) {
      alert('身高應為正數且不超過300公分！');
      return;
    }

    if (!validateWeight(weight)) {
      alert('體重應為正數且不超過500公斤！');
      return;
    }

    if (!validateBirthdate(birthdate)) {
      alert('出生年月日無效或晚於當前日期！');
      return;
    }

    if (users.find(user => user.username === username)) {
      alert('用戶名已存在！');
      return;
    }

    if (users.find(user => user.idNumber === idNumber)) {
      alert('此身分證字號已被註冊！');
      return;
    }

    if (users.find(user => user.healthCard === healthCard)) {
      alert('此健保卡號已被註冊！');
      return;
    }

    users.push({ username, password, phone, idNumber, healthCard, height, weight, birthdate });
    localStorage.setItem('users', JSON.stringify(users));
    alert('註冊成功！請登錄。');
    document.getElementById('login-tab').click();
  } else {
    alert('請填寫所有欄位！');
  }
}

function handleLogin() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const user = users.find(user => user.username === username && user.password === password);
  if (user) {
    currentUser = user;
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('home-page').classList.remove('hidden');
    initializeQuotas();
    updateCurrentCall();
    startAutoSlide();
  } else {
    alert('用戶名或密碼錯誤！');
  }
}

function initializeQuotas() {
  rooms['診間 1'].currentQuota = 0;
  rooms['診間 2'].currentQuota = 0;

  appointments.forEach(appointment => {
    if (appointment.status === '待審核') {
      let roomKey = null;
      if (appointment.doctor === '張醫師' && appointment.time === '上午') {
        roomKey = '診間 1';
      } else if (appointment.doctor === '李醫師' && appointment.time === '下午') {
        roomKey = '診間 2';
      }
      if (roomKey && rooms[roomKey]) {
        rooms[roomKey].currentQuota++;
      }
    }
  });

  document.getElementById('room1-quota').textContent = MAX_QUOTA_PER_ROOM - rooms['診間 1'].currentQuota;
  document.getElementById('room2-quota').textContent = MAX_QUOTA_PER_ROOM - rooms['診間 2'].currentQuota;
}

function checkRoomQuota(doctor, time) {
  let roomKey = null;
  if (doctor === '張醫師' && time === '上午') {
    roomKey = '診間 1';
  } else if (doctor === '李醫師' && time === '下午') {
    roomKey = '診間 2';
  }

  if (roomKey && rooms[roomKey].currentQuota >= MAX_QUOTA_PER_ROOM) {
    return false;
  }
  return true;
}

function updateQuotaOnAppointment(doctor, time) {
  let roomKey = null;
  if (doctor === '張醫師' && time === '上午') {
    roomKey = '診間 1';
  } else if (doctor === '李醫師' && time === '下午') {
    roomKey = '診間 2';
  }

  if (roomKey) {
    rooms[roomKey].currentQuota++;
    if (roomKey === '診間 1') {
      document.getElementById('room1-quota').textContent = MAX_QUOTA_PER_ROOM - rooms['診間 1'].currentQuota;
    } else if (roomKey === '診間 2') {
      document.getElementById('room2-quota').textContent = MAX_QUOTA_PER_ROOM - rooms['診間 2'].currentQuota;
    }
  }
}

function handleAppointment() {
  const department = document.getElementById('department').value;
  const doctor = document.getElementById('doctor').value;
  const date = document.getElementById('appointment-date').value;
  const time = document.getElementById('appointment-time').value;

  if (department && doctor && date && time) {
    if (!checkRoomQuota(doctor, time)) {
      alert('該診間預約人數已滿，請選擇其他醫師或時段！');
      return;
    }

    const appointment = { 
      username: currentUser.username, 
      department, 
      doctor, 
      date, 
      time, 
      status: '待審核',
      callNumber: generateCallNumber()
    };
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    alert(`預約成功！\n科別：${department}\n醫師：${doctor}\n日期：${date}\n時段：${time}\n叫號：${appointment.callNumber}`);
    
    updateQuotaOnAppointment(doctor, time);
    showRecords();
    updateCurrentCall();
  } else {
    alert('請填寫所有欄位！');
  }
}

function generateCallNumber() {
  const lastAppointment = appointments[appointments.length - 1];
  if (!lastAppointment || !lastAppointment.callNumber) {
    return 'A001';
  }
  const lastNumber = parseInt(lastAppointment.callNumber.slice(1)) + 1;
  return `A${lastNumber.toString().padStart(3, '0')}`;
}

function updateCurrentCall() {
  const pendingAppointments = appointments.filter(appointment => appointment.status === '待審核');
  if (pendingAppointments.length > 0) {
    document.getElementById('room1-call').textContent = pendingAppointments[0].callNumber;
    document.getElementById('room2-call').textContent = pendingAppointments[0].callNumber;
  } else {
    document.getElementById('room1-call').textContent = '無';
    document.getElementById('room2-call').textContent = '無';
  }
}

function cancelAppointment(index) {
  if (confirm('確定要取消此預約嗎？')) {
    const appointment = appointments[index];
    let roomKey = null;
    if (appointment.doctor === '張醫師' && appointment.time === '上午') {
      roomKey = '診間 1';
    } else if (appointment.doctor === '李醫師' && appointment.time === '下午') {
      roomKey = '診間 2';
    }
    if (roomKey && appointment.status === '待審核') {
      rooms[roomKey].currentQuota--;
      if (roomKey === '診間 1') {
        document.getElementById('room1-quota').textContent = MAX_QUOTA_PER_ROOM - rooms['診間 1'].currentQuota;
      } else if (roomKey === '診間 2') {
        document.getElementById('room2-quota').textContent = MAX_QUOTA_PER_ROOM - rooms['診間 2'].currentQuota;
      }
    }
    appointments[index].status = '已取消';
    localStorage.setItem('appointments', JSON.stringify(appointments));
    showRecords();
    updateCurrentCall();
    alert('預約已取消！');
  }
}

function handleLogout() {
  currentUser = null;
  document.getElementById('auth-page').classList.remove('hidden');
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('appointment-section').classList.add('hidden');
  document.getElementById('records-section').classList.add('hidden');
  document.getElementById('doctors-section').classList.add('hidden');
  document.getElementById('profile-section').classList.add('hidden');
  document.getElementById('login-tab').click();
  document.getElementById('account-toggle').checked = false;
  document.getElementById('notification-toggle').checked = false;
  stopAutoSlide();
}

function showAppointment() {
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('appointment-section').classList.remove('hidden');
  document.getElementById('records-section').classList.add('hidden');
  document.getElementById('doctors-section').classList.add('hidden');
  document.getElementById('profile-section').classList.add('hidden');
  document.getElementById('account-toggle').checked = false;
  document.getElementById('notification-toggle').checked = false;
  stopAutoSlide();
}

function showRecords() {
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('appointment-section').classList.add('hidden');
  document.getElementById('records-section').classList.remove('hidden');
  document.getElementById('doctors-section').classList.add('hidden');
  document.getElementById('profile-section').classList.add('hidden');

  const recordsBody = document.getElementById('records-body');
  recordsBody.innerHTML = '';

  const userAppointments = appointments.filter(appointment => appointment.username === currentUser.username);
  if (userAppointments.length === 0) {
    recordsBody.innerHTML = '<tr><td colspan="7" class="border p-2 text-center">暫無掛號紀錄。</td></tr>';
  } else {
    userAppointments.forEach((appointment, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="border p-2">${appointment.username}</td>
        <td class="border p-2">${appointment.department}</td>
        <td class="border p-2">${appointment.doctor}</td>
        <td class="border p-2">${appointment.date}</td>
        <td class="border p-2">${appointment.time}</td>
        <td class="border p-2">${appointment.status}</td>
        <td class="border p-2">
          ${appointment.status === '待審核' ? `<button onclick="cancelAppointment(${index})" class="px-2 py-1 bg-red-500 text-white rounded text-lg">取消</button>` : '-'}
        </td>
      `;
      recordsBody.appendChild(row);
    });
  }
  document.getElementById('account-toggle').checked = false;
  document.getElementById('notification-toggle').checked = false;
  stopAutoSlide();
}

function showDoctors() {
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('appointment-section').classList.add('hidden');
  document.getElementById('records-section').classList.add('hidden');
  document.getElementById('doctors-section').classList.remove('hidden');
  document.getElementById('profile-section').classList.add('hidden');
  document.getElementById('account-toggle').checked = false;
  document.getElementById('notification-toggle').checked = false;
  stopAutoSlide();
}

function showProfile() {
  document.getElementById('home-page').classList.add('hidden');
  document.getElementById('appointment-section').classList.add('hidden');
  document.getElementById('records-section').classList.add('hidden');
  document.getElementById('doctors-section').classList.add('hidden');
  document.getElementById('profile-section').classList.remove('hidden');
  updateProfileDisplay();
  const appointmentQueryBody = document.getElementById('appointment-query-body');
  appointmentQueryBody.innerHTML = '';

  const userAppointments = appointments.filter(appointment => appointment.username === currentUser.username);
  if (userAppointments.length === 0) {
    appointmentQueryBody.innerHTML = '<tr><td colspan="5" class="border p-2 text-center">暫無預約記錄。</td></tr>';
  } else {
    userAppointments.forEach(appointment => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="border p-2">${appointment.department}</td>
        <td class="border p-2">${appointment.doctor}</td>
        <td class="border p-2">${appointment.date}</td>
        <td class="border p-2">${appointment.time}</td>
        <td class="border p-2">${appointment.status}</td>
      `;
      appointmentQueryBody.appendChild(row);
    });
  }
  document.getElementById('account-toggle').checked = false;
  document.getElementById('notification-toggle').checked = false;
  stopAutoSlide();
}

function updateProfileDisplay() {
  document.getElementById('profile-username').textContent = currentUser.username;
  document.getElementById('profile-phone').textContent = currentUser.phone;
  document.getElementById('profile-idnumber').textContent = currentUser.idNumber;
  document.getElementById('profile-healthcard').textContent = currentUser.healthCard;
  document.getElementById('profile-height').textContent = currentUser.height;
  document.getElementById('profile-weight').textContent = currentUser.weight;
  document.getElementById('profile-birthdate').textContent = currentUser.birthdate;
}

function showEditProfileForm() {
  const formHTML = `
    <div class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">編輯基本資料</h2>
        <div class="mb-4">
          <label class="block text-sm font-medium">用戶名</label>
          <input type="text" id="edit-username" class="w-full p-3 border rounded text-lg" value="${currentUser.username}">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium">電話</label>
          <input type="text" id="edit-phone" class="w-full p-3 border rounded text-lg" value="${currentUser.phone}">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium">身分證字號</label>
          <input type="text" id="edit-idnumber" class="w-full p-3 border rounded text-lg" value="${currentUser.idNumber}">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium">健保卡號</label>
          <input type="text" id="edit-healthcard" class="w-full p-3 border rounded text-lg" value="${currentUser.healthCard}">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium">身高 (公分)</label>
          <input type="number" id="edit-height" class="w-full p-3 border rounded text-lg" value="${currentUser.height}">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium">體重 (公斤)</label>
          <input type="number" id="edit-weight" class="w-full p-3 border rounded text-lg" value="${currentUser.weight}">
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium">出生年月日</label>
          <input type="date" id="edit-birthdate" class="w-full p-3 border rounded text-lg" value="${currentUser.birthdate}">
        </div>
        <div class="flex justify-end space-x-2">
          <button onclick="saveProfileChanges()" class="px-4 py-2 bg-blue-500 text-white rounded text-lg">儲存</button>
          <button onclick="closeEditProfileForm()" class="px-4 py-2 bg-gray-300 text-black rounded text-lg">取消</button>
        </div>
      </div>
    </div>
  `;
  const formContainer = document.createElement('div');
  formContainer.id = 'edit-profile-form';
  formContainer.innerHTML = formHTML;
  document.body.appendChild(formContainer);
}

function closeEditProfileForm() {
  const formContainer = document.getElementById('edit-profile-form');
  if (formContainer) {
    formContainer.remove();
  }
}

function saveProfileChanges() {
  const newUsername = document.getElementById('edit-username').value;
  const newPhone = document.getElementById('edit-phone').value;
  const newIdNumber = document.getElementById('edit-idnumber').value;
  const newHealthCard = document.getElementById('edit-healthcard').value;
  const newHeight = document.getElementById('edit-height').value;
  const newWeight = document.getElementById('edit-weight').value;
  const newBirthdate = document.getElementById('edit-birthdate').value;

  if (newUsername && newPhone && newIdNumber && newHealthCard && newHeight && newWeight && newBirthdate) {
    if (!validateIdNumber(newIdNumber)) {
      alert('身分證字號格式錯誤！請輸入正確格式（例如：A123456789）');
      return;
    }

    if (!validateHealthCard(newHealthCard)) {
      alert('健保卡號格式錯誤！請輸入12位數字。');
      return;
    }

    if (!validateHeight(newHeight)) {
      alert('身高應為正數且不超過300公分！');
      return;
    }

    if (!validateWeight(newWeight)) {
      alert('體重應為正數且不超過500公斤！');
      return;
    }

    if (!validateBirthdate(newBirthdate)) {
      alert('出生年月日無效或晚於當前日期！');
      return;
    }

    const otherUsers = users.filter(user => user.username !== currentUser.username);
    if (otherUsers.find(user => user.username === newUsername)) {
      alert('用戶名已存在！');
      return;
    }

    if (otherUsers.find(user => user.idNumber === newIdNumber)) {
      alert('此身分證字號已被使用！');
      return;
    }

    if (otherUsers.find(user => user.healthCard === newHealthCard)) {
      alert('此健保卡號已被使用！');
      return;
    }

    const userIndex = users.findIndex(user => user.username === currentUser.username);
    const oldUsername = currentUser.username;

    users[userIndex].username = newUsername;
    users[userIndex].phone = newPhone;
    users[userIndex].idNumber = newIdNumber;
    users[userIndex].healthCard = newHealthCard;
    users[userIndex].height = newHeight;
    users[userIndex].weight = newWeight;
    users[userIndex].birthdate = newBirthdate;

    currentUser.username = newUsername;
    currentUser.phone = newPhone;
    currentUser.idNumber = newIdNumber;
    currentUser.healthCard = newHealthCard;
    currentUser.height = newHeight;
    currentUser.weight = newWeight;
    currentUser.birthdate = newBirthdate;

    appointments.forEach(appointment => {
      if (appointment.username === oldUsername) {
        appointment.username = newUsername;
      }
    });

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    closeEditProfileForm();
    updateProfileDisplay();
    alert('資料已更新！');
  } else {
    alert('請填寫所有欄位！');
  }
}

function changePassword() {
  const newPassword = document.getElementById('new-password').value;
  if (newPassword) {
    const userIndex = users.findIndex(user => user.username === currentUser.username);
    users[userIndex].password = newPassword;
    currentUser.password = newPassword;
    localStorage.setItem('users', JSON.stringify(users));
    document.getElementById('new-password').value = '';
    alert('密碼已更新！請記住您的新密碼。');
  } else {
    alert('請輸入新密碼！');
  }
}

function slideLeft() {
  currentSlide = (currentSlide === 0) ? 1 : 0;
  updateCarousel();
  resetAutoSlide();
}

function slideRight() {
  currentSlide = (currentSlide === 1) ? 0 : 1;
  updateCarousel();
  resetAutoSlide();
}

function updateCarousel() {
  const carouselInner = document.getElementById('carousel-inner');
  carouselInner.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function startAutoSlide() {
  autoSlideInterval = setInterval(() => {
    slideRight();
  }, 5000);
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

function goHome() {
  document.getElementById('home-page').classList.remove('hidden');
  document.getElementById('appointment-section').classList.add('hidden');
  document.getElementById('records-section').classList.add('hidden');
  document.getElementById('doctors-section').classList.add('hidden');
  document.getElementById('profile-section').classList.add('hidden');
  document.getElementById('account-toggle').checked = false;
  document.getElementById('notification-toggle').checked = false;
  startAutoSlide();
}
