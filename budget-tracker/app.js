document.addEventListener('DOMContentLoaded', () => {
  const authCard = document.getElementById('auth-card');
  const authForm = document.getElementById('auth-form');
  const formTitle = document.getElementById('form-title');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const alertBox = document.getElementById('alert');
  const userDisplay = document.getElementById('user-display');
  const transactionAmountInput = document.getElementById('transaction-amount');
  const transactionCategoryInput = document.getElementById('transaction-category');
  const transactionList = document.getElementById('transaction-list');
  const addTransactionBtn = document.getElementById('add-transaction');
  const dashboard = document.getElementById('dashboard');

  let currentUser = null;
  let transactions = [];
  let income = 0;

  function showAlert(message, type = 'success') {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.classList.remove('hidden');
    setTimeout(() => alertBox.classList.add('hidden'), 3000);
  }

  function loadUserData(username) {
    const userData = JSON.parse(localStorage.getItem(`user_${username}`) || '{}');
    transactions = userData.transactions || [];
    income = userData.income || 0;
  }

  function saveUserData() {
    if (!currentUser) return;
    const userData = { transactions, income };
    localStorage.setItem(`user_${currentUser}`, JSON.stringify(userData));
  }

  function showDashboard(username) {
    currentUser = username;
    authCard.style.display = 'none';
    dashboard.style.display = 'block';
    userDisplay.textContent = username;
    loadUserData(username);
    displayTransactions();
    renderChart();
  }

  function logout() {
    dashboard.style.display = 'none';
    authCard.style.display = 'block';
    authForm.reset();
    localStorage.removeItem('loggedInUser');
    currentUser = null;
    transactions = [];
    income = 0;
    transactionList.innerHTML = '';
  }
  window.logout = logout;

  let isLogin = true;

  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (password.length < 6) {
      showAlert("Password must be at least 6 characters.", "error");
      return;
    }

    if (isLogin) {
      if (!users[username] || users[username] !== password) {
        showAlert("Invalid username or password.", "error");
        return;
      }
      showAlert("Login successful!");
      localStorage.setItem('loggedInUser', username);
      showDashboard(username);
    } else {
      if (users[username]) {
        showAlert("Username already taken.", "error");
        return;
      }
      users[username] = password;
      localStorage.setItem('users', JSON.stringify(users));
      showAlert("Sign-up successful! You can now log in.");
      isLogin = true;
      switchBtn.click();
    }
  });

  const switchBtn = document.createElement('button');
  switchBtn.id = 'switch-btn';
  switchBtn.textContent = "Don't have an account? Sign up";
  authCard.querySelector('.card').appendChild(switchBtn);

  switchBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    formTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    authForm.querySelector('button[type="submit"]').textContent = isLogin ? 'Login' : 'Sign Up';
    switchBtn.textContent = isLogin
      ? "Don't have an account? Sign up"
      : "Already have an account? Login";
  });

  const strengthBarContainer = document.createElement('div');
  strengthBarContainer.id = 'strength';
  const strengthBar = document.createElement('div');
  strengthBar.id = 'strength-bar';
  strengthBarContainer.appendChild(strengthBar);
  passwordInput.insertAdjacentElement('afterend', strengthBarContainer);

  passwordInput.addEventListener('input', () => {
    const val = passwordInput.value;
    const strength = Math.min(val.length / 10, 1);
    strengthBar.style.width = `${strength * 100}%`;
    strengthBar.style.backgroundColor = strength < 0.4 ? 'red' : strength < 0.7 ? 'orange' : 'green';
  });

  window.addEventListener('load', () => {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      showDashboard(loggedInUser);
    }
  });

  addTransactionBtn.addEventListener('click', () => {
    const amount = parseFloat(transactionAmountInput.value);
    const category = transactionCategoryInput.value.trim();

    if (isNaN(amount) || amount <= 0 || category === '') {
      showAlert("Please enter a valid amount and category.", "error");
      return;
    }

    transactions.push({ amount, category });
    income += amount;
    saveUserData();
    renderChart();
    displayTransactions();
    showAlert("Transaction added!");

    transactionAmountInput.value = '';
    transactionCategoryInput.value = '';
  });

  function displayTransactions() {
    transactionList.innerHTML = '';
    transactions.forEach(t => {
      const item = document.createElement('div');
      item.className = 'transaction';
      item.textContent = `${t.category}: $${t.amount.toFixed(2)}`;
      transactionList.appendChild(item);
    });
  }

  let chartInstance = null;

  function renderChart() {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    const categories = [];
    const amounts = [];

    transactions.forEach(t => {
      if (!categories.includes(t.category)) {
        categories.push(t.category);
        amounts.push(t.amount);
      } else {
        const index = categories.indexOf(t.category);
        amounts[index] += t.amount;
      }
    });

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories.length > 0 ? categories : ['No transactions yet'],
        datasets: [{
          label: 'Spending Breakdown',
          data: amounts.length > 0 ? amounts : [1],
          backgroundColor: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#F3FF33'],
        }]
      },
      options: {
        responsive: true
      }
    });
  }
});