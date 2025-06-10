// Variables globales
let taches = [];
let idCompteur = 1;

// Récupération des éléments du DOM
const formulaire = document.getElementById('task-form');
const listeTaches = document.getElementById('task-list');
const filtreStatut = document.getElementById('filtre-statut');
const filtreTri = document.getElementById('filtre-tri');

// Chargement des tâches au démarrage
window.addEventListener('load', function() {
    // Animation d'apparition au chargement
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    
    setTimeout(function() {
        document.body.style.opacity = '1';
    }, 100);
    
    chargerTaches();
    afficherTaches();
});

// Ajout d'une nouvelle tâche
formulaire.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Récupération des valeurs du formulaire
    const titre = document.getElementById('titre').value;
    const description = document.getElementById('description').value;
    const dateEcheance = document.getElementById('date_echeance').value;
    const priorite = document.getElementById('priorite').value;
    
    // Vérification que le titre n'est pas vide
    if (titre.trim() === '') {
        alert('Le titre est obligatoire !');
        return;
    }
    
    // Création de la nouvelle tâche
    const nouvelleTache = {
        id: idCompteur++,
        titre: titre,
        description: description,
        dateEcheance: dateEcheance,
        priorite: priorite,
        statut: 'à faire',
        dateCreation: new Date().toISOString()
    };
    
    // Ajout à la liste
    taches.push(nouvelleTache);
    
    // Sauvegarde dans localStorage
    sauvegarderTaches();
    
    // Remise à zéro du formulaire
    formulaire.reset();
    
    // Rafraîchissement de l'affichage avec animation
    afficherTaches();
    
    // Animation pour la nouvelle tâche
    setTimeout(function() {
        const derniereTache = document.querySelector('.task:last-child');
        if (derniereTache) {
            derniereTache.classList.add('nouvelle-tache');
        }
    }, 100);
    
    alert('Tâche ajoutée avec succès !');
});

// Gestion des filtres
filtreStatut.addEventListener('change', function() {
    afficherTaches();
});

filtreTri.addEventListener('change', function() {
    afficherTaches();
});

// Fonction pour charger les tâches depuis localStorage
function chargerTaches() {
    const tachesSauvegardees = localStorage.getItem('taches');
    if (tachesSauvegardees) {
        taches = JSON.parse(tachesSauvegardees);
        // Mise à jour du compteur d'ID
        if (taches.length > 0) {
            idCompteur = Math.max(...taches.map(t => t.id)) + 1;
        }
    }
}

// Fonction pour sauvegarder les tâches dans localStorage
function sauvegarderTaches() {
    localStorage.setItem('taches', JSON.stringify(taches));
}

// Fonction pour afficher les tâches
function afficherTaches() {
    // Filtrage des tâches
    let tachesFiltrees = [...taches];
    
    // Filtre par statut
    const statutSelectionne = filtreStatut.value;
    if (statutSelectionne !== 'tous') {
        tachesFiltrees = tachesFiltrees.filter(tache => tache.statut === statutSelectionne);
    }
    
    // Tri des tâches
    const triSelectionne = filtreTri.value;
    if (triSelectionne === 'date') {
        tachesFiltrees.sort(function(a, b) {
            if (!a.dateEcheance) return 1;
            if (!b.dateEcheance) return -1;
            return new Date(a.dateEcheance) - new Date(b.dateEcheance);
        });
    } else if (triSelectionne === 'priorite') {
        const ordrePriorite = { 'haute': 3, 'moyenne': 2, 'basse': 1 };
        tachesFiltrees.sort(function(a, b) {
            return ordrePriorite[b.priorite] - ordrePriorite[a.priorite];
        });
    }
    
    // Affichage des tâches avec animation
    if (tachesFiltrees.length === 0) {
        listeTaches.innerHTML = '<div class="no-tasks">Aucune tâche à afficher</div>';
        return;
    }
    
    let html = '';
    tachesFiltrees.forEach(function(tache) {
        html += creerHtmlTache(tache);
    });
    
    listeTaches.innerHTML = html;
    
    // Animation d'apparition pour toutes les tâches
    const toutesLesTaches = document.querySelectorAll('.task');
    toutesLesTaches.forEach(function(tache, index) {
        tache.style.opacity = '0';
        tache.style.transform = 'translateY(20px)';
        
        setTimeout(function() {
            tache.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            tache.style.opacity = '1';
            tache.style.transform = 'translateY(0)';
        }, index * 100); // Décalage de 100ms entre chaque tâche
    });
    
    // Ajout des événements aux boutons
    ajouterEvenementsBoutons();
}

// Fonction pour créer le HTML d'une tâche
function creerHtmlTache(tache) {
    const dateEcheance = tache.dateEcheance ? formatDate(tache.dateEcheance) : 'Non définie';
    
    return `
        <div class="task priorite-${tache.priorite} statut-${tache.statut.replace(' ', '-')}" data-id="${tache.id}">
            <h3>${tache.titre}</h3>
            <p>${tache.description}</p>
            <p><strong>Échéance :</strong> ${dateEcheance}</p>
            <p><strong>Priorité :</strong> ${capitaliserPremiereLetre(tache.priorite)}</p>
            <p><strong>Statut :</strong> ${capitaliserPremiereLetre(tache.statut)}</p>
            <div class="task-buttons">
                <button class="complete-btn" onclick="changerStatut(${tache.id})">
                    ${tache.statut === 'terminé' ? 'Réactiver' : 'Terminer'}
                </button>
                <button class="edit-btn" onclick="modifierTache(${tache.id})">Modifier</button>
                <button class="delete-btn" onclick="supprimerTache(${tache.id})">Supprimer</button>
            </div>
        </div>
    `;
}

// Fonction pour ajouter les événements aux boutons
function ajouterEvenementsBoutons() {
    // Les événements sont gérés par onclick dans le HTML
}

// Fonction pour changer le statut d'une tâche
function changerStatut(id) {
    const tache = taches.find(t => t.id === id);
    if (tache) {
        if (tache.statut === 'terminé') {
            tache.statut = 'à faire';
        } else {
            tache.statut = 'terminé';
        }
        sauvegarderTaches();
        afficherTaches();
    }
}

// Fonction pour modifier une tâche
function modifierTache(id) {
    const tache = taches.find(t => t.id === id);
    if (tache) {
        const nouveauTitre = prompt('Nouveau titre :', tache.titre);
        if (nouveauTitre !== null && nouveauTitre.trim() !== '') {
            tache.titre = nouveauTitre.trim();
            
            const nouvelleDescription = prompt('Nouvelle description :', tache.description);
            if (nouvelleDescription !== null) {
                tache.description = nouvelleDescription;
            }
            
            const nouvellePriorite = prompt('Nouvelle priorité (basse/moyenne/haute) :', tache.priorite);
            if (nouvellePriorite && ['basse', 'moyenne', 'haute'].includes(nouvellePriorite)) {
                tache.priorite = nouvellePriorite;
            }
            
            sauvegarderTaches();
            afficherTaches();
            alert('Tâche modifiée !');
        }
    }
}

// Fonction pour supprimer une tâche
function supprimerTache(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        taches = taches.filter(t => t.id !== id);
        sauvegarderTaches();
        afficherTaches();
        alert('Tâche supprimée !');
    }
}

// Fonction utilitaire pour formater les dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// Fonction utilitaire pour capitaliser la première lettre
function capitaliserPremiereLetre(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}