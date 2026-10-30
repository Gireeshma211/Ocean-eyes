const form = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const resultCount = document.getElementById("resultCount");
const chips = document.querySelectorAll(".chip");

// Search for images
async function searchImages(query) {
    query = query.trim();

    // Ignore blank searches
    if (query === "") {
        return;
    }

    // Clear previous results
    results.innerHTML = "";
    resultCount.textContent = `Searching for "${query}"...`;

    const url =
        "https://commons.wikimedia.org/w/api.php" +
        "?action=query" +
        "&generator=search" +
        "&gsrsearch=" + encodeURIComponent(query) +
        "&gsrnamespace=6" +
        "&gsrlimit=12" +
        "&prop=imageinfo" +
        "&iiprop=url" +
        "&iiurlwidth=500" +
        "&format=json" +
        "&origin=*";

    try {
        const response = await fetch(url);

        // Check the response before processing it
        if (!response.ok) {
            throw new Error("Image search failed");
        }

        const data = await response.json();

        const pages = data.query?.pages
            ? Object.values(data.query.pages)
            : [];

        resultCount.textContent =
            `Showing ${pages.length} results for "${query}"`;

        if (pages.length === 0) {
            results.textContent = "No images found. Try another search!";
            return;
        }

        pages.forEach(function (page) {
            const imageInfo = page.imageinfo?.[0];

            if (!imageInfo) {
                return;
            }

            // Create a card
            const card = document.createElement("div");
            card.className = "image-card";

            // Create the image
            const image = document.createElement("img");
            image.src = imageInfo.thumburl || imageInfo.url;
            image.alt = page.title.replace("File:", "");
            image.loading = "lazy";

            // Create the caption
            const caption = document.createElement("p");
            caption.textContent = page.title.replace("File:", "");

            // Link to the original image page
            const link = document.createElement("a");
            link.href = imageInfo.descriptionurl || imageInfo.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            link.appendChild(image);
            link.appendChild(caption);
            card.appendChild(link);

            results.appendChild(card);
        });

    } catch (error) {
        resultCount.textContent = "Couldn't load images. Please try again.";
        console.error("Image search error:", error);
    }
}

// Catch form submission
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const query = searchInput.value;
    searchImages(query);
});

// Make quick-pick chips perform searches
chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
        const query = chip.dataset.query;

        searchInput.value = query;
        searchImages(query);
    });
});
