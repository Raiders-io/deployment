// Configuration des endpoints pour chaque service
const serviceEndpoints = {
	gateway: {
		url: 'https://jsonplaceholder.typicode.com/posts/1',
		method: 'GET',
		description: 'Récupération de la configuration Gateway'
	},
	social: {
		url: 'https://jsonplaceholder.typicode.com/comments/1',
		method: 'GET',
		description: 'Récupération du flux social'
	},
	auth: {
		url: 'https://jsonplaceholder.typicode.com/posts',
		method: 'POST',
		body: { username: 'test_user', action: 'login', timestamp: new Date().toISOString() },
		description: 'Tentative d\'authentification'
	},
	chat: {
		url: 'https://jsonplaceholder.typicode.com/posts/2',
		method: 'GET',
		description: 'Récupération des messages chat'
	},
	files: {
		url: 'https://jsonplaceholder.typicode.com/posts',
		method: 'POST',
		body: { filename: 'document.txt', action: 'upload', size: '1.2MB' },
		description: 'Upload de fichier simulé'
	},
	monitoring: {
		url: 'https://jsonplaceholder.typicode.com/users/1',
		method: 'GET',
		description: 'Métriques système et monitoring'
	},
	db: {
		url: 'https://jsonplaceholder.typicode.com/todos/1',
		method: 'GET',
		description: 'Requête base de données'
	},
	other_service: {
		url: 'https://jsonplaceholder.typicode.com/other_service/1',
		method: 'GET',
		description: 'Endpoint pour un autre service (simulation)'
	}
};

// Simulation pour la démo
const mockResponses = {
	gateway: { id: 1, title: 'Gateway Configuration', status: 'active', version: '2.1.0', endpoints: ['/api', '/ws', '/auth'] },
	social: { postId: 1, id: 1, name: 'John Doe', email: 'john@example.com', body: 'This is a social media post simulation' },
	auth: { id: 101, message: 'Authentification réussie', token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', user: 'test_user' },
	chat: { userId: 1, id: 2, title: 'Chat Message', body: 'Hello from the chat service!' },
	files: { id: 101, message: 'Fichier uploadé avec succès', filename: 'document.txt', size: '1.2MB', url: '/uploads/document.txt' },
	monitoring: { id: 1, name: 'System Monitor', metrics: { cpu: '23%', memory: '1.2GB/4GB', disk: '45%', uptime: '99.9%' } },
	db: { userId: 1, id: 1, title: 'Database Query Result', completed: false, message: 'Record retrieved successfully' },
	other_service: { id: 1, message: 'Réponse du service autre', timestamp: new Date().toISOString() }
};

// Fonction pour afficher les résultats
function displayResponse(service, data, status, method) {
	const responseDiv = document.getElementById('response');
	const statusBadge = document.getElementById('statusBadge');
	
	const timestamp = new Date().toLocaleString();
	const serviceInfo = serviceEndpoints[service];
	
	let responseHtml = `
		<div style="border-bottom: 1px solid #ddd; margin-bottom: 10px; padding-bottom: 10px;">
			<strong>📅 ${timestamp}</strong><br>
			<strong>🎯 Service:</strong> ${service.charAt(0).toUpperCase() + service.slice(1)}<br>
			<strong>🔧 Méthode:</strong> ${method}<br>
			<strong>📝 Description:</strong> ${serviceInfo.description}<br>
			<strong>🌐 Endpoint:</strong> ${serviceInfo.url}<br>
			<strong>📊 Statut:</strong> <span style="color: ${status === 'success' ? '#28a745' : '#dc3545'}">${status === 'success' ? '✓ Succès' : '✗ Erreur'}</span>
		</div>
	`;
	
	if (status === 'success') {
		responseHtml += `
			<div style="background: #d4edda; padding: 10px; border-radius: 5px; margin-top: 10px;">
				<strong>✅ Réponse reçue avec succès:</strong><br>
				<pre style="margin-top: 10px; overflow-x: auto;">${JSON.stringify(data, null, 2)}</pre>
			</div>
		`;
		statusBadge.className = 'status-badge success';
		statusBadge.textContent = '✓ Succès';
	} else {
		responseHtml += `
			<div style="background: #f8d7da; padding: 10px; border-radius: 5px; margin-top: 10px;">
				<strong>❌ Erreur:</strong> ${data.message || 'Impossible de contacter le service'}<br>
				<small>Note: Ceci est une simulation. En production, remplacez les URLs par vos endpoints réels.</small>
			</div>
		`;
		statusBadge.className = 'status-badge error';
		statusBadge.textContent = '✗ Erreur';
	}
	
	// Ajouter au début pour garder l'historique
	const currentContent = responseDiv.innerHTML;
	responseDiv.innerHTML = responseHtml + '<hr style="margin: 15px 0;">' + currentContent;
	
	// Limiter l'historique à 10 entrées
	const lines = responseDiv.innerHTML.split('<hr');
	if (lines.length > 11) {
		responseDiv.innerHTML = lines.slice(0, 11).join('<hr');
	}
}

// Fonction pour simuler une requête API (remplacez par vos vraies APIs)
async function makeServiceRequest(service, method) {
	const serviceConfig = serviceEndpoints[service];
	if (!serviceConfig) {
		throw new Error(`Service ${service} non configuré`);
	}
	
	// Simuler un délai réseau
	await new Promise(resolve => setTimeout(resolve, 800));
	
	// Pour la démo, on simule des réponses
	// En production, décommentez le code fetch ci-dessous
	
	/*
	// Version réelle avec fetch
	const options = {
		method: method,
		headers: {
			'Content-Type': 'application/json',
		}
	};
	
	if (method === 'POST' && serviceConfig.body) {
		options.body = JSON.stringify(serviceConfig.body);
	}
	
	const response = await fetch(serviceConfig.url, options);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`);
	}
	const data = await response.json();
	return data;
	*/

	// Version simulée	
	return mockResponses[service] || { message: `Service ${service} répond avec succès`, timestamp: new Date().toISOString() };
}

// Gestionnaire de clics pour les boutons
async function handleServiceClick(event) {
	const button = event.currentTarget;
	const service = button.dataset.service;
	const method = button.dataset.method.toUpperCase();
	
	// Désactiver le bouton pendant la requête
	button.classList.add('loading');
	const originalText = button.innerHTML;
	button.innerHTML = `
		<div class="service-icon">⏳</div>
		<div class="service-name">Chargement...</div>
	`;
	
	// Mettre à jour le statut
	const statusBadge = document.getElementById('statusBadge');
	statusBadge.className = 'status-badge loading';
	statusBadge.textContent = '⏳ Chargement...';
	
	try {
		// Envoyer la requête
		const result = await makeServiceRequest(service, method);
		
		// Afficher le succès
		displayResponse(service, result, 'success', method);
		
		// Animation de succès sur le bouton
		button.style.transform = 'scale(0.95)';
		setTimeout(() => {
			button.style.transform = '';
		}, 200);
		
	} catch (error) {
		console.error(`Erreur pour le service ${service}:`, error);
		displayResponse(service, { message: error.message }, 'error', method);
		
		// Animation d'erreur sur le bouton
		button.style.backgroundColor = '#dc3545';
		setTimeout(() => {
			button.style.backgroundColor = '';
		}, 300);
		
	} finally {
		// Réactiver le bouton
		button.classList.remove('loading');
		button.innerHTML = originalText;
		
		// Remettre le statut à normal après 2 secondes
		setTimeout(() => {
			if (document.getElementById('statusBadge').textContent !== 'Prêt') {
				statusBadge.className = 'status-badge';
				statusBadge.textContent = 'Prêt';
			}
		}, 2000);
	}
}

// Attacher les écouteurs d'événements à tous les boutons
document.querySelectorAll('.service-btn').forEach(button => {
	button.addEventListener('click', handleServiceClick);
});

// Information sur la configuration en console
console.log('🚀 Dashboard Services chargé !');
console.log('📋 Services disponibles:', Object.keys(serviceEndpoints).join(', '));
console.log('💡 Note: Ceci utilise des simulations. Pour de vraies APIs, modifiez serviceEndpoints avec vos URLs réelles.');

// Ajouter un effet de ripple sur les clics
document.querySelectorAll('.service-btn').forEach(btn => {
	btn.addEventListener('click', function(e) {
		const rect = this.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		
		const ripple = document.createElement('div');
		ripple.style.position = 'absolute';
		ripple.style.left = x + 'px';
		ripple.style.top = y + 'px';
		ripple.style.width = '0';
		ripple.style.height = '0';
		ripple.style.borderRadius = '50%';
		ripple.style.backgroundColor = 'rgba(255,255,255,0.5)';
		ripple.style.transform = 'translate(-50%, -50%)';
		ripple.style.transition = 'width 0.5s, height 0.5s';
		ripple.style.pointerEvents = 'none';
		ripple.style.zIndex = '2';
		
		this.style.position = 'relative';
		this.style.overflow = 'hidden';
		this.appendChild(ripple);
		
		setTimeout(() => {
			ripple.style.width = '200px';
			ripple.style.height = '200px';
		}, 10);
		
		setTimeout(() => {
			ripple.remove();
		}, 500);
	});
});
