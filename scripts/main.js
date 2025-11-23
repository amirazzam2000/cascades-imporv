const page = document.documentElement.dataset.page || "landing";
const brandEl = document.getElementById("brand");
const navLinksEl = document.getElementById("nav-links");
const menuToggle = document.getElementById("menu-toggle");
const footerBrandEl = document.getElementById("footer-brand");
const brandTaglineEl = document.getElementById("brand-tagline");
const footerContactEl = document.getElementById("footer-contact");
const modalOverlay = document.getElementById("modal-overlay");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

init();

async function init() {
  const site = await loadSiteData();
  renderNav(site);
  renderFooter(site);
  wireModal();
  wireMenu();

  if (page === "landing") {
    await renderLanding(site);
  } else if (page === "shows") {
    await renderShows();
  } else if (page === "about") {
    await renderMembers();
  } else if (page === "photos") {
    await renderPhotos();
  }
}

async function loadSiteData() {
  const fallback = {
    name: "Cascades",
    tagline: "Improv that flows wherever it wants.",
    nav: [
      { label: "Home", href: "index.html" },
      { label: "Shows", href: "shows.html" },
      { label: "About", href: "about.html" },
      { label: "Photos", href: "photos.html" }
    ],
    contact: { email: "hi@cascadesimprov.com" }
  };

  try {
    const data = await loadJSON("data/site.json");
    return { ...fallback, ...data };
  } catch (err) {
    console.warn("Using fallback site data", err);
    return fallback;
  }
}

function renderNav(site) {
  if (brandEl) brandEl.textContent = site.name;
  if (brandTaglineEl) brandTaglineEl.textContent = site.tagline;
  if (!navLinksEl) return;
  navLinksEl.innerHTML = "";
  site.nav.forEach((item) => {
    const link = document.createElement("a");
    link.href = item.href;
    link.textContent = item.label;
    if ((page === "landing" && item.href.includes("index")) || item.href.includes(page)) {
      link.classList.add("active");
    }
    navLinksEl.appendChild(link);
  });
}

function renderFooter(site) {
  if (footerBrandEl) footerBrandEl.textContent = site.tagline || site.name;
  if (!footerContactEl) return;
  footerContactEl.innerHTML = "";
  if (site.contact?.email) {
    const email = document.createElement("a");
    email.href = `mailto:${site.contact.email}`;
    email.textContent = site.contact.email;
    footerContactEl.appendChild(email);
  }
  if (site.contact?.instagram) {
    const insta = document.createElement("a");
    insta.href = site.contact.instagram;
    insta.textContent = "Instagram";
    insta.target = "_blank";
    insta.rel = "noopener";
    if (footerContactEl.childNodes.length) {
      footerContactEl.appendChild(document.createTextNode(" | "));
    }
    footerContactEl.appendChild(insta);
  }
}

async function renderLanding(site) {
  const heroTitle = document.getElementById("hero-title");
  const heroDescription = document.getElementById("hero-description");
  const heroEyebrow = document.getElementById("hero-eyebrow");
  const heroImage = document.getElementById("hero-image");
  const primaryCta = document.getElementById("hero-cta-primary");
  const secondaryCta = document.getElementById("hero-cta-secondary");
  const nextShowCard = document.getElementById("next-show-card");
  const nextShowSummary = document.getElementById("next-show-summary");
  const galleryGrid = document.getElementById("gallery-grid");
  const peopleGrid = document.getElementById("people-grid");
  const aboutParagraph = document.getElementById("about-paragraph");
  const testimonialList = document.getElementById("testimonial-list");

  const fallback = {
    title: site.name,
    eyebrow: "Live improv",
    description: site.tagline,
    heroImage: "data/assets/hero-cover.svg",
    about: "Cascades is a warm, playful improv crew that builds shows from your stories, music loops, and the energy in the room.",
    testimonials: [
      { quote: "Felt like hanging out with hilarious friends who happened to make a show.", name: "Maya P.", context: "Audience" },
      { quote: "They made up a full musical about my cat. I cried laughing.", name: "Jordan V.", context: "Regular" },
      { quote: "Smart, weird, and kind. You leave lighter than you came in.", name: "Taylor S.", context: "First-timer" }
    ],
    gallery: [
      { src: "data/assets/gallery-1.svg", alt: "Cascades laughing backstage" },
      { src: "data/assets/gallery-2.svg", alt: "Two improvisers in a dramatic scene" },
      { src: "data/assets/gallery-3.svg", alt: "Crowd suggestions on sticky notes" },
      { src: "data/assets/gallery-4.svg", alt: "Cascades taking a bow" }
    ],
    ctaPrimary: "See shows",
    ctaPrimaryHref: "shows.html",
    ctaSecondary: "Meet the troupe",
    ctaSecondaryHref: "about.html"
  };

  let landing = fallback;
  try {
    const data = await loadJSON("data/landing.json");
    landing = { ...fallback, ...data };
  } catch (err) {
    console.warn("Using fallback landing data", err);
  }

  if (heroTitle) heroTitle.textContent = landing.title;
  if (heroEyebrow) heroEyebrow.textContent = landing.eyebrow;
  if (heroDescription) heroDescription.textContent = landing.description;
  if (heroImage && landing.heroImage) {
    heroImage.src = landing.heroImage;
    heroImage.alt = `${landing.title} group photo`;
  }
  if (heroImage) heroImage.loading = "eager";
  if (primaryCta) {
    primaryCta.textContent = landing.ctaPrimary;
    primaryCta.href = landing.ctaPrimaryHref;
  }
  if (secondaryCta) {
    secondaryCta.textContent = landing.ctaSecondary;
    secondaryCta.href = landing.ctaSecondaryHref;
  }

  if (aboutParagraph) aboutParagraph.textContent = landing.about;

  if (galleryGrid && landing.gallery) {
    galleryGrid.innerHTML = "";
    landing.gallery.forEach((img) => {
      const figure = document.createElement("div");
      figure.innerHTML = `<img class="gallery-img" src="${img.src}" alt="${img.alt || "Cascades moment"}" loading="lazy" />`;
      galleryGrid.appendChild(figure);
    });
  }

  if (testimonialList && landing.testimonials) {
    testimonialList.innerHTML = "";
    landing.testimonials.forEach((item) => {
      const card = document.createElement("div");
      card.className = "testimonial-card";
      card.innerHTML = `
        <p class="testimonial-quote">"${item.quote}"</p>
        <div class="testimonial-meta">${item.name}${item.context ? ` · ${item.context}` : ""}</div>
      `;
      testimonialList.appendChild(card);
    });
  }

  if (peopleGrid) {
    const members = await fetchMembers();
    peopleGrid.innerHTML = "";
    members.forEach((member) => peopleGrid.appendChild(buildMemberCard(member, true)));
  }

  try {
    const shows = await getShows();
    if (shows.length) {
      const next = shows[0];
      if (nextShowSummary) {
        nextShowSummary.textContent = `${formatDate(next.date)} - ${next.venue}${next.city ? `, ${next.city}` : ""}`;
      }
      if (nextShowCard) {
        nextShowCard.innerHTML = "";
        nextShowCard.appendChild(buildShowCard(next, true));
      }
    }
  } catch (err) {
    console.warn("No upcoming shows yet", err);
  }
}

async function renderShows() {
  const list = document.getElementById("shows-list");
  if (!list) return;
  list.innerHTML = "";
  try {
    const shows = await getShows();
    if (!shows.length) {
      list.innerHTML = "<p class=\"muted\">No shows booked just yet. Stay tuned!</p>";
      return;
    }
    shows.forEach((show) => list.appendChild(buildShowCard(show)));
  } catch (err) {
    list.innerHTML = "<p class=\"muted\">We couldn't load the shows. Check the data/shows folder.</p>";
  }
}

async function renderPhotos() {
  const grid = document.getElementById("photos-grid");
  const instagramLink = document.getElementById("photos-instagram-link");
  if (!grid) return;
  grid.innerHTML = "";
  const note = document.createElement("p");
  note.className = "muted";
  note.style.marginBottom = "10px";
  note.textContent = "Instagram blocks direct browser pulls; add image URLs in data/instagram/index.json or drop files in data/assets.";
  grid.parentElement?.insertBefore(note, grid);
  const fallbackPhotos = [
    { src: "data/assets/gallery-1.svg", alt: "Backstage laughs" },
    { src: "data/assets/gallery-2.svg", alt: "On-stage duo" },
    { src: "data/assets/gallery-3.svg", alt: "Audience prompts" },
    { src: "data/assets/gallery-4.svg", alt: "Taking a bow" }
  ];

  try {
    const data = await loadJSON("data/instagram/index.json");
    const photos = data.photos?.length ? data.photos : fallbackPhotos;
    if (instagramLink && data.source) {
      instagramLink.href = data.source;
      instagramLink.textContent = "See more on Instagram";
    }
    photos.forEach((photo) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <img class="gallery-img" src="${photo.src}" alt="${photo.alt || "Cascades photo"}" loading="lazy" />
      `;
      grid.appendChild(wrap);
    });
  } catch (err) {
    fallbackPhotos.forEach((photo) => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <img class="gallery-img" src="${photo.src}" alt="${photo.alt || "Cascades photo"}" loading="lazy" />
      `;
      grid.appendChild(wrap);
    });
  }
}

async function renderMembers() {
  const grid = document.getElementById("members-grid");
  if (!grid) return;
  grid.innerHTML = "";
  const members = await fetchMembers();
  members.forEach((member) => grid.appendChild(buildMemberCard(member, true)));
}

async function fetchMembers() {
  const fallbackMembers = [
    {
      slug: "jules",
      name: "Jules Park",
      role: "Host & keys",
      quote: "I'll write a song about your backpack right now.",
      bio: "Jules drives the pacing, comps on piano, and keeps the audience inside the bit.",
      photo: "data/members/jules/photo.svg"
    },
    {
      slug: "riley",
      name: "Riley Cruz",
      role: "Characters",
      quote: "If I enter as a raccoon, please clap.",
      bio: "Riley goes from heartfelt to absurd in one breath, always heightening the weirdness.",
      photo: "data/members/riley/photo.svg"
    },
    {
      slug: "sam",
      name: "Sam Verma",
      role: "Game brain",
      quote: "My superpower is making sense of chaos.",
      bio: "Sam spots the game fast, connects threads, and tags at the perfect moment.",
      photo: "data/members/sam/photo.svg"
    }
  ];

  try {
    const membersIndex = await loadJSON("data/members/members.json");
    const members = await Promise.all(
      (membersIndex.members || []).map(async (slug) => {
        const info = await loadJSON(`data/members/${slug}/info.json`);
        return { slug, ...info };
      })
    );
    return members.length ? members : fallbackMembers;
  } catch (err) {
    console.warn("Using fallback members", err);
    return fallbackMembers;
  }
}

async function getShows() {
  const data = await loadJSON("data/shows/index.json");
  const sorted = (data.upcoming || []).sort((a, b) => new Date(a.date) - new Date(b.date));
  return sorted.filter((s) => new Date(s.date) >= new Date());
}

async function loadJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

function buildShowCard(show, highlight = false) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    ${show.poster ? `<img class="show-poster" src="${show.poster}" alt="${show.title} poster" loading="lazy" />` : ""}
    <div class="tag">${formatDate(show.date)}</div>
    <h3>${show.title}</h3>
    <p>${show.venue}${show.city ? ` - ${show.city}` : ""}</p>
    <p>${show.description || ""}</p>
    ${show.ticketUrl ? `<a class="ghost" href="${show.ticketUrl}" target="_blank" rel="noopener">Tickets</a>` : ""}
  `;
  const ticketLink = card.querySelector("a");
  if (ticketLink) ticketLink.addEventListener("click", (e) => e.stopPropagation());
  card.addEventListener("click", () => openShowModal(show));
  if (highlight) card.classList.add("highlight");
  return card;
}

function buildMemberCard(member, clickable = false) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <img class="member-photo" src="${member.photo}" alt="${member.name}" loading="lazy" />
    <div class="member-meta">
      <h3 style="margin:0">${member.name}</h3>
      <span>&bull;</span>
      <span>${member.role || "Improv"}</span>
    </div>
    <p class="member-quote">"${member.quote || "Give us a suggestion."}"</p>
    <p>${member.bio || "Add their bio in the data folder."}</p>
  `;
  if (clickable) {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => openMemberModal(member));
  }
  return card;
}

function formatDate(dateInput) {
  const date = new Date(dateInput);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function openShowModal(show) {
  const body = `
    ${show.poster ? `<img class="show-poster" src="${show.poster}" alt="${show.title} poster" />` : ""}
    <h3>${show.title}</h3>
    <p><strong>When:</strong> ${formatDate(show.date)}</p>
    <p><strong>Where:</strong> ${show.venue}${show.city ? ` - ${show.city}` : ""}</p>
    <p>${show.description || ""}</p>
    ${show.ticketUrl ? `<p><a class="btn" href="${show.ticketUrl}" target="_blank" rel="noopener">Get tickets</a></p>` : ""}
  `;
  openModal(body);
}

function openMemberModal(member) {
  const body = `
    <img class="member-photo" src="${member.photo}" alt="${member.name}" />
    <h3>${member.name}</h3>
    <p><strong>${member.role || "Improv"}</strong></p>
    <p class="member-quote">"${member.quote || ""}"</p>
    <p>${member.bio || ""}</p>
  `;
  openModal(body);
}

function wireModal() {
  if (modalOverlay) modalOverlay.hidden = true;
  if (modalClose) modalClose.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}

function wireMenu() {
  if (!menuToggle || !navLinksEl) return;
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinksEl.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
  navLinksEl.addEventListener("click", (e) => {
    if (e.target.tagName.toLowerCase() === "a") {
      navLinksEl.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

function openModal(html) {
  if (!modalOverlay || !modalBody) return;
  modalBody.innerHTML = html;
  modalOverlay.hidden = false;
}

function closeModal() {
  if (!modalOverlay || !modalBody) return;
  modalOverlay.hidden = true;
  modalBody.innerHTML = "";
}
