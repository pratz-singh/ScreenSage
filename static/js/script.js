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
                imdbUrl: movie.id
                    ? `https://www.imdb.com/title/tt${movie.id}/`
                    : "https://www.imdb.com/", // IMDb URL if available
            };
        } else {
            return { posterUrl: null, imdbUrl: "https://www.imdb.com/" }; // Default IMDb link
        }
    } catch (error) {
        console.error(`Error fetching details for ${movieName}:`, error);
        return { posterUrl: null, imdbUrl: "https://www.imdb.com/" }; // Handle errors
    }
}

async function displayRecommendations(recommendations) {
    const recommendationsDiv = document.getElementById("recommendations");
    recommendationsDiv.innerHTML = ""; // Clear existing content

    if (recommendations.length > 0) {
        recommendationsDiv.innerHTML = "<h3>Recommendations:</h3>";
        const container = document.createElement("div");
        container.className = "recommendation-container";

        for (const movie of recommendations) {
            const { posterUrl, imdbUrl } = await fetchMovieDetails(movie);

            // Create a card for each movie
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

            const moreInfo = document.createElement("a");
            moreInfo.href = imdbUrl;
            moreInfo.textContent = "More Info";
            moreInfo.target = "_blank"; // Open IMDb page in a new tab
            moreInfo.style.color = "blue";

            card.appendChild(poster);
            card.appendChild(title);
            card.appendChild(moreInfo);
            container.appendChild(card);
        }

        recommendationsDiv.appendChild(container);
    } else {
        recommendationsDiv.innerHTML = "<p>No recommendations available.</p>";
    }
}

// Load movie posters on page startup
window.addEventListener("DOMContentLoaded", async function () {
    const savedRecommendations = JSON.parse(localStorage.getItem("recommendations") || "[]");
    if (savedRecommendations.length > 0) {
        await displayRecommendations(savedRecommendations);
    }
});
