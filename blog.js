const sortPosts = document.getElementById("sortPosts");
const postList = document.getElementById("postList");

function sortPostEntries() {
    const posts = Array.from(postList.querySelectorAll(".post-entry"));

    posts.sort(function(a, b) {
        const dateA = new Date(a.dataset.date);
        const dateB = new Date(b.dataset.date);

        if (sortPosts.value === "oldest") {
            return dateA - dateB;
        }

        return dateB - dateA;
    });

    posts.forEach(function(post) {
        postList.appendChild(post);
    });
}

sortPosts.addEventListener("change", sortPostEntries);

sortPostEntries();
