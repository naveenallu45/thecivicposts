# SEO Setup Guide for The Civic Posts

This guide will help you get your website indexed by Google and improve search visibility.

## ✅ Already Implemented

1. **Sitemap.xml** - Automatically generated at `/sitemap.xml` with all articles
2. **Robots.txt** - Configured at `/robots.txt` to allow search engines
3. **Structured Data** - JSON-LD schema for articles, organization, and breadcrumbs
4. **Meta Tags** - Open Graph and Twitter Cards for social sharing
5. **Canonical URLs** - Set on all pages to prevent duplicate content
6. **Breadcrumb Schema** - Added to article pages for better navigation

## 🔧 Required Actions

### 1. Google Search Console Setup (CRITICAL)

**Step 1:** Go to [Google Search Console](https://search.google.com/search-console)

**Step 2:** Add your property: `https://www.thecivicposts.com`

**Step 3:** Choose verification method: **HTML tag**

**Step 4:** Copy the verification code (it looks like: `ABC123xyz789...`)

**Step 5:** Update `app/layout.tsx`:
   - Find line 117: `google: 'YOUR-VERIFICATION-CODE-HERE',`
   - Replace `YOUR-VERIFICATION-CODE-HERE` with your actual code
   - Example: `google: 'ABC123xyz789...',`

**Step 6:** Deploy the changes and verify in Google Search Console

**Step 7:** Submit your sitemap:
   - In Google Search Console, go to "Sitemaps"
   - Add: `https://www.thecivicposts.com/sitemap.xml`
   - Click "Submit"

### 2. Environment Variable Check

Make sure your production environment has:
```env
NEXT_PUBLIC_SITE_URL=https://www.thecivicposts.com
```

**NOT** `http://localhost:3000` (this is only for local development)

### 3. Verify Sitemap is Accessible

Visit these URLs to verify they work:
- `https://www.thecivicposts.com/sitemap.xml`
- `https://www.thecivicposts.com/robots.txt`

### 4. Request Indexing

After setting up Google Search Console:

1. **Submit Homepage:**
   - In Google Search Console, use "URL Inspection" tool
   - Enter: `https://www.thecivicposts.com`
   - Click "Request Indexing"

2. **Submit Category Pages:**
   - Request indexing for:
     - `https://www.thecivicposts.com/news`
     - `https://www.thecivicposts.com/entertainment`
     - `https://www.thecivicposts.com/sports`
     - `https://www.thecivicposts.com/health-fitness`
     - `https://www.thecivicposts.com/editorial`
     - `https://www.thecivicposts.com/technology`
     - `https://www.thecivicposts.com/automobiles`

3. **Submit Sitemap:**
   - Google will automatically crawl all pages from the sitemap
   - This may take a few days to weeks

### 5. Create OG Image

Ensure you have an Open Graph image at:
- `public/og-image.jpg` (1200x630 pixels recommended)

This image appears when your site is shared on social media.

### 6. Monitor Indexing Status

**Check if pages are indexed:**
- Use Google Search: `site:thecivicposts.com`
- Check Google Search Console "Coverage" report
- Monitor "Performance" report for search queries

**Typical Timeline:**
- Initial indexing: 1-7 days
- Full sitemap crawl: 1-4 weeks
- Regular updates: Ongoing

## 📊 SEO Best Practices Already Implemented

✅ **Technical SEO:**
- Fast page load times (optimized images, caching)
- Mobile-responsive design
- HTTPS enabled
- Clean URL structure
- Proper HTTP status codes

✅ **On-Page SEO:**
- Unique titles and descriptions for each page
- Proper heading hierarchy (H1, H2, etc.)
- Alt text for images
- Internal linking structure

✅ **Structured Data:**
- NewsArticle schema for articles
- Organization schema
- BreadcrumbList schema
- WebSite schema with search action

✅ **Social Media:**
- Open Graph tags
- Twitter Card tags
- Social sharing buttons

## 🚀 Additional Recommendations

### 1. Content Quality
- Publish high-quality, original articles regularly
- Use relevant keywords naturally
- Write engaging headlines
- Include internal links to related articles

### 2. Backlinks
- Share articles on social media
- Reach out to other websites for guest posts
- Submit to news aggregators
- Create shareable content

### 3. Site Speed
- Already optimized, but monitor with:
  - [PageSpeed Insights](https://pagespeed.web.dev/)
  - Google Search Console Core Web Vitals

### 4. Analytics
- Set up Google Analytics to track traffic
- Monitor Google Search Console for search performance

## ⚠️ Common Issues & Solutions

**Issue:** Site not appearing in Google search
- **Solution:** 
  1. Verify Google Search Console setup
  2. Submit sitemap
  3. Request indexing for key pages
  4. Wait 1-2 weeks for initial indexing

**Issue:** Pages indexed but not ranking
- **Solution:**
  1. Improve content quality
  2. Add more relevant keywords
  3. Build backlinks
  4. Optimize page titles and descriptions

**Issue:** Duplicate content warnings
- **Solution:** Already handled with canonical URLs

## 📝 Checklist

- [ ] Add Google Search Console verification code to `app/layout.tsx`
- [ ] Verify `NEXT_PUBLIC_SITE_URL` is set correctly in production
- [ ] Submit sitemap in Google Search Console
- [ ] Request indexing for homepage and category pages
- [ ] Verify sitemap.xml is accessible
- [ ] Verify robots.txt is accessible
- [ ] Create/verify og-image.jpg exists
- [ ] Monitor Google Search Console for indexing status
- [ ] Set up Google Analytics (optional but recommended)

## 🔗 Useful Links

- [Google Search Console](https://search.google.com/search-console)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [PageSpeed Insights](https://pagespeed.web.dev/)

---

**Note:** SEO is a long-term process. It may take several weeks to months to see significant results. Be patient and continue publishing quality content regularly.
