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

function displayRecommendations(recommendations) {
    const recommendationsDiv = document.getElementById("recommendations");
    if (recommendations.length > 0) {
        recommendationsDiv.innerHTML = "<h3>Recommendations:</h3><ul>" +
            recommendations.map(movie => `<li>${movie}</li>`).join("") +
            "</ul>";
    } else {
        recommendationsDiv.innerHTML = "<p>No recommendations available.</p>";
    }
}
