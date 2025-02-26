document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("container");
    const filmsContainer = document.getElementById("filmsContainer");
    const addFilmForm = document.getElementById("addFilmForm");
    const importAllButton = document.getElementById("importAll");
    const importClassicsButton = document.getElementById("importClassics");
    const importNavetsButton = document.getElementById("importNavets");
    const classicThreshold = document.getElementById("classicThreshold");
    const navetThreshold = document.getElementById("navetThreshold");
    const classicValue = document.getElementById("classicValue");
    const navetValue = document.getElementById("navetValue");
    const countryFilter = document.getElementById("countryFilter");

    if (!container || !filmsContainer || !addFilmForm || !importAllButton || !importClassicsButton || !importNavetsButton || !classicThreshold || !navetThreshold || !classicValue || !navetValue || !countryFilter) {
        console.error("Erreur : Impossible de trouver les éléments HTML.");
        return;
    }

    const fetchFilms = (filterType = 'all') => {
        const params = new URLSearchParams();
        const selectedCountry = countryFilter.value;
        const classicThresholdValue = parseFloat(classicThreshold.value);
        const navetThresholdValue = parseFloat(navetThreshold.value);

        if (selectedCountry !== "TOUS") {
            params.append("origine", selectedCountry);
        }

        if (filterType === 'classics') {
            params.append("niveau", "classic");
        } else if (filterType === 'navets') {
            params.append("niveau", "navet");
        }

        fetch(`http://localhost:3000?${params.toString()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP : ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                filmsContainer.innerHTML = ''; // Vider le conteneur avant d'ajouter les films

                data.forEach(film => {
                    const isClassic = film.note >= classicThresholdValue;
                    const isNavet = film.note <= navetThresholdValue;

                    const filmCard = document.createElement("div");
                    filmCard.className = "card";
                    if (isClassic) {
                        filmCard.style.border = "2px solid gold";
                    } else if (isNavet) {
                        filmCard.style.border = "2px solid purple";
                    }

                    filmCard.innerHTML = `
                        <h2>${film.nom}</h2>
                        <p>Réalisateur: ${film.realisateur}</p>
                        <p>Date de sortie: ${film.dateDeSortie}</p>
                        <p>Note de la critique: ${film.note !== null ? film.note + ' &starf;' : 'N/A'}</p>
                        <p>Note du public: ${film.notePublic !== null ? film.notePublic + ' &starf;' : 'N/A'}</p>
                        <p>Compagnie: ${film.compagnie}</p>
                        <p>Origine: ${film.origine}</p>
                        <p>Description: ${isNavet ? 'ne vaut même pas la peine' : film.description}</p>
                        <img src="${film.lienImage}" alt="${film.nom}" onerror="this.onerror=null;this.src='default.jpg';">
                        <button class="delete-btn" data-id="${film.id}">Supprimer</button>
                    `;
                    filmsContainer.appendChild(filmCard);
                });

                document.querySelectorAll(".delete-btn").forEach(button => {
                    button.addEventListener("click", (e) => {
                        const filmId = e.target.getAttribute("data-id");
                        fetch(`http://localhost:3000/film/${filmId}`, {
                            method: "DELETE"
                        })
                            .then(response => response.json())
                            .then(result => {
                                console.log(result.message);
                                fetchFilms(filterType); // Re-fetch films after deletion
                            })
                            .catch(error => console.error("Erreur lors de la suppression du film:", error));
                    });
                });
            })
            .catch(error => console.error("Erreur lors de la récupération des films:", error));
    };

    importAllButton.addEventListener("click", () => fetchFilms('all'));
    importClassicsButton.addEventListener("click", () => fetchFilms('classics'));
    importNavetsButton.addEventListener("click", () => fetchFilms('navets'));

    classicThreshold.addEventListener("input", () => {
        classicValue.textContent = classicThreshold.value;
    });

    navetThreshold.addEventListener("input", () => {
        navetValue.textContent = navetThreshold.value;
    });

    classicThreshold.addEventListener("change", () => fetchFilms());
    navetThreshold.addEventListener("change", () => fetchFilms());
    countryFilter.addEventListener("change", () => fetchFilms());

    addFilmForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const filmData = {
            nom: document.getElementById("nom").value,
            dateDeSortie: document.getElementById("dateDeSortie").value,
            realisateur: document.getElementById("realisateur").value,
            note: document.getElementById("note").value,
            compagnie: document.getElementById("compagnie").value,
            description: document.getElementById("description").value,
            lienImage: document.getElementById("lienImage").value,
            origine: document.getElementById("origine").value
        };

        fetch('http://localhost:3000/film', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filmData)
        })
            .then(response => response.json())
            .then(result => {
                console.log(result.message);
                fetchFilms();
            })
            .catch(error => console.error("Erreur lors de l'ajout du film:", error));
    });
});