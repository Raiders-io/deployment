import { formatFileSize, formatDate, getFileIcon } from './utils.js';

// Fonction pour créer dynamiquement la liste des fichiers
export function displayFiles(files) {
    const fileList = document.getElementById('fileList');
    
    if (!files || files.length === 0) {
        fileList.innerHTML = '<p>📂 Aucun fichier trouvé</p>';
        return;
    }
	let html = `<h4>📁 Explorateur de fichiers</h4>`;

	html += `
		<form action="" method="get" class="ffile-actions">
			<label for="selectAll">Select All</label>
			<input type="checkbox" onclick="toggleSelectAll()"/>
			<button type="button" onclick="downloadSelectedFiles()" class="btn-action">📥 Download Selected</button>	
			<button type="button" onclick="deleteSelectedFiles()" class="btn-action btn-danger">🗑️ Delete Selected</button>	
		`;
    html += `
        <table class="file-table">
            <thead>
                <tr>
					<th>Select</th>
					<th>Icon</th>
                    <th>Nom</th>
                    <th>Taille</th>
                    <th>Type</th>
                    <th>Visibilité</th>
                    <th>Date de création</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
	let	total_size = Number(0);
    files.forEach(file => {
		total_size += Number(file.sizeBytes);
        const size = formatFileSize(file.sizeBytes);
        const date = formatDate(file.createdAt);

		html += `
            <tr id="table-file-${file.name}" >
				<td class="file-selected">
					<input type="checkbox" onclick="updateSelectedCount()"/>
				</td>
				<td class="file-icon">${getFileIcon(file.mimeType, file.name)}</td>
                <td class="file-name">${file.name}</td>
                <td class="file-size">${size}</td>
                <td>${file.mimeType}</td>
                <td>
                    <span class="visibility-badge ${file.visibility}">
                        ${file.visibility === 'private' ? '🔒' : '🌍'}
                    </span>
                </td>
                <td>${date}</td>
                <td>
                    <button type="button" onclick="downloadFile('${file.name}')" class="btn-action">📥</button>
                    <button type="button" onclick="deleteFile('${file.name}')" class="btn-action btn-danger">🗑️</button>
                </td>
            </tr>
        `;
    });
	html += `
		<tfoot>
			<tr>
				<td colspan="2">Selected : <span id="selectedCount">0</span></td>
				<td colspan="3" id="totalFiles">Total : ${files.length} fichier(s)</td>
				<td colspan="3" id="totalFileSize">Espace total utilisé : ${formatFileSize(total_size)}</td>
			</tr>
		</tfoot>`;

    html += '</tbody></table></form>';

    fileList.innerHTML = html;
}

export function updateSelectedCount() {
	const checkboxes = document.querySelectorAll('#fileList tbody input[type="checkbox"]');
	const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
	document.getElementById('selectedCount').textContent = selectedCount;
}
window.updateSelectedCount = updateSelectedCount;

export function toggleSelectAll() {
	const selectAllCheckbox = document.querySelector('#fileList input[type="checkbox"]');
	const checkboxes = document.querySelectorAll('#fileList tbody input[type="checkbox"]');
	checkboxes.forEach(cb => cb.checked = selectAllCheckbox.checked);
	updateSelectedCount();
}


export function updateTotalFilesCount() {
	const totalFiles = document.querySelectorAll('#fileList tbody tr');
	if (!totalFiles)
		return;
	document.getElementById('totalFiles').textContent = `Total : ${totalFiles.length} fichier(s)`;
}

export function updateTotalSize() {
	const item = document.getElementById('totalFileSize');
	if (!item)
		return;
	const rows = document.querySelectorAll('#fileList tbody tr');
	if (!rows)
		return;
	let totalSize = 0;
	rows.forEach(row => {
		const sizeCell = row.getElementsByClassName('file-size');
		if (sizeCell && sizeCell[0]) {
			totalSize += parseInt(sizeCell[0].textContent);
		}
	});
	item.textContent = `Espace total utilisé : ${formatFileSize(totalSize)}`;
}

export function updateTableRowFooter() {
	updateSelectedCount();
	updateTotalFilesCount();
	updateTotalSize();
}

export function deleteTableRow(fileName) {
	if (!fileName) {
		return;
	}
	const row = document.getElementById(`table-file-${fileName}`);
	if (!row) {
		return ;
	}
	row.remove();
	updateTableRowFooter();
}

export function deleteTableRows(fileNames) {
	if (!fileNames || fileNames.length === 0) {
		return;
	}
	for (const fileName of fileNames) {
		const row = document.getElementById(`table-file-${fileName}`);
		if (row) {
			row.remove();
		}
	}
	updateTableRowFooter();
}


export async function downloadSelectedFiles() {
	const checkboxes = document.querySelectorAll('#fileList tbody input[type="checkbox"]');
	const selectedFiles = Array.from(checkboxes)
		.filter(cb => cb.checked)
		.map(cb => cb.closest('tr').querySelector('.file-name').textContent.trim());

	if (selectedFiles.length === 0) {
		alert('Please select at least one file to download.');
		return;
	}

	for (const fileName of selectedFiles) {
		await downloadFile(fileName);
	}
}

export async function deleteSelectedFiles() {
	const checkboxes = document.querySelectorAll('#fileList tbody input[type="checkbox"]');
	const selectedFiles = Array.from(checkboxes)
		.filter(cb => cb.checked)
		.map(cb => cb.closest('tr').querySelector('.file-name').textContent.trim());

	if (selectedFiles.length === 0) {
		alert('Please select at least one file to delete.');
		return;
	}

	await deleteMultipleFiles(selectedFiles);
}
