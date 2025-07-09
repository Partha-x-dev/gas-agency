const menuBtn = document.querySelector('.menu-btn');
const menuIcon = menuBtn.querySelector('i');
const navigation = document.querySelector('.navigation');

menuBtn.addEventListener('click', () => {
    if (window.innerWidth <= 1040) {
        const isMenuOpen = navigation.style.display === 'flex';

        navigation.style.display = isMenuOpen ? 'none' : 'flex';
        menuIcon.className = isMenuOpen ? "fa-solid fa-bars" : 'fa-solid fa-xmark';
    }
});

window.addEventListener('click', (e) => {
    if (!menuBtn.contains(e.target) && !navigation.contains(e.target) && window.innerWidth <= 1040) {
        navigation.style.display = 'none';
        menuIcon.className = "fa-solid fa-bars";
    }
});

const contactForm = document.querySelector('#contact form');

contactForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = contactForm.querySelector('input[placeholder="Your name"]').value;
  const email = contactForm.querySelector('input[placeholder="Your email"]').value;
  const phone = contactForm.querySelector('input[placeholder="Your phone number"]').value;
  const message = contactForm.querySelector('textarea[placeholder="Your message"]').value;

  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Phone:", phone);
  console.log("Message:", message);

  alert("Message sent!");

  contactForm.reset();
});


const scrollRevealOption = {
    distance: "50px",
    duration: 1000,
    easing: "ease-in-out",
};

// Home section
ScrollReveal().reveal("#home .content h1", {
    ...scrollRevealOption,
    origin: "top",
});
ScrollReveal().reveal("#home .content p", {
    ...scrollRevealOption,
    delay: 500,
    origin: "bottom",
});
ScrollReveal().reveal("#home .content a", {
    ...scrollRevealOption,
    delay: 1000,
    origin: "bottom",
});

// About section
ScrollReveal().reveal("#about .about-image img", {
    ...scrollRevealOption,
    origin: "left",
});
ScrollReveal().reveal("#about .about-content h2", {
    ...scrollRevealOption,
    delay: 500,
    origin: "right",
});
ScrollReveal().reveal("#about .about-content p", {
    ...scrollRevealOption,
    delay: 1000,
    origin: "right",
});

// Services section
ScrollReveal().reveal("#precautions .pre-image img", {
    ...scrollRevealOption,
    origin: "right",
});
ScrollReveal().reveal("#precautions .pre-content p", {
    ...scrollRevealOption,
    delay: 500,
    origin: "left",
});
ScrollReveal().reveal("#precautions .pre-content p,h2", {
    ...scrollRevealOption,
    delay: 1000,
    origin: "left",
});
ScrollReveal().reveal("#precautions .pre-content .pre-list li", {
    ...scrollRevealOption,
    delay: 1500,
    origin: "left",
});
ScrollReveal().reveal("#contact .form-box h1,p,form", {
    ...scrollRevealOption,
    delay: 500,
    origin: "left",
}); ScrollReveal().reveal("#contact .map-box", {
    ...scrollRevealOption,
    delay: 1000,
    origin: "right",
}); 