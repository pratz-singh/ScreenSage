// Load movies for rating on startup
window.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("/initial-movies"); // Fetch initial movies from the server
        const movies = await response.json();
        displayInitialMovies(movies);
    } catch (error) {
        console.error("Error loading initial movies:", error);
    }
});

// Display initial movies with posters and rating options
async function displayInitialMovies(movies) {
    const movieList = document.getElementById("movie-list");
    movieList.innerHTML = ""; // Clear any existing content

    for (const movie of movies) {
        const { posterUrl } = await fetchMovieDetails(movie.title);

        const movieDiv = document.createElement("div");
        movieDiv.className = "movie";

        const poster = document.createElement("img");
        poster.src = posterUrl
            ? posterUrl
            : "https://via.placeholder.com/200x300?text=No+Poster"; // Placeholder if no poster
        poster.alt = `${movie.title} Poster`;
        poster.className = "movie-poster";

        const label = document.createElement("label");
        label.textContent = movie.title;

        const select = document.createElement("select");
        select.className = "rating";
        select.dataset.movieId = movie.movieId; // Use the movie ID for rating submission
        select.innerHTML = `
            <option value="">Rate</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        `;

        movieDiv.appendChild(poster);
        movieDiv.appendChild(label);
        movieDiv.appendChild(select);
        movieList.appendChild(movieDiv);
    }
}

// Handle movie rating submission
document.getElementById("rating-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const movieRatings = Array.from(document.querySelectorAll(".rating"))
        .filter(select => select.value) // Only include rated movies
        .map(select => `${select.dataset.movieId}:${select.value}`)
        .join(",");

    const response = await fetch("/recommend", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieRatings }),
    });

    const data = await response.json();
    displayRecommendations(data.recommendations);
});

// Handle genre-based recommendations
document.getElementById("no-movies").addEventListener("click", async function () {
    const selectedGenres = Array.from(document.querySelectorAll("input[name='genre']:checked"))
        .map(checkbox => checkbox.value);

    const response = await fetch("/recommend-genres", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ genres: selectedGenres }),
    });

    const data = await response.json();
    const limitedRecommendations = data.recommendations.slice(0, 10); // Limit to 10 movies
    localStorage.setItem("recommendations", JSON.stringify(limitedRecommendations)); // Save to localStorage
    displayRecommendations(limitedRecommendations);
});

// Fetch movie details using TMDb
async function fetchMovieDetails(movieName) {
    const apiKey = "19f7029362cd02135ed85c4810b35313"; // TMDb API Key
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const movie = data.results[0]; // Take the first search result
            return {
                posterUrl: movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : null, // Poster URL or null if unavailable
            };
        } else {
            return { posterUrl: null };
        }
    } catch (error) {
        console.error(`Error fetching details for ${movieName}:`, error);
        return { posterUrl: null };
    }
}

// Display recommendations with posters
async function displayRecommendations(recommendations) {
    const recommendationsDiv = document.getElementById("recommendations");
    recommendationsDiv.innerHTML = ""; // Clear existing content

    if (recommendations.length > 0) {
        recommendationsDiv.innerHTML = "<h3>Recommendations:</h3>";
        const container = document.createElement("div");
        container.className = "recommendation-container";

        for (const movie of recommendations) {
            const { posterUrl } = await fetchMovieDetails(movie);

            const card = document.createElement("div");
            card.className = "movie-card";

            const poster = document.createElement("img");
            poster.src = posterUrl
                ? posterUrl
                : "https://via.placeholder.com/200x300?text=No+Poster"; // Display placeholder if no poster
            poster.alt = `${movie} Poster`;
            poster.className = "movie-poster";

            const title = document.createElement("h3");
            title.textContent = movie;

            card.appendChild(poster);
            card.appendChild(title);
            container.appendChild(card);
        }

        recommendationsDiv.appendChild(container);
    } else {
        recommendationsDiv.innerHTML = "<p>No recommendations available.</p>";
    }
}
