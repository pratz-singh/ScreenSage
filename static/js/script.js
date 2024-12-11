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
    displayRecommendations(data.recommendations);
});

async function fetchMoviePoster(movieName) {
    const apiKey = "19f7029362cd02135ed85c4810b35313"; // TMDb API Key
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const posterPath = data.results[0].poster_path;
            return posterPath
                ? `https://image.tmdb.org/t/p/w500${posterPath}` // TMDb poster URL
                : await fetchFallbackPoster(movieName); // Fallback for missing poster
        } else {
            return await fetchFallbackPoster(movieName); // Fallback if movie not found
        }
    } catch (error) {
        console.error(`Error fetching poster for ${movieName}:`, error);
        return "https://via.placeholder.com/200x300?text=Error+Loading+Poster"; // Placeholder for errors
    }
}

async function fetchFallbackPoster(movieName) {
    // Attempt IMDb link as fallback
    const imdbSearchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(movieName)}`;
    console.warn(`Fallback: IMDb search URL - ${imdbSearchUrl}`);
    return imdbSearchUrl;
}

async function displayRecommendations(recommendations) {
    const recommendationsDiv = document.getElementById("recommendations");
    recommendationsDiv.innerHTML = ""; // Clear existing content

    if (recommendations.length > 0) {
        recommendationsDiv.innerHTML = "<h3>Recommendations:</h3>";
        const container = document.createElement("div");
        container.className = "recommendation-container";

        for (const movie of recommendations) {
            const posterUrl = await fetchMoviePoster(movie); // Fetch poster for each movie

            // Create a card for each movie
            const card = document.createElement("div");
            card.className = "movie-card";

            const poster = document.createElement("img");
            poster.src = posterUrl;
            poster.alt = `${movie} Poster`;
            poster.className = "movie-poster";

            const title = document.createElement("h3");
            title.textContent = movie;

            const link = document.createElement("a");
            link.href = posterUrl.includes("imdb") ? posterUrl : "#";
            link.textContent = "More Info";
            link.target = "_blank";
            link.style.color = "blue";

            card.appendChild(poster);
            card.appendChild(title);
            card.appendChild(link);
            container.appendChild(card);
        }

        recommendationsDiv.appendChild(container);
    } else {
        recommendationsDiv.innerHTML = "<p>No recommendations available.</p>";
    }
}

