// Bonus: GET existing posts and show the latest 5
async function loadPosts() {
  const postsList = document.getElementById("postsList");

  try {
    const response = await fetch("http://localhost:3000/posts?_sort=id&_order=desc&_limit=5");

    if (!response.ok) {
      throw new Error("Failed to load posts.");
    }

    const posts = await response.json();

    postsList.innerHTML = ""; // clear "Loading..."

    posts.forEach(function (post) {
      const li = document.createElement("li");
      li.textContent = `#${post.id} — ${formatTitle(post.message)}`;
      postsList.appendChild(li);
    });

  } catch (error) {
    postsList.innerHTML = "<li>Could not load feedback right now.</li>";
  }
}

// Capitalize and shorten long titles so the list reads cleanly
function formatTitle(title) {
  const capitalized = title.charAt(0).toUpperCase() + title.slice(1);
  return capitalized.length > 45 ? capitalized.slice(0, 45) + "..." : capitalized;
}

// Add the just-submitted feedback to the top of the visible list
function prependNewPost(id, message) {
  const postsList = document.getElementById("postsList");
  const li = document.createElement("li");
  li.textContent = `#${id} — ${formatTitle(message)}`;
  li.className = "new-post";
  postsList.prepend(li);

  // Keep the list to a max of 5 items
  while (postsList.children.length > 5) {
    postsList.removeChild(postsList.lastChild);
  }
}

loadPosts();


const form = document.getElementById("feedbackForm");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");
const messageField = document.getElementById("message");
const charCount = document.getElementById("charCount");

// Bonus: live character counter (e.g. "142 / 500")
messageField.addEventListener("input", function () {
  charCount.textContent = `${messageField.value.length} / 500`;
});

form.addEventListener("submit", async function (e) {
  e.preventDefault(); // stop page reload

  // 1. Read values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const category = document.getElementById("category").value;
  const rating = document.getElementById("rating").value;
  const message = document.getElementById("message").value.trim();

  // 2. Clear old errors
  document.getElementById("nameError").textContent = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("categoryError").textContent = "";
  document.getElementById("ratingError").textContent = "";
  document.getElementById("messageError").textContent = "";
  statusMessage.textContent = "";
  statusMessage.className = "";

  // 3. Validate
  let isValid = true;

  if (name.length < 3 || name.length > 50) {
    document.getElementById("nameError").textContent = "Name must be 3–50 characters.";
    isValid = false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    document.getElementById("emailError").textContent = "Enter a valid email address.";
    isValid = false;
  }

  if (!category) {
    document.getElementById("categoryError").textContent = "Please choose a category.";
    isValid = false;
  }

  if (!rating) {
    document.getElementById("ratingError").textContent = "Please choose a rating.";
    isValid = false;
  }

  if (message.length < 10 || message.length > 500) {
    document.getElementById("messageError").textContent = "Message must be 10–500 characters.";
    isValid = false;
  }

  if (!isValid) return; // stop here if any field failed

  // 4. Send to the mock API
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner"></span>Sending...';
  statusMessage.textContent = "";

  try {
    const response = await fetch("http://localhost:3000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, category, rating, message }),
    });

    if (!response.ok) {
      throw new Error("Server responded with an error.");
    }

    const data = await response.json();

    statusMessage.textContent = `Thanks, ${name}! Saved with ID ${data.id}.`;
    statusMessage.className = "success";
    prependNewPost(data.id, message);
    form.reset();
    charCount.textContent = "0 / 500";

  } catch (error) {
    statusMessage.textContent = "Something went wrong. Please try again.";
    statusMessage.className = "failure";
    // Note: we do NOT reset the form here, so the user keeps their input.
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
  }
});