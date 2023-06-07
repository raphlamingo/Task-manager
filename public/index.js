const showPasswordCheckbox = document.getElementById('showPasswordCheckbox');
const passwordInput = document.getElementById('exampleInputPassword1');

showPasswordCheckbox.addEventListener('change', function() {
  if (this.checked) {
    passwordInput.type = 'text';
  } else {
    passwordInput.type = 'password';
  }
});