document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('leadForm');
    const confirmation = document.getElementById('confirmation');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Récupération des données du formulaire
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        };

        // Simulation d'envoi à une API
        // Remplacez ce code par votre propre logique d'envoi de données
        console.log('Lead capturé:', formData);

        // Animation de soumission
        const button = form.querySelector('button');
        button.innerHTML = 'Envoi en cours...';
        button.disabled = true;

        // Simulation de délai réseau
        setTimeout(() => {
            // Cacher le formulaire
            form.style.display = 'none';
            
            // Afficher la confirmation
            confirmation.classList.remove('hidden');

            // Réinitialiser le formulaire pour une future utilisation
            form.reset();
            button.innerHTML = 'Obtenir Ma Consultation Gratuite';
            button.disabled = false;

            // Enregistrement dans le localStorage
            const leads = JSON.parse(localStorage.getItem('leads') || '[]');
            leads.push({
                ...formData,
                date: new Date().toISOString()
            });
            localStorage.setItem('leads', JSON.stringify(leads));

        }, 1500);
    });

    // Validation basique des champs
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('invalid', function(e) {
            e.preventDefault();
            this.classList.add('error');
        });

        input.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
});
