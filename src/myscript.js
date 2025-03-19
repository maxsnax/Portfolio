tailwind.config = {
    corePlugins: {
        preflight: false, // Disables Tailwind's default reset
    },
    theme: {
        extend: {
            colors: {
                clifford: '#da373d',
            },
            height: {
                "1/2": "50vh",
            },
        },
        backgroundImage: {
            "home": "url('./images/background2.jpg')",
        }
    }
};



window.onload = function () {
    var typed = new Typed("#text", {
        strings: [
            "Student",
            "Software Developer",
            "Web Developer",
            "Programmer",
            "Learner",
        ],
        typeSpeed: 100,
        backSpeed: 100,
        backDelay: 1000,
        loop: true,
    });
};


const GITHUB_USERNAME = "maxsnax";
const TOKEN = githubConfig.GITHUB_TOKEN;
console.log('Token first 10 chars:', TOKEN.substring(0, 10));

// Add token to main repos fetch
fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
    headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28'
    }
})
.then(response => {
    if (!response.ok) {
        return response.json().then(error => {
            console.error('GitHub API Error:', error);
            throw new Error(`GitHub API responded with status ${response.status}`);
        });
    }
    return response.json();
})
.then(repos => {
    if (!Array.isArray(repos)) {
        console.error('Unexpected response format:', repos);
        throw new Error('Response is not an array');
    }
    repos.forEach(repo => {
        // Your existing code
    });
})
.catch(error => console.error("Error fetching user repositories:", error));

const projectsContainer = document.getElementById("projects-container");

//
//
//
function fetchLanguages(owner, repoName) {
    return fetch(`https://api.github.com/repos/${owner}/${repoName}/languages`, {
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    .then(response => response.json())
    .then(languages => Object.keys(languages).sort().join(", "))
    .catch(() => "");
}

function fetchReadme(owner, repoName) {
    return fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`, {
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${TOKEN}`,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("README not available");
        return response.json();
    })
    .then(data => {
        const decodedContent = atob(data.content);
        return decodedContent.split("\n").slice().join("<br>");
    })
    .catch(() => "No README available.");
}

function createProjectCard(repoName, repoUrl, description, languageList, readmeContent, images = []) {
    const projectFolder = `./images/thumbnails/${repoName.toLowerCase()}/`;
    const projectDiv = document.createElement("div");
    projectDiv.classList.add("md", "max-w-3xl", "w-full", "mx-auto", "flex", "flex-col", "items-left", "space-y-4", "mb-10", "p-6", "bg-white", "shadow-md", "rounded-lg");

    const gallery = document.createElement("div");
    gallery.classList.add("gallery", "flex", "justify-left", "space-x-2");

    images.forEach((imageName, index) => {
        const imagePath = `${projectFolder}${imageName}`;

        const link = document.createElement("a");
        link.href = imagePath;
        link.setAttribute("data-lightbox", repoName.toLowerCase());
        link.setAttribute("data-title", imageName);

        const img = document.createElement("img");
        img.src = imagePath;
        img.alt = imageName;

        if (index === 0) {
            img.classList.add("w-52", "h-52", "object-cover", "rounded-lg");
        } else {
            img.classList.add("w-16", "h-16", "object-cover", "rounded-md", "hover:scale-110", "transition");
        }

        link.appendChild(img);
        gallery.appendChild(link);
    });

    const readmeId = `readme-${repoName.replace(/\s+/g, "-").toLowerCase()}`;
    const readmeButton = readmeContent && readmeContent !== "No README available."
        ? `<button class="text-gray-800 px-4 py-2 mt-2 rounded" onclick="toggleReadme('${readmeId}')">
                README ⌄
           </button>
           <div id="${readmeId}" class="bg-gray-100 p-3 mt-2 rounded hidden">
                <p>${readmeContent}</p>
           </div>`
        : "";

    projectDiv.innerHTML += `
        <div class="text-center">
            <a href="${repoUrl}" target="_blank">
                <h3 class="text-3xl font-bold text-blue-900 my-1">${repoName}</h3>
            </a>
            <p><strong>${languageList}</strong></p>
            <p>${description || "No description available."}</p>
            ${readmeButton}
        </div>
    `;

    projectDiv.appendChild(gallery);

    return projectDiv; // ✅ Ensure function returns the created element
}




function toggleReadme(readmeId) {
    const readmeDiv = document.getElementById(readmeId);
    if (readmeDiv) {
        readmeDiv.classList.toggle("hidden");
    } else {
        console.error(`README div with ID ${readmeId} not found.`);
    }
}

window.toggleReadme = toggleReadme;

function fetchAndDisplayRepositories() {
    Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }).then(response => response.json()),

        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }).then(response => response.json())
    ])
    .then(([ownedRepos, events]) => {
        if (!Array.isArray(ownedRepos)) {
            throw new Error("Expected an array of owned repositories");
        }
        if (!Array.isArray(events)) {
            throw new Error("Expected an array of user events");
        }

        console.log("Fetched Owned Repositories:", ownedRepos);
        console.log("Fetched Contribution Events:", events);

        const repoMap = new Map();

        // ✅ Add owned repositories
        ownedRepos.forEach(repo => {
            repoMap.set(repo.name.toLowerCase(), {
                name: repo.name,
                url: repo.html_url,
                description: repo.description || "No description available.",
                owner: repo.owner.login,
                isContributed: false // ❌ Not a contribution, it's owned
            });
        });

        // ✅ Add contributed repositories if not already added
        events.forEach(event => {
            if (event.type === "PushEvent" || event.type === "PullRequestEvent") {
                const repoFullName = event.repo.name; // "owner/reponame"
                const [repoOwner, repoName] = repoFullName.split("/");

                // ✅ Only add it if it's not already in repoMap
                if (!repoMap.has(repoName.toLowerCase())) {
                    repoMap.set(repo.name.toLowerCase(), {
                        name: repo.name,  // Keep original casing for display
                        url: repo.html_url,
                        description: repo.description || "No description available.",
                        owner: repo.owner.login,
                        isContributed: false
                    });
                }
            }
        });

        // ✅ Ensure projects appear in `projectImages` order
        const sortedProjects = [...projectImages].sort((a, b) => a.index - b.index);

        console.log("Final Repo Map:", repoMap);
        console.log("Sorted Projects:", sortedProjects.map(p => p.name));

        // ✅ Store project cards in an array first
        const projectCards = [];

        const fetchPromises = sortedProjects.map((project, index) => {
            const repoName = project.name.toLowerCase();

            if (repoMap.has(repoName)) {
                const repoData = repoMap.get(repoName);

                return Promise.all([
                    fetchLanguages(repoData.owner, repoData.name),
                    fetchReadme(repoData.owner, repoData.name)
                ]).then(([languageList, readmeContent]) => {
                    // ✅ Store the project card instead of appending immediately
                    projectCards.push({
                        index: project.index, // Ensure order consistency
                        cardHtml: createProjectCard(
                            repoData.name, 
                            repoData.url, 
                            repoData.description, 
                            languageList, 
                            readmeContent, 
                            project.images, 
                            repoData.isContributed
                        )
                    });
                });
            } else {
                console.warn(`⚠️ Project not found in GitHub API: ${repoName}`);
                projectCards.push({
                    index: project.index,
                    cardHtml: createProjectCard(
                        project.name, "#", "Project not found in GitHub", "", "No README available.", project.images, false
                    )
                });
                return Promise.resolve(); // Avoid breaking the Promise chain
            }
        });

        // ✅ After all projects are processed, append in correct order
        Promise.all(fetchPromises).then(() => {
            projectCards.sort((a, b) => a.index - b.index); // Sort again before appending
            const projectsContainer = document.getElementById("projects-container");
            projectCards.forEach(project => projectsContainer.appendChild(project.cardHtml));
        });
    })
    .catch(error => console.error("Error fetching repositories:", error));
}


// Call the function to fetch and display repositories
fetchAndDisplayRepositories();
