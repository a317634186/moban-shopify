/*
  Velvet Secret — theme.js

  Progressive enhancement only. Deliberately does NOT touch document.title,
  meta tags or image alt attributes. The previous version overwrote the title on
  every page, so a rendering crawler saw one identical title across the whole
  store. Titles and alt text are rendered server side in Liquid and left alone.
*/
(function () {
  'use strict';

  /* ----------------------------------------------------------- mobile menu */
  var toggle = document.querySelector('[data-menu]');
  var nav = document.getElementById('MainNav');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* ------------------------------------------- real cart count from Shopify */
  function paintCartCount(count) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-cart-count]'), function (node) {
      node.textContent = count;
      node.hidden = count === 0;
    });
  }

  function cartUrl(path) {
    var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
    return root.replace(/\/$/, '') + path;
  }

  function refreshCart() {
    return fetch(cartUrl('/cart.js'), { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (cart) { if (cart) paintCartCount(cart.item_count); });
  }

  /* --------------------------------------- add to cart without a page reload */
  Array.prototype.forEach.call(document.querySelectorAll('form[action*="/cart/add"]'), function (form) {
    form.addEventListener('submit', function (event) {
      var button = form.querySelector('[type="submit"]');
      if (!button || !window.fetch) return; /* no JS path: normal form post */

      event.preventDefault();
      var original = button.innerHTML;
      button.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) {
          if (!r.ok) throw new Error('add-to-cart failed');
          button.innerHTML = '<span>Added to cart</span>';
          return refreshCart();
        })
        .then(function () {
          window.setTimeout(function () {
            button.innerHTML = original;
            button.disabled = false;
          }, 1400);
        })
        .catch(function () {
          button.disabled = false;
          form.submit();
        });
    });
  });

  /* --------------------------------------------- product variant deep-links */
  var variantSelect = document.getElementById('VariantSelect');
  if (variantSelect && window.history && window.history.replaceState) {
    variantSelect.addEventListener('change', function () {
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variantSelect.value);
        window.history.replaceState({}, '', url.toString());
      } catch (e) { /* older browsers: the form still posts the right variant */ }
    });
  }
})();
