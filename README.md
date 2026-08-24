# Velvet Secret — Shopify theme (SEO build)

A Shopify Online Store 2.0 theme for an adult toy / intimate wellness store,
built with technical SEO as the primary constraint.

## Install

**From GitHub:** Shopify admin → Online Store → Themes → Add theme → Connect from
GitHub → pick this repository and the `main` branch.

**From ZIP:** Add theme → Upload zip file.

## What changed in 3.0.x, and why

### Bugs that were actively suppressing rankings

| Fixed | Problem |
| --- | --- |
| `assets/theme.js` | Set `document.title` to one hardcoded string on every page. Google renders JavaScript, so every URL in the store collapsed to an identical title. It also overwrote every logo and footer image `alt`. Both removed — titles and alt text are now rendered server side and left untouched. |
| Templates | Only `templates/index.json` existed. Product and collection pages — where nearly all ecommerce organic traffic lands — had no template at all. All nine core templates now exist. |
| Section schema | `main-index.liquid` had no `{% schema %}`, which a JSON template requires. |
| Homepage title | `page_title \| default: '…'` was dead code: Shopify always populates `page_title`, so the keyword-rich title never rendered. It is now applied only when the merchant has not set their own SEO title. |
| Newsletter form | The old JS called `preventDefault()` and faked a success message, so no signup was ever recorded. |
| Cart count | Read from `localStorage` instead of the real cart, showing a made-up number. Now reads `/cart.js`. |

### Found in the 3.0.1 deep review

| Fixed | Problem |
| --- | --- |
| `snippets/seo-head.liquid` | `{% if current_tags %}` was a bare truthiness test. In Liquid an **empty array is truthy** — only `nil` and `false` are falsy. If Shopify returns `[]` rather than `nil` on an untagged page, every collection, blog and article page would have been served `noindex`, removing the entire catalogue from Google. Now `current_tags != blank`, which is correct for both shapes. |
| `sections/header.liquid`, `sections/footer.liquid` | Used `linklists[section.settings.menu]`. A `link_list` setting returns a linklist **object** in current Shopify, and `linklists[object]` silently returns `nil` — the classic "my menu isn't rendering" bug. The top-bar menu and all three footer link columns were rendering empty. Both now resolve object *and* legacy handle. |
| `sections/hero.liquid` | Hardcoded fallback dimensions of `1600x800` against an asset that is actually `1000x444`, so the declared aspect ratio was wrong and caused the layout shift it was meant to prevent. The mobile `<source>` also had no `width`/`height`, so phones shifted when the 548x800 crop replaced the desktop ratio. |
| `sections/featured-collections.liquid`, `featured-products.liquid`, `blog-posts.liquid` | Same object-vs-handle bug as the menus, for `collection` and `blog` settings. |
| `snippets/seo-schema.liquid` | `BlogPosting` dates were formatted in the shop's timezone but suffixed `Z` (UTC), so every article declared the wrong publication instant. Now uses `%z`. |
| `snippets/seo-head.liquid` | A blank `page_title` would have produced a title beginning with a stray `" \| "`. |
| `sections/main-product.liquid` | Linked the product type to a `?filter.p.product_type=` URL, generating crawlable parameter duplicates of the collection. Now plain text. |
| `layout/password.liquid`, `templates/password.liquid` | Added. Development stores are password protected by default, so without this the first theme preview had nowhere to render. |

A gift card template was written and then **deliberately removed**: it depended on
a `generate_qr_code` filter that could not be verified as real, and shipping
unverified Liquid to fix a `noindex` page with no SEO value was the wrong trade.
Shopify falls back to its own gift card rendering.

### Indexing control

- `<meta name="robots">` per template. `search`, `cart`, `404`, gift card, password
  and all customer account pages are `noindex, follow`; so are tag-filtered
  collections and `/collections/vendors` / `/collections/types`. This is the classic
  Shopify duplicate-content leak.
- `templates/robots.txt.liquid` extends Shopify's defaults with `/search`, `?q=`,
  `?view=` and `/apps/`. Faceted `?filter.*` URLs are deliberately left crawlable
  but noindexed, so Google can follow links through to products without indexing
  the filtered duplicates.
- Self-referencing canonical on every page, pagination-aware (`– Page 2` in the title).
- `hreflang` alternates plus `x-default`, emitted only on multi-locale stores.

### Structured data

| Schema | Where |
| --- | --- |
| `Organization` (+ `sameAs`), `WebSite` + `SearchAction` | every page |
| `BreadcrumbList` | every page except the homepage, matching the visible breadcrumbs |
| `Product` / `AggregateOffer` with price, currency, availability, SKU, GTIN | product pages |
| `ItemList` | collection pages |
| `BlogPosting` | article pages |
| `FAQPage` | homepage, generated from the same blocks that render on screen |

FAQ markup is emitted from `sections/faq.liquid` rather than a central snippet
specifically so it can never describe answers that are not visible — Google
requires the content to be on the page.

### Page structure

- Exactly one `<h1>` per template: hero heading on the homepage, product title,
  collection title, article title.
- `h2` for sections, `h3` for items. No skipped levels.
- Visible breadcrumbs on every non-homepage template.
- Descriptive anchor text everywhere. The old homepage had six identical
  "View products" links; anchors now read "Shop vibrators", "Read: <article title>".
- `snippets/keyword-index.liquid` is a crawlable category hub on the homepage,
  collection pages, search and 404. It only renders collections that actually
  exist, so it cannot create broken internal links.
- Skip link, `aria-current` on the active nav item, labelled form controls,
  `visually-hidden` text on icon-only controls.

### Core Web Vitals

- Google Fonts moved out of a CSS `@import` (which creates a second
  render-blocking request chain) into a preloaded, async stylesheet in `<head>`.
- `preconnect` to `cdn.shopify.com` and `fonts.gstatic.com`.
- Every image has explicit `width`/`height` → no layout shift.
- Hero and the first collection card are `eager` + `fetchpriority="high"`;
  everything below the fold is `loading="lazy" decoding="async"`.
- `srcset` + `sizes` on hero, product, collection and article images, so phones no
  longer download desktop-sized files.
- `theme.js` is deferred.

### Keywords

English only. Editable in **Theme settings → SEO**, split into core, category and
guide groups, then assembled per template — product pages mix in the product title,
type and tags; collections mix in the collection title and its tags.

A note on expectations: the `keywords` meta tag is populated because it was asked
for, but Google has ignored it since 2009 and stuffing it does nothing. The keyword
work that actually moves rankings in this build is in the titles, the `h1`/`h2`
structure, the body copy in the rich-text and FAQ sections, and the internal link
text in the category hub.

## After installing — the parts only you can do

1. **Replace the hero image via the theme editor.** The bundled
   `assets/hero-desktop.png` is 787 KB, which is bad for Largest Contentful Paint.
   Uploading through Hero → Desktop image routes it through Shopify's CDN, which
   serves WebP with a proper `srcset`. The theme already handles this; the PNG is
   only a placeholder.
2. **Create the collections** listed in Theme settings → Category hub, or edit the
   handle list to match yours. Missing handles are skipped silently.
3. **Set up menus.** The header and footer read Shopify link lists (`main-menu` and
   friends) instead of hardcoded URLs, so nothing 404s.
4. **Write collection descriptions.** The fallback sentence is generic; a real
   description is one of the highest-value SEO edits available on a store.
5. **Submit `sitemap.xml`** in Google Search Console. Shopify generates it; the URL
   is in your `robots.txt`.
6. **Add an age gate** if your market requires one. This theme labels the store
   `rating: adult` and carries the RTA meta tag for SafeSearch, but does not include
   an 18+ interstitial.

## Known limitations

- **Classic customer account templates are not included** (`templates/customers/*`).
  If you enable classic accounts rather than Shopify's new customer accounts, those
  pages fall back to Shopify defaults. They are `noindex` anyway, so there is no SEO
  impact.
- **`rel="next"` / `rel="prev"` are not emitted.** Google stopped using them as an
  indexing signal in 2019, and Liquid cannot inject into `<head>` from inside a
  paginated section. Paginated pages get unique titles and self-canonicals instead.
- **Product rich results for adult items are at Google's discretion.** The markup is
  correct and valid; whether price/availability snippets are shown for adult products
  is a policy decision on Google's side, not a markup problem.
- Liquid tag balance, all section `{% schema %}` blocks, and every JSON file have
  been validated, and all `section`/`render` references resolve. The theme has not
  been rendered against a live store or run through Google's Rich Results Test —
  do both once installed.

## Structure

```
assets/          theme.css, theme.js, images
config/          settings_schema.json, settings_data.json
layout/          theme.liquid
locales/         en.default.json
sections/        header, footer, hero, featured-collections, featured-products,
                 trust-bar, keyword-hub, rich-text, faq, blog-posts, newsletter,
                 main-* (9 page templates)
snippets/        seo-head, seo-schema, breadcrumbs, product-card, keyword-index
templates/       index, product, collection, list-collections, page, blog,
                 article, cart, search, 404, robots.txt.liquid
```
