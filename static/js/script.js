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

    // Simulate getting movie titles based on genres
    const recommendedMovies = await fetch("/recommend-genres", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ genres: selectedGenres }),
    });

    const movieTitles = await recommendedMovies.json();

    // Fetch posters from OMDb API
    const recommendations = await Promise.all(
        movieTitles.map(async (movieTitle) => {
            const response = await fetch(
                `https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=b5588811`
            );
            const data = await response.json();
            return {
                title: data.Title || movieTitle,
                posterUrl: data.Poster !== "N/A" ? data.Poster : "placeholder-image-url.jpg", // Fallback poster
                id: data.imdbID || "",
            };
        })
    );

    displayRecommendations(recommendations);
});

function displayRecommendations(recommendations) {
    const container = document.getElementById("recommendation-container");
    container.innerHTML = ""; // Clear existing recommendations

    recommendations.forEach((movie) => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const poster = document.createElement("img");
        poster.src = movie.posterUrl;
        poster.alt = `${movie.title} Poster`;
        poster.className = "movie-poster";

        const title = document.createElement("h3");
        title.textContent = movie.title;

        const moreInfo = document.createElement("a");
        moreInfo.href = `https://www.imdb.com/title/${movie.id}`;
        moreInfo.target = "_blank";
        moreInfo.textContent = "More Info";
        moreInfo.className = "more-info";

        card.appendChild(poster);
        card.appendChild(title);
        card.appendChild(moreInfo);

        container.appendChild(card);
    });
}
