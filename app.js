
console.log("Modern Portfolio Loaded");

/* =========================
   MOTION PREFERENCE
========================= */

const motionPreference = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

/* =========================
   SCROLL REVEAL
========================= */

const hiddenElements = document.querySelectorAll(".hidden");

if ("IntersectionObserver" in window) {

  document.body.classList.add("animations-ready");

  const observer = new IntersectionObserver((entries) => {

    entries.forEach((entry) => {

      if (entry.isIntersecting) {

        entry.target.classList.add("show");

        observer.unobserve(entry.target);

      }

    });

  }, {
    threshold: 0.05
  });

  hiddenElements.forEach((element) => {

    observer.observe(element);

  });

}

/* =========================
   THEME TOGGLE
========================= */

const themeToggle = document.getElementById("theme-toggle");

let savedTheme = "dark";

try {

  savedTheme = localStorage.getItem("portfolio-theme") || "dark";

} catch (error) {

  console.log("Theme storage unavailable.");

}

function applyTheme(theme) {

  const isLight = theme === "light";

  document.body.classList.toggle("light-mode", isLight);

  themeToggle.textContent = isLight ? "☾" : "☀";

  themeToggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode"
  );

}

applyTheme(savedTheme);

themeToggle.addEventListener("click", () => {

  const isLight = document.body.classList.contains("light-mode");

  const newTheme = isLight ? "dark" : "light";

  applyTheme(newTheme);

  try {

    localStorage.setItem("portfolio-theme", newTheme);

  } catch (error) {

    console.log("Theme could not be saved.");

  }

});

/* =========================
   MOBILE NAVIGATION
========================= */

const menuToggle = document.getElementById("menu-toggle");

const navMenu = document.getElementById("nav-menu");

function closeMenu() {

  navMenu.classList.remove("open");

  menuToggle.textContent = "☰";

  menuToggle.setAttribute("aria-expanded", "false");

}

menuToggle.addEventListener("click", () => {

  const isOpen = navMenu.classList.toggle("open");

  menuToggle.textContent = isOpen ? "✕" : "☰";

  menuToggle.setAttribute("aria-expanded", String(isOpen));

});

document.querySelectorAll("#nav-menu a").forEach((link) => {

  link.addEventListener("click", closeMenu);

});

document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {

    closeMenu();

  }

});

/* =========================
   SCROLL PROGRESS
   & ACTIVE NAVIGATION
========================= */

const progressBar = document.getElementById("scroll-progress");

const navLinks = document.querySelectorAll("#nav-menu a");

const sections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

let scrollScheduled = false;

function updateScroll() {

  const scrollTop = window.scrollY;

  const scrollHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  const progress = scrollHeight > 0
    ? (scrollTop / scrollHeight) * 100
    : 0;

  progressBar.style.width = `${Math.min(100, progress)}%`;

  let current = "";

  sections.forEach((section) => {

    if (scrollTop >= section.offsetTop - 180) {

      current = section.id;

    }

  });

  navLinks.forEach((link) => {

    const isActive =
      link.getAttribute("href") === `#${current}`;

    link.classList.toggle("active", isActive);

    if (isActive) {

      link.setAttribute("aria-current", "location");

    } else {

      link.removeAttribute("aria-current");

    }

  });

  scrollScheduled = false;

}

window.addEventListener("scroll", () => {

  if (!scrollScheduled) {

    scrollScheduled = true;

    requestAnimationFrame(updateScroll);

  }

}, { passive: true });

updateScroll();

/* =========================
   PROJECT FILTERS
========================= */

const filterButtons = document.querySelectorAll(".filter-btn");

const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {

  button.addEventListener("click", () => {

    filterButtons.forEach((item) => {

      item.classList.remove("active");

      item.setAttribute("aria-pressed", "false");

    });

    button.classList.add("active");

    button.setAttribute("aria-pressed", "true");

    const filter = button.dataset.filter;

    projectCards.forEach((card) => {

      const categories = card.dataset.category.split(" ");

      const isVisible =
        filter === "all" || categories.includes(filter);

      card.hidden = !isVisible;

      if (isVisible && !motionPreference.matches && card.animate) {

        card.animate(
          [
            {
              opacity: 0,
              transform: "translateY(15px)"
            },
            {
              opacity: 1,
              transform: "translateY(0)"
            }
          ],
          {
            duration: 350,
            easing: "ease-out"
          }
        );

      }

    });

  });

});

/* =========================
   3D PROJECT CARD EFFECT
========================= */

const desktopPointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
);

projectCards.forEach((card) => {

  card.addEventListener("mousemove", (event) => {

    if (motionPreference.matches || !desktopPointer.matches) {

      return;

    }

    const rect = card.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width;

    const y = (event.clientY - rect.top) / rect.height;

    const rotateX = (0.5 - y) * 7;

    const rotateY = (x - 0.5) * 7;

    card.style.transform =
      `perspective(1000px)
       rotateX(${rotateX}deg)
       rotateY(${rotateY}deg)
       translateY(-5px)`;

  });

  card.addEventListener("mouseleave", () => {

    card.style.transform = "";

  });

});

/* =========================
   ANIMATED NETWORK BACKGROUND
========================= */

const canvas = document.getElementById("networkCanvas");

const ctx = canvas.getContext("2d");

if (ctx) {

  let particles = [];

  let width = 0;

  let height = 0;

  let animationId = null;

  let mouse = {
    x: null,
    y: null
  };

  function resizeCanvas() {

    width = window.innerWidth;

    height = window.innerHeight;

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = width * pixelRatio;

    canvas.height = height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    createParticles();

    drawNetwork(false);

  }

  function createParticles() {

    particles = [];

    const count = width < 760 ? 30 : 65;

    for (let i = 0; i < count; i++) {

      particles.push({

        x: Math.random() * width,

        y: Math.random() * height,

        vx: (Math.random() - 0.5) * 0.45,

        vy: (Math.random() - 0.5) * 0.45,

        radius: Math.random() * 1.8 + 0.8

      });

    }

  }

  function drawNetwork(moveParticles) {

    ctx.clearRect(0, 0, width, height);

    const lightMode =
      document.body.classList.contains("light-mode");

    const color = lightMode
      ? "85, 69, 199"
      : "182, 176, 255";

    particles.forEach((particle) => {

      if (moveParticles) {

        particle.x += particle.vx;

        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) {

          particle.vx *= -1;

          particle.x = Math.max(0, Math.min(width, particle.x));

        }

        if (particle.y < 0 || particle.y > height) {

          particle.vy *= -1;

          particle.y = Math.max(0, Math.min(height, particle.y));

        }

      }

      ctx.beginPath();

      ctx.arc(
        particle.x,
        particle.y,
        particle.radius,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = `rgba(${color}, 0.45)`;

      ctx.fill();

    });

    for (let i = 0; i < particles.length; i++) {

      for (let j = i + 1; j < particles.length; j++) {

        const dx = particles[i].x - particles[j].x;

        const dy = particles[i].y - particles[j].y;

        const distance = Math.hypot(dx, dy);

        if (distance < 130) {

          ctx.beginPath();

          ctx.moveTo(particles[i].x, particles[i].y);

          ctx.lineTo(particles[j].x, particles[j].y);

          ctx.strokeStyle =
            `rgba(${color}, ${0.18 * (1 - distance / 130)})`;

          ctx.lineWidth = 0.7;

          ctx.stroke();

        }

      }

    }

    if (mouse.x !== null && moveParticles) {

      particles.forEach((particle) => {

        const distance = Math.hypot(
          particle.x - mouse.x,
          particle.y - mouse.y
        );

        if (distance < 150) {

          ctx.beginPath();

          ctx.moveTo(particle.x, particle.y);

          ctx.lineTo(mouse.x, mouse.y);

          ctx.strokeStyle =
            `rgba(${color}, ${0.25 * (1 - distance / 150)})`;

          ctx.stroke();

        }

      });

    }

  }

  function animateNetwork() {

    drawNetwork(true);

    animationId = requestAnimationFrame(animateNetwork);

  }

  function updateAnimation() {

    if (animationId !== null) {

      cancelAnimationFrame(animationId);

      animationId = null;

    }

    if (motionPreference.matches || document.hidden) {

      drawNetwork(false);

    } else {

      animateNetwork();

    }

  }

  window.addEventListener("mousemove", (event) => {

    mouse.x = event.clientX;

    mouse.y = event.clientY;

  }, { passive: true });

  document.addEventListener("mouseleave", () => {

    mouse.x = null;

    mouse.y = null;

  });

  window.addEventListener("resize", resizeCanvas);

  document.addEventListener("visibilitychange", updateAnimation);

  motionPreference.addEventListener("change", updateAnimation);

  themeToggle.addEventListener("click", () => {

    drawNetwork(false);

  });

  resizeCanvas();

  updateAnimation();

}

/* =========================
   CONTACT FORM
========================= */

const contactForm = document.getElementById("contact-form");

const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", (event) => {

  event.preventDefault();

  const name = document.getElementById("name").value.trim();

  const email = document.getElementById("email").value.trim();

  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {

    formStatus.textContent = "Please fill all fields.";

    return;

  }

  const subject = encodeURIComponent(
    "Portfolio Contact - " + name
  );

  const body = encodeURIComponent(

    "Name: " + name + "\n" +

    "Email: " + email + "\n\n" +

    "Message:\n" + message

  );

  const mailLink =
    `mailto:aashihashini111@gmail.com?subject=${subject}&body=${body}`;

  formStatus.textContent =
    "Opening your email application. Please send the message there.";

  window.location.href = mailLink;

});
