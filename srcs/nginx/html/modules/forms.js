import { getCookie, setCookie } from './cookies.js';
import { displayFiles, deleteTableRow, deleteTableRows } from './displayFileTable.js';

let authToken = getCookie('authToken') || null;

// Object Storage API - Signup
document.getElementById('signupForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	const form = e.target;

	const res = await fetch('http://127.0.0.1:3334/api/v1/auth/signup', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			fullName: form.fullName.value,
			email: form.email.value,
			password: form.password.value,
			passwordConfirmation: form.passwordConfirmation.value,
		}),
	});

	const json = await res.json();
	if (!res.ok) {
		console.error('Signup error :', json);
		alert('Signup failed: ' + (json.message || 'Unknown error'));
		return;
	}
	authToken = json.data.token;
	setCookie('authToken', authToken);
	console.log('Token récupéré :', authToken);
	alert('Connected! You can now upload your avatar.');
});

// Object Storage API - Login
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
	setCookie('authToken', authToken);
	console.log('Token récupéré :', authToken);
	alert('Connected! You can now upload your avatar.');
});

// Object Storage API - get profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	const form = e.target;

	if (!authToken) {
		alert('Please login first !');
		return;
	}

	const res = await fetch('http://127.0.0.1:3334/api/v1/account/profile', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${authToken}`,
		},
	});
	const json = await res.text();
	console.log('Response profile :', json);
});

// Upload files
document.getElementById('filesForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	const formData = new FormData();
	await uploadMultipleFiles(document.getElementById('file'));
});

// Update single file by name
document.getElementById('updateFileForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	await updateFile(document.getElementById('updateFile'));
});

// Update multiple files by their names
document.getElementById('updateMultipleFilesForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	await updateMultipleFile(document.getElementById('updateMultipleFiles'));
});

// Delete single file by name
document.getElementById('deleteFileForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	const form = e.target;
	await deleteFile(form.fileName.value);
});

// Delete multiple files by names
document.getElementById('deleteMultipleFilesForm').addEventListener('submit', async (e) => {
	e.preventDefault();

	const form = e.target;
	const fileNames = form.deleteFileNames.value
		.split('\n')
		.map(name => name.trim())
		.filter(name => name.length > 0);

	if (fileNames.length === 0) {
		alert('Please enter at least one file name');
		return;
	}
	console.log('Deleting files:', fileNames);
	await deleteMultipleFiles(fileNames);
});

// Index of files
document.getElementById('indexFilesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!authToken) {
        alert('Please login first !');
        return;
    }

    try {
        const res = await fetch('http://127.0.0.1:3334/storage/objects', {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
        });
        
        const json = await res.json(); // Utilisez .json() au lieu de .text()
        console.log('Response :', json);
        
        // Afficher les fichiers
        displayFiles(json.objects);
        
    } catch (error) {
        console.error('Erreur :', error);
        document.getElementById('fileList').innerHTML = 
            '<p style="color: red;">❌ Erreur lors du chargement des fichiers</p>';
    }
});

// Show Specific File
document.getElementById('showFileForm').addEventListener('submit', async (e) => {
	e.preventDefault();
	const form = e.target;

	await downloadFile(form.fileName.value);
});

// Waits a fileInput from a document.getElementById()
export async function uploadMultipleFiles(fileInput) {
	if (!fileInput) {
		alert('Please add at least one file');
		return;
	}
	if (!authToken) {
		alert('Please login first !');
		return;
	}

	const formData = new FormData();
	for (const file of fileInput.files) {
		formData.append('files[]', file); // files[] est le nom du type pour le validator
	}

	const res = await fetch('http://127.0.0.1:3334/storage/objects', {
		method: 'POST',
		headers: { 'Authorization': `Bearer ${authToken}` },
		body: formData,
	});

	const json = await res.text();
	console.log('Response upload :', json);
} 

// Waits a fileInput from a document.getElementById()
export async function updateFile(fileInput) {
	if (!fileInput) {
		alert('Please add at least one file');
		return;
	}
	if (!authToken) {
		alert('Please login first !');
		return;
	}

	if (fileInput.files.length !== 1) {
		alert('Please select exactly one file to update.');
		return;
	}
	const formData = new FormData();
	formData.append('file', fileInput.files[0]);

	const res = await fetch(`http://127.0.0.1:3334/storage/objects/${fileInput.files[0].name}`, {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${authToken}`,
		},
		body: formData,
	});

	const json = await res.text();
	console.log('Response update :', json);
	alert('File updated successfully');
} 

// Waits a fileInput from a document.getElementById()
export async function updateMultipleFile(fileInput) {
	if (!fileInput) {
		alert('Please add at least one file');
		return;
	}
	if (!authToken) {
		alert('Please login first !');
		return;
	}

	const formData = new FormData();
	for (const file of fileInput.files) {
		formData.append('files[]', file);
	}

	const res = await fetch('http://127.0.0.1:3334/storage/objects/', {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${authToken}`,
		},
		body: formData,
	});

	const json = await res.text();
	console.log('Response update :', json);
	alert('Files updated successfully');
} 

export async function downloadFile(fileName) {
	if (!fileName) {
		alert('Please enter a file name to download.');
		return;
	}
	if (!authToken) {
		alert('Please login first !');
		return;
	}
	const res = await fetch(`http://127.0.0.1:3334/storage/objects/${fileName}`, {
		method: 'GET',
		headers: { 'Authorization': `Bearer ${authToken}` },
	});

	if (!res.ok) {
		const errorBody = await res.text();
		console.error('Show file error :', errorBody);
		alert(`Failed to fetch file (${res.status})`);
		return;
	}

	const blob = await res.blob();
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = `${fileName}`;
	a.click();
	window.URL.revokeObjectURL(url);
}

export async function deleteFile(fileName) {
	if (!fileName) {
		alert('Please enter a file name to delete.');
		return;
	}
	if (!authToken) {
		alert('Please login first !');
		return;
	}
	const res = await fetch(`http://127.0.0.1:3334/storage/objects/${fileName}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${authToken}`,
		},
	});

	const json = await res.text();
	console.log('Response delete :', json);
	deleteTableRow(fileName);
	// alert('File deleted successfully');
}

// Waits a fileName Array
export async function deleteMultipleFiles(fileNames) {
	if (!fileNames || fileNames.length === 0) {
		alert('Please enter at least one file name');
		return;
	}
	if (!authToken) {
		alert('Please login first !');
		return;
	}
	const res = await fetch('http://127.0.0.1:3334/storage/objects/', {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${authToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ ids: fileNames }),
	});

	const json = await res.text();
	console.log('Response delete :', json);
	deleteTableRows(fileNames);
	// alert('Files deleted successfully');
}
