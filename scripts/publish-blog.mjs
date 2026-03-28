/**
 * Publishes the Glitz & Glamour SEO blog article to the database.
 * Run this ON THE VPS from the app root:
 *   node scripts/publish-blog.mjs
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const post = {
  title: "Local Beauty Salon & Mobile Beauty Services in Vista, CA | Glitz & Glamour Studio",
  slug: "local-beauty-salon-mobile-services-vista-ca",
  excerpt: "Looking for a top-rated local beauty salon in Vista, CA? Glitz & Glamour Studio offers haircuts, nail services, waxing, and professional make-up — in-salon and mobile across all of San Diego County. Perfect for weddings, quinceañeras, proms, and everyday glamour.",
  coverImage: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
  published: true,
  author: "JoJany",
  seoConfig: JSON.stringify({
    metaTitle: "Local Beauty Salon & Mobile Beauty Services in Vista, CA | Glitz & Glamour Studio",
    metaDescription: "Glitz & Glamour Studio in Vista, CA offers haircuts, make-up, nails, and waxing — in-salon and mobile across San Diego County. Perfect for weddings, quinceañeras, proms, and more. Call 760-290-5910 to book today!",
    keywords: "Vista beauty salon, local hairstylist Vista CA, San Diego County beauty services, mobile make-up artist, wedding hair Vista, local nail tech Vista CA, waxing Vista CA, prom make-up Vista, quinceañera hair stylist, mobile beauty team San Diego"
  }),
  content: `
<article itemscope itemtype="https://schema.org/LocalBusiness">

<p itemprop="description" style="font-size:1.15rem;line-height:1.8;margin-bottom:1.5rem;">
  If you're searching for a <strong>local hairstylist</strong>, <strong>local nail tech</strong>, or trusted <strong>local beauty services in Vista, CA</strong>, look no further than <strong>Glitz &amp; Glamour Studio</strong>. Located at <span itemprop="address" itemscope itemtype="https://schema.org/PostalAddress"><span itemprop="streetAddress">812 Frances Dr</span>, <span itemprop="addressLocality">Vista</span>, <span itemprop="addressRegion">CA</span> <span itemprop="postalCode">92084</span></span>, we serve all of <strong>San Diego County</strong> with both in-salon luxury and on-the-go mobile beauty care.
</p>

---

<h2>Your Trusted Local Beauty Salon in Vista, CA</h2>
<p>Our talented team of <strong>local hairstylists</strong>, <strong>certified nail technicians</strong>, and <strong>professional make-up artists</strong> combine genuine expertise with a warm, welcoming atmosphere so every visit feels like a treat.</p>

<div style="margin:2rem 0;">
  <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1000&q=80" alt="Beautiful salon interior in Vista California" style="width:100%;border-radius:14px;object-fit:cover;max-height:420px;" loading="lazy" />
</div>

<h3>Salon Services at Glitz &amp; Glamour Studio</h3>
<ul>
  <li>✂️ <strong>Local Haircuts &amp; Styling</strong> — precision cuts, blowouts, and styling for all hair types</li>
  <li>🎨 <strong>Hair Coloring, Highlights &amp; Balayage</strong> — expert color services from subtle to bold</li>
  <li>💅 <strong>Full Nail Services</strong> — manicures, pedicures, gel polish, acrylic sets, dip powder &amp; nail art</li>
  <li>🧖 <strong>Waxing</strong> — gentle facial and body waxing for smooth, radiant skin</li>
  <li>💄 <strong>Make-up Services</strong> — flawless everyday looks and full glam for special events</li>
</ul>

<blockquote style="border-left:4px solid #FF2D78;padding:1rem 1.5rem;background:#fff0f5;border-radius:8px;margin:2rem 0;">
  <p style="margin:0;font-style:italic;">"Every client who walks into Glitz &amp; Glamour Studio leaves feeling more confident, more beautiful, and fully themselves."</p>
</blockquote>

---

<h2>Mobile Beauty Services Across All of San Diego County</h2>
<p>Our <strong>mobile beauty team</strong> brings the full Glitz &amp; Glamour experience directly to you — at your home, hotel, or event venue anywhere across San Diego County.</p>

<div style="margin:2rem 0;display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
  <img src="https://images.unsplash.com/photo-1519741497674-611481863552?w=700&q=80" alt="Bridal hair and make-up mobile beauty service San Diego" style="width:100%;border-radius:14px;object-fit:cover;height:300px;" loading="lazy" />
  <img src="https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=700&q=80" alt="Professional make-up artist mobile services Vista CA" style="width:100%;border-radius:14px;object-fit:cover;height:300px;" loading="lazy" />
</div>

<h3>Mobile Beauty — Perfect For:</h3>
<ul>
  <li>💍 <strong>Weddings &amp; Bridal Parties</strong> — on-site hair, make-up, and nails for the entire bridal party</li>
  <li>🌹 <strong>Quinceañeras</strong> — full beauty preparation for the guest of honor and her court</li>
  <li>🎓 <strong>Proms &amp; Graduations</strong> — unforgettable looks for your biggest nights</li>
  <li>📸 <strong>Professional Photo &amp; Video Shoots</strong> — camera-ready beauty that lasts all day</li>
  <li>🎉 <strong>Girls' Nights &amp; Private Events</strong> — group pampering wherever you celebrate</li>
</ul>

---

<h2>Why San Diego County Clients Choose Glitz &amp; Glamour Studio</h2>

<div style="margin:2rem 0;">
  <img src="https://images.unsplash.com/photo-1470259078422-826894b933aa?w=1000&q=80" alt="Happy clients at Vista beauty salon Glitz and Glamour" style="width:100%;border-radius:14px;object-fit:cover;max-height:380px;" loading="lazy" />
</div>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:1.2rem;margin:1.5rem 0;">
  <div style="background:#fff0f5;border-radius:12px;padding:1.2rem;">
    <h4 style="color:#FF2D78;margin-top:0;">💇 Local Expertise</h4>
    <p style="margin:0;">Skilled stylists deeply rooted in Vista who understand local styles and trends.</p>
  </div>
  <div style="background:#fff0f5;border-radius:12px;padding:1.2rem;">
    <h4 style="color:#FF2D78;margin-top:0;">💅 Salon &amp; Mobile Options</h4>
    <p style="margin:0;">Come to our Vista salon — or let us come to you anywhere in San Diego County.</p>
  </div>
  <div style="background:#fff0f5;border-radius:12px;padding:1.2rem;">
    <h4 style="color:#FF2D78;margin-top:0;">💍 Event Beauty Specialists</h4>
    <p style="margin:0;">Trusted by hundreds of brides, quinceañera queens, and prom-goers for flawless looks.</p>
  </div>
  <div style="background:#fff0f5;border-radius:12px;padding:1.2rem;">
    <h4 style="color:#FF2D78;margin-top:0;">🌟 All-in-One Beauty</h4>
    <p style="margin:0;">Hair, nails, waxing, and make-up — everything under one roof (or at your door).</p>
  </div>
</div>

---

<h2>Frequently Asked Questions — Vista Beauty Salon</h2>

<details style="margin-bottom:1rem;border:1px solid #f0c0d0;border-radius:10px;padding:1rem;">
  <summary style="font-weight:700;cursor:pointer;color:#FF2D78;">Does Glitz &amp; Glamour offer mobile beauty services across San Diego County?</summary>
  <p style="margin-top:0.75rem;">Yes! We serve Oceanside, Carlsbad, Escondido, San Marcos, Encinitas, and greater San Diego. Contact us to confirm availability for your date and location.</p>
</details>

<details style="margin-bottom:1rem;border:1px solid #f0c0d0;border-radius:10px;padding:1rem;">
  <summary style="font-weight:700;cursor:pointer;color:#FF2D78;">Do you do weddings and quinceañeras in Vista, CA?</summary>
  <p style="margin-top:0.75rem;">Absolutely. We specialize in full-party event beauty for weddings and quinceañeras — mobile or in-salon, we make it seamless.</p>
</details>

<details style="margin-bottom:1rem;border:1px solid #f0c0d0;border-radius:10px;padding:1rem;">
  <summary style="font-weight:700;cursor:pointer;color:#FF2D78;">How do I book an appointment?</summary>
  <p style="margin-top:0.75rem;">Book at <a href="https://glitzandglamours.com/book" style="color:#FF2D78;">glitzandglamours.com/book</a>, call <a href="tel:+17602905910" style="color:#FF2D78;">760-290-5910</a>, or visit 812 Frances Dr, Vista, CA 92084.</p>
</details>

<details style="margin-bottom:1rem;border:1px solid #f0c0d0;border-radius:10px;padding:1rem;">
  <summary style="font-weight:700;cursor:pointer;color:#FF2D78;">What nail services do you offer?</summary>
  <p style="margin-top:0.75rem;">Classic manicures &amp; pedicures, gel polish, acrylic full sets and fills, dip powder, and detailed nail art.</p>
</details>

---

<h2>Book Your Appointment Today</h2>

<div style="background:linear-gradient(135deg,#1a0a12,#3a0f20);color:#fff;border-radius:16px;padding:2rem;text-align:center;margin:2rem 0;">
  <h3 style="color:#FF2D78;margin-top:0;">📍 Glitz &amp; Glamour Studio</h3>
  <p style="margin:0.5rem 0;">812 Frances Dr, Vista, CA 92084</p>
  <p style="margin:0.5rem 0;">📞 <a href="tel:+17602905910" style="color:#FF2D78;font-weight:700;">760-290-5910</a></p>
  <p style="margin:0.5rem 0;">💄 Local Salon &amp; Mobile Beauty Services — Vista, CA | San Diego County</p>
  <a href="/book" style="display:inline-block;margin-top:1.25rem;background:#FF2D78;color:#fff;padding:0.85rem 2.5rem;border-radius:50px;font-weight:700;font-size:1rem;text-decoration:none;">Book Your Appointment →</a>
</div>

<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;margin-top:2rem;">
  <img src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500&q=75" alt="Nail art and manicure services Vista CA" style="width:100%;border-radius:10px;object-fit:cover;height:180px;" loading="lazy" />
  <img src="https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=500&q=75" alt="Wedding hair and make-up San Diego County" style="width:100%;border-radius:10px;object-fit:cover;height:180px;" loading="lazy" />
  <img src="https://images.unsplash.com/photo-1503236823255-94609f598e71?w=500&q=75" alt="Beauty salon haircut and color Vista California" style="width:100%;border-radius:10px;object-fit:cover;height:180px;" loading="lazy" />
</div>

</article>

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BeautySalon","name":"Glitz & Glamour Studio","image":"https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80","url":"https://glitzandglamours.com","telephone":"+17602905910","address":{"@type":"PostalAddress","streetAddress":"812 Frances Dr","addressLocality":"Vista","addressRegion":"CA","postalCode":"92084","addressCountry":"US"},"geo":{"@type":"GeoCoordinates","latitude":33.1813,"longitude":-117.2342},"areaServed":"San Diego County, CA","priceRange":"$$","hasOfferCatalog":{"@type":"OfferCatalog","name":"Beauty Services","itemListElement":[{"@type":"Offer","itemOffered":{"@type":"Service","name":"Haircut & Styling"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Hair Coloring & Highlights"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Manicure & Pedicure"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Waxing Services"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Make-up Services"}},{"@type":"Offer","itemOffered":{"@type":"Service","name":"Mobile Beauty Services"}}]},"sameAs":["https://www.instagram.com/glitzandglamours"]}
</script>
`
};

async function main() {
  const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
  if (existing) {
    console.log(`Post already exists (id: ${existing.id}), updating...`);
    await prisma.blogPost.update({ where: { slug: post.slug }, data: post });
    console.log(`✅ Updated: https://glitzandglamours.com/blog/${post.slug}`);
  } else {
    const created = await prisma.blogPost.create({ data: post });
    console.log(`✅ Published: https://glitzandglamours.com/blog/${post.slug} (id: ${created.id})`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
