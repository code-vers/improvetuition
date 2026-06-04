/* Sticky contact bar — appears after hero, hides at footer, hides when booking form is in viewport */
(function () {
  var bar = document.getElementById("contactBar");
  if (!bar) return;
  var hero = document.querySelector(
    ".hero, .home-hero, .gcse-hero, .page-hero, header.hero, [data-hero]",
  );
  var footer = document.querySelector(
    ".site-footer, footer.site-footer, footer",
  );
  var formCard = document.getElementById("book");
  var triggerPoint = 400;
  if (hero) {
    triggerPoint = hero.offsetTop + hero.offsetHeight - 100;
  }
  function update() {
    var scrolled = window.scrollY || window.pageYOffset;
    var viewportBottom = scrolled + window.innerHeight;
    var pastHero = scrolled > triggerPoint;
    var atFooter = false;
    if (footer) {
      atFooter = viewportBottom > footer.offsetTop + 60;
    }
    // Hide if any meaningful portion of the form card is in viewport
    var onForm = false;
    if (formCard) {
      var formTop = formCard.offsetTop;
      var formBottom = formTop + formCard.offsetHeight;
      // Form is "active" when its midpoint is within the lower 70% of the viewport
      var inView = formBottom > scrolled + 80 && formTop < viewportBottom - 100;
      onForm = inView;
    }
    if (pastHero && !atFooter && !onForm) {
      bar.classList.add("is-visible");
      document.body.classList.add("contact-bar-active");
    } else {
      bar.classList.remove("is-visible");
      document.body.classList.remove("contact-bar-active");
    }
  }
  var scheduled = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!scheduled) {
        scheduled = true;
        window.requestAnimationFrame(function () {
          update();
          scheduled = false;
        });
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", function () {
    if (hero) {
      triggerPoint = hero.offsetTop + hero.offsetHeight - 100;
    }
    update();
  });
  update();
})();
