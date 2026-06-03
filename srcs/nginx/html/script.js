let authToken = null;

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	const form = e.target;

	const res = await fetch('http://127.0.0.1:3334/api/v1/auth/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			email: form.email.value,
			password: form.password.value,
		}),
	});

	const json = await res.json();
	if (!res.ok) {
		console.error('Login error :', json);
		alert('Login failed: ' + (json.message || 'Unknown error'));
		return;
	}
	authToken = json.data.token;
	console.log('Token récupéré :', authToken);
	alert('Connected! You can now upload your avatar.');
});

// create lesson
document.getElementById('createLessonForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	const form = e.target;

	if (!authToken) {
		alert('Please login first !');
		return;
	}

	const tagsList = document.getElementById('tags');
	const selectedTags = [];
	for (const tag of tagsList.querySelectorAll('input[type="checkbox"]:checked')) {
		selectedTags.push(tag.value);
	}
	const res = await fetch('http://127.0.0.1:3333/lessons/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			title: form.title.value,
			tags: selectedTags,
	}),
	});
	const json = await res.text();
	console.log('Response upload :', json);
});

// Upload avatar
document.getElementById('avatarForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	if (!authToken) {
		alert('Please login first !');
		return;
	}

	const formData = new FormData();
	const fileInput = document.getElementById('file');
	for (const file of fileInput.files) {
		formData.append('avatars[]', file); // avatars[] est le nom du type pour le validator
	}

	const res = await fetch('http://127.0.0.1:3333/profile/avatar', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${authToken}`,
			// pas de Content-Type ici : fetch le gère automatiquement pour multi-part
		},
		body: formData,
	});

	const json = await res.text();
	console.log('Response upload :', json);
});
